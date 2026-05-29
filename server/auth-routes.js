const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  esEspecialidadValida,
  validarPasswordRegistro,
  validarTelefonoCo,
} = require('./especialidad-empleado');
const { validarYNormalizarNitPh } = require('./nit-colombia');
const { getJwtSecret } = require('./jwt-config');

/** Deben coincidir con el ENUM `rol` de la tabla `usuarios` en MySQL. */
const ROL_EMPLEADO = process.env.DB_ROL_EMPLEADO || 'Empleado';
const ROL_CLIENTE = process.env.DB_ROL_CLIENTE || 'Cliente';
const ESTADO_LABORAL_DEFAULT = process.env.DB_ESTADO_LABORAL_DEFAULT || 'Activo';

/**
 * @param {import('express').Express} app
 * @param {import('mysql2/promise').Pool} pool
 */
function registerAuthRoutes(app, pool) {
  const JWT_SECRET = getJwtSecret();
  const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

  app.post('/api/auth/register', async (req, res) => {
    const tipo = String(req.body?.tipo ?? '').toLowerCase();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const nombreCompleto = String(req.body?.nombreCompleto ?? '').trim();
    const telefono = String(req.body?.telefono ?? '').replace(/\D/g, '').slice(0, 10);

    try {
      if (!email || !password || !nombreCompleto || !telefono) {
        return res.status(400).json({
          error: 'Completa nombre, correo, teléfono y contraseña.',
        });
      }

      if (nombreCompleto.length > 50) {
        return res.status(400).json({ error: 'El nombre no debe exceder los 50 caracteres.' });
      }
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreCompleto)) {
        return res.status(400).json({ error: 'El nombre no debe contener números ni caracteres especiales.' });
      }
      if (email.length > 100) {
        return res.status(400).json({ error: 'El correo no debe exceder los 100 caracteres.' });
      }
      if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
        return res.status(400).json({ error: 'El correo debe ser obligatorio @gmail.com.' });
      }

      const errPass = validarPasswordRegistro(password);
      if (errPass) return res.status(400).json({ error: errPass });

      const errTel = validarTelefonoCo(telefono);
      if (errTel) return res.status(400).json({ error: errTel });

      const hash = await bcrypt.hash(password, 10);
      const conn = await pool.getConnection();

      try {
        await conn.beginTransaction();

        if (tipo === 'empleado') {
          const especialidad = String(req.body?.especialidad ?? '').trim();
          if (!especialidad || !esEspecialidadValida(especialidad)) {
            await conn.rollback();
            return res.status(400).json({
              error: 'Selecciona una especialidad válida de la lista.',
            });
          }

          const [ur] = await conn.execute(
            `INSERT INTO usuarios (rol, email, password, nombre_completo, telefono, especialidad, estado_laboral)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [ROL_EMPLEADO, email, hash, nombreCompleto, telefono, especialidad, ESTADO_LABORAL_DEFAULT],
          );
          const uid = Number(ur.insertId);
          if (!Number.isFinite(uid) || uid <= 0) {
            throw new Error('INSERT usuarios sin id');
          }
        } else if (tipo === 'cliente') {
          const subtipo = String(req.body?.tipoCliente ?? 'natural').toLowerCase();
          const tipoClienteDb =
            subtipo === 'propiedad_horizontal' ? 'Propiedad horizontal' : 'Natural';

          let nitPh =
            req.body?.nitPh != null && String(req.body.nitPh).trim() !== ''
              ? String(req.body.nitPh).trim()
              : null;
          let personaContacto =
            req.body?.personaContacto != null ? String(req.body.personaContacto).trim() : '';

          const direccion =
            req.body?.direccion != null ? String(req.body.direccion).trim() : '';

          if (tipoClienteDb === 'Propiedad horizontal') {
            const nitRes = validarYNormalizarNitPh(nitPh ?? '');
            if (!nitRes.ok) {
              await conn.rollback();
              return res.status(400).json({ error: nitRes.error });
            }
            nitPh = nitRes.nit;
          }
          if (tipoClienteDb === 'Natural') {
            nitPh = null;
            personaContacto = null;
          } else {
            personaContacto = personaContacto || null;
          }

          const [ur] = await conn.execute(
            `INSERT INTO usuarios (rol, email, password, nombre_completo, telefono, especialidad, estado_laboral)
             VALUES (?, ?, ?, ?, ?, NULL, ?)`,
            [ROL_CLIENTE, email, hash, nombreCompleto, telefono, ESTADO_LABORAL_DEFAULT],
          );
          const uid = Number(ur.insertId);
          if (!Number.isFinite(uid) || uid <= 0) {
            throw new Error('INSERT usuarios sin id');
          }

          await conn.execute(
            `INSERT INTO clientes (id_usuario, direccion, tipo_cliente, nit_ph, persona_contacto)
             VALUES (?, ?, ?, ?, ?)`,
            [uid, direccion || null, tipoClienteDb, nitPh, personaContacto],
          );
        } else {
          await conn.rollback();
          return res.status(400).json({ error: 'Tipo de registro no válido.' });
        }

        await conn.commit();
        res.status(201).json({ ok: true });
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
      }
      console.error('[auth/register]', err.code, err.sqlMessage || err.message);
      res.status(500).json({ error: 'No se pudo completar el registro.' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const email = String(req.body?.email ?? '').trim().toLowerCase();
      const password = String(req.body?.password ?? '');
      if (!email || !password) {
        return res.status(400).json({ error: 'Indica correo y contraseña.' });
      }

      const [rows] = await pool.execute(
        `SELECT id, email, password, rol, nombre_completo FROM usuarios WHERE email = ?`,
        [email],
      );

      const user = rows[0];
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Credenciales incorrectas.' });
      }

      const rolStr = user.rol != null ? String(user.rol) : '';

      const token = jwt.sign({ sub: user.id, rol: rolStr }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES,
      });

      res.json({
        token,
        usuario: {
          id: user.id,
          email: user.email,
          rol: rolStr,
          nombreCompleto: user.nombre_completo != null ? String(user.nombre_completo) : '',
        },
      });
    } catch (err) {
      console.error('[auth/login]', err.code, err.sqlMessage || err.message);
      res.status(500).json({ error: 'No se pudo iniciar sesión.' });
    }
  });
}

module.exports = registerAuthRoutes;

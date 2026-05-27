const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('./jwt-config');

const ROL_EMPLEADO = process.env.DB_ROL_EMPLEADO || 'Empleado';

/**
 * @param {import('express').Express} app
 * @param {import('mysql2/promise').Pool} pool
 */
function registerEmpleadoRoutes(app, pool) {
  const JWT_SECRET = getJwtSecret();

  /** @type {import('express').RequestHandler} */
  function requireEmpleado(req, res, next) {
    const h = req.headers.authorization;
    const raw = h != null && typeof h === 'string' ? h.trim() : '';
    if (!raw.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ error: 'Sesión requerida. Inicia sesión de nuevo.' });
    }
    const token = raw.slice(7).trim();
    if (!token) {
      return res.status(401).json({ error: 'Sesión requerida. Inicia sesión de nuevo.' });
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const sub = payload.sub;
      const rol = payload.rol != null ? String(payload.rol) : '';
      const uid = Number(sub);
      if (!Number.isFinite(uid) || uid <= 0) {
        return res.status(401).json({ error: 'Sesión no válida.' });
      }
      if (rol !== ROL_EMPLEADO) {
        return res.status(403).json({ error: 'Solo el personal autorizado puede acceder a este recurso.' });
      }
      req.empleadoId = uid;
      next();
    } catch {
      return res.status(401).json({ error: 'Sesión expirada o no válida.' });
    }
  }

  app.get('/api/empleado/mi-perfil', requireEmpleado, async (req, res) => {
    try {
      const id = req.empleadoId;
      const [rows] = await pool.execute(
        `SELECT nombre_completo, email, telefono, especialidad, estado_laboral
         FROM usuarios WHERE id = ? AND rol = ?`,
        [id, ROL_EMPLEADO],
      );
      const row = rows[0];
      if (!row) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }
      res.json({
        nombreCompleto: row.nombre_completo != null ? String(row.nombre_completo) : '',
        email: row.email != null ? String(row.email) : '',
        telefono: row.telefono != null ? String(row.telefono) : '',
        especialidad: row.especialidad != null ? String(row.especialidad) : '',
        estadoLaboral: row.estado_laboral != null ? String(row.estado_laboral) : '',
      });
    } catch (err) {
      console.error('[api/empleado/mi-perfil]', err.code, err.sqlMessage || err.message);
      res.status(500).json({ error: 'No se pudo cargar el perfil.' });
    }
  });

  app.get('/api/empleado/mis-agendamientos', requireEmpleado, async (req, res) => {
    try {
      const year = Number.parseInt(String(req.query.year ?? ''), 10);
      const y = Number.isFinite(year) && year >= 2000 && year <= 2100 ? year : new Date().getFullYear();
      const id = req.empleadoId;

      const [rows] = await pool.execute(
        `SELECT
           a.id,
           a.fecha_programada,
           a.fecha_fin_servicio,
           a.estado,
           s.nombre AS servicio_nombre,
           COALESCE(NULLIF(TRIM(a.nombre_cliente), ''), uc.nombre_completo) AS cliente_nombre
         FROM agendamientos a
         INNER JOIN servicios s ON s.id = a.id_servicio
         INNER JOIN clientes c ON c.id = a.id_cliente
         INNER JOIN usuarios uc ON uc.id = c.id_usuario
         WHERE a.id_empleado = ?
           AND YEAR(a.fecha_programada) = ?
         ORDER BY a.fecha_programada ASC`,
        [id, y],
      );

      const out = rows.map((r) => ({
        id: r.id,
        fechaProgramada: r.fecha_programada,
        fechaFinServicio: r.fecha_fin_servicio,
        estado: r.estado != null ? String(r.estado) : '',
        servicioNombre: r.servicio_nombre != null ? String(r.servicio_nombre) : '',
        clienteNombre: r.cliente_nombre != null ? String(r.cliente_nombre) : '',
      }));

      res.json(out);
    } catch (err) {
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        console.error(
          '[api/empleado/mis-agendamientos] Falta columna fecha_fin_servicio. Ejecuta database/migrate_agendamiento_fecha_fin.sql',
        );
        return res.status(500).json({
          error:
            'La base de datos no está actualizada. Ejecuta la migración migrate_agendamiento_fecha_fin.sql.',
        });
      }
      console.error('[api/empleado/mis-agendamientos]', err.code, err.sqlMessage || err.message);
      res.status(500).json({ error: 'No se pudieron cargar los agendamientos.' });
    }
  });
}

module.exports = { registerEmpleadoRoutes };

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const Busboy = require('busboy');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const UPLOAD_ROOT = path.join(__dirname, 'uploads');
const CV_DIR = path.join(UPLOAD_ROOT, 'cv');
fs.mkdirSync(CV_DIR, { recursive: true });

/** Evita rutas tipo ../../ fuera de la carpeta de destino */
function safePdfBasename(originalname) {
  const base = path.basename(originalname || 'cv.pdf');
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
  const withPdf = cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned}.pdf`;
  return withPdf.length > 160 ? `${withPdf.slice(0, 150)}.pdf` : withPdf;
}

/**
 * Parseo multipart sin depender del chequeo `hasBody` de type-is/multer,
 * que en algunos clientes deja los campos de texto vacíos.
 */
function parsePostulacionMultipart(req) {
  return new Promise((resolve, reject) => {
    const ct = req.headers['content-type'];
    if (!ct || !String(ct).toLowerCase().includes('multipart/form-data')) {
      reject(Object.assign(new Error('Envío inválido: el formulario debe ser multipart/form-data.'), { statusCode: 400 }));
      return;
    }

    const bb = Busboy({
      headers: req.headers,
      limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024,
        fields: 12,
        fieldNameSize: 200,
        fieldSize: 1024 * 1024,
      },
      defParamCharset: 'utf8',
    });

    const fields = Object.create(null);
    let cvMeta = null;
    let pendingWrites = 0;
    let closed = false;
    let pdfRejected = false;
    let settled = false;

    function finishOk(payload) {
      if (settled) return;
      settled = true;
      resolve(payload);
    }

    function finishErr(err) {
      if (settled) return;
      settled = true;
      reject(err);
    }

    function maybeFinish() {
      if (!closed || pendingWrites > 0) return;
      if (pdfRejected) {
        finishErr(Object.assign(new Error('Solo se permiten archivos PDF.'), { statusCode: 400 }));
        return;
      }
      finishOk({ fields, cvMeta });
    }

    bb.on('field', (name, val) => {
      if (name != null) fields[name] = val;
    });

    bb.on('file', (name, stream, info) => {
      if (name !== 'cv') {
        stream.resume();
        return;
      }

      const mime = info.mimeType || '';
      if (mime !== 'application/pdf') {
        pdfRejected = true;
        stream.resume();
        return;
      }

      pendingWrites += 1;
      const filename = `${Date.now()}-${safePdfBasename(info.filename)}`;
      const destPath = path.join(CV_DIR, filename);
      const ws = fs.createWriteStream(destPath);
      let limitReached = false;

      stream.on('limit', () => {
        if (limitReached) return;
        limitReached = true;
        pendingWrites -= 1;
        try {
          ws.destroy();
        } catch (_) {}
        try {
          if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        } catch (_) {}
        finishErr(Object.assign(new Error('El PDF supera el tamaño máximo (5 MB).'), { statusCode: 400 }));
      });

      stream.on('error', (err) => {
        if (limitReached) return;
        pendingWrites -= 1;
        try {
          ws.destroy();
        } catch (_) {}
        try {
          if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        } catch (_) {}
        finishErr(err);
      });

      ws.on('error', (err) => {
        if (limitReached) return;
        pendingWrites -= 1;
        try {
          if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        } catch (_) {}
        finishErr(err);
      });

      ws.on('finish', () => {
        if (limitReached) return;
        cvMeta = { absPath: destPath, storedRelative: `uploads/cv/${filename}` };
        pendingWrites -= 1;
        maybeFinish();
      });

      stream.pipe(ws);
    });

    bb.on('error', (err) => finishErr(err));

    bb.on('close', () => {
      closed = true;
      maybeFinish();
    });

    req.pipe(bb);
  });
}

app.use('/uploads', express.static(UPLOAD_ROOT));

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3308),
  user: process.env.DB_USER ?? 'torreal_admin',
  password: process.env.DB_PASSWORD ?? 'admin123',
  database: process.env.DB_NAME ?? 'torreal_db',
  waitForConnections: true,
  connectionLimit: 10,
});

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: rows[0]?.ok === 1 });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/servicios', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, descripcion FROM servicios ORDER BY id',
    );
    res.json(rows);
  } catch (err) {
    console.error('[api/servicios]', err);
    res.status(500).json({ error: 'No se pudieron leer los servicios.' });
  }
});

app.post('/api/postulaciones', async (req, res) => {
  let uploadedAbsPath = null;

  try {
    const { fields, cvMeta } = await parsePostulacionMultipart(req);

    const nombreCompleto = String(fields.nombreCompleto ?? '').trim();
    const correo = String(fields.correoElectronico ?? '').trim();

    if (!nombreCompleto || !correo) {
      if (cvMeta?.absPath && fs.existsSync(cvMeta.absPath)) {
        try {
          fs.unlinkSync(cvMeta.absPath);
        } catch (_) {}
      }
      return res.status(400).json({ error: 'Indica nombre completo y correo electrónico.' });
    }

    const archivoCvUrl = cvMeta ? cvMeta.storedRelative.slice(0, 255) : null;
    if (cvMeta?.absPath) uploadedAbsPath = cvMeta.absPath;

    const [result] = await pool.execute(
      `INSERT INTO postulaciones (nombre_completo, correo, archivo_cv_url)
       VALUES (?, ?, ?)`,
      [nombreCompleto, correo, archivoCvUrl],
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    const status = typeof err.statusCode === 'number' ? err.statusCode : 500;
    if (uploadedAbsPath && fs.existsSync(uploadedAbsPath)) {
      try {
        fs.unlinkSync(uploadedAbsPath);
      } catch (_) {}
    }

    if (status >= 500) {
      console.error('[postulaciones]', err);
      res.status(500).json({
        error: 'No se pudo guardar la postulación.',
      });
      return;
    }

    res.status(status).json({
      error: err.message || 'Solicitud inválida.',
    });
  }
});

const registerAuthRoutes = require('./auth-routes');
registerAuthRoutes(app, pool);

const { registerEmpleadoRoutes } = require('./empleado-routes');
registerEmpleadoRoutes(app, pool);

const port = Number(process.env.API_PORT ?? 3000);
app.listen(port, () => {
  console.log(`API Torreal escuchando en http://localhost:${port}`);
});

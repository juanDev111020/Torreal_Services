CREATE DATABASE IF NOT EXISTS torreal_db;
USE torreal_db;

-- Modelo ERD: un solo `usuarios` (empleados y clientes); sin tabla `roles` ni `empleados`.

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol ENUM('Administrador', 'Empleado', 'Cliente') NOT NULL DEFAULT 'Cliente',
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    especialidad VARCHAR(100),
    estado_laboral ENUM('Activo', 'Inactivo', 'En Servicio') DEFAULT 'Activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    direccion VARCHAR(255),
    tipo_cliente ENUM('Natural', 'Propiedad horizontal') DEFAULT 'Natural',
    nit_ph VARCHAR(50),
    persona_contacto VARCHAR(150),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado ENUM('Disponible', 'No Disponible') DEFAULT 'Disponible'
);

CREATE TABLE tarifas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_servicio INT NOT NULL,
    tipo_cobro ENUM('Por Hora', 'Por Tarea', 'Mensualidad') NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id) ON DELETE CASCADE
);

CREATE TABLE agendamientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_servicio INT NOT NULL,
    id_empleado INT,
    fecha_programada DATETIME NOT NULL,
    fecha_fin_servicio DATETIME NULL,
    estado ENUM('Pendiente', 'Asignado', 'Completado', 'Cancelado') DEFAULT 'Pendiente',
    FOREIGN KEY (id_cliente) REFERENCES clientes(id),
    FOREIGN KEY (id_servicio) REFERENCES servicios(id),
    FOREIGN KEY (id_empleado) REFERENCES usuarios(id)
);

CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_agendamiento INT NOT NULL,
    monto_total DECIMAL(10, 2) NOT NULL,
    estado_pago ENUM('Pendiente', 'Pagado') DEFAULT 'Pendiente',
    FOREIGN KEY (id_agendamiento) REFERENCES agendamientos(id)
);

CREATE TABLE evaluaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_agendamiento INT NOT NULL UNIQUE,
    calificacion INT CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    FOREIGN KEY (id_agendamiento) REFERENCES agendamientos(id)
);

CREATE TABLE postulaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    archivo_cv_url VARCHAR(255),
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE novedades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    contenido TEXT NOT NULL,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO servicios (nombre, descripcion) VALUES ('Jardinería', 'Mantenimiento integral'), ('Aseo General', 'Limpieza oficina/casa');

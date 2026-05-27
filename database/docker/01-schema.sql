-- Esquema inicial para Docker (alineado con entidades JPA del API Java).
CREATE DATABASE IF NOT EXISTS torreal_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE torreal_db;
SET NAMES utf8mb4;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol VARCHAR(30) NOT NULL DEFAULT 'Cliente',
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    especialidad VARCHAR(100),
    estado_laboral VARCHAR(20) DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    direccion VARCHAR(255),
    tipo_cliente VARCHAR(40) DEFAULT 'Natural',
    nit_ph VARCHAR(50),
    persona_contacto VARCHAR(150),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(30) DEFAULT 'Disponible'
);

CREATE TABLE tarifas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_servicio INT NOT NULL,
    tipo_cliente VARCHAR(40) NOT NULL,
    precio DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id) ON DELETE CASCADE
);

CREATE TABLE agendamientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    nombre_cliente VARCHAR(150),
    id_servicio INT NOT NULL,
    id_empleado INT,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    estado VARCHAR(30) DEFAULT 'En Proceso',
    FOREIGN KEY (id_cliente) REFERENCES clientes(id),
    FOREIGN KEY (id_servicio) REFERENCES servicios(id),
    FOREIGN KEY (id_empleado) REFERENCES usuarios(id)
);

CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_agendamiento INT NOT NULL,
    monto_total DECIMAL(12, 2) NOT NULL,
    estado_pago VARCHAR(20) DEFAULT 'Pendiente',
    FOREIGN KEY (id_agendamiento) REFERENCES agendamientos(id)
);

CREATE TABLE evaluaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_agendamiento INT NOT NULL UNIQUE,
    calificacion INT,
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
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    imagen_url VARCHAR(255),
    tipo VARCHAR(30),
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

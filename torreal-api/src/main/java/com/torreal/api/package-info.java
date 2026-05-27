/**
 * API REST de Torreal S.A.S.
 *
 * <p>Organización del código:
 *
 * <ul>
 *   <li>{@code controller} — endpoints HTTP por rol o recurso público
 *   <li>{@code service} — contratos de negocio; {@code service.impl} implementaciones generales;
 *       {@code service.admin} panel super usuario; {@code service.impl.admin} sus implementaciones
 *   <li>{@code repository} — acceso JPA a MySQL
 *   <li>{@code entity} — modelo persistente
 *   <li>{@code dto} — objetos de entrada/salida de la API
 *   <li>{@code mapper} — conversión entidad/DTO y filas SQL nativas
 *   <li>{@code domain} — constantes de dominio (roles, zona horaria)
 *   <li>{@code util} — reglas reutilizables (estados, precios, fechas, archivos)
 *   <li>{@code security} — JWT y configuración Spring Security
 *   <li>{@code config} — beans y propiedades de aplicación
 *   <li>{@code exception} — errores de negocio y manejo global
 * </ul>
 */
package com.torreal.api;

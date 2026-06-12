// src/models/asociaciones.js
import Usuario from './Usuario.js';
import Equipo from './Equipo.js';
import Solicitud from './Solicitud.js';
import HistorialSolicitud from './HistorialSolicitud.js';

// ==========================================
// 1. Relación EQUIPO - SOLICITUD (Uno a Muchos)
// ==========================================
// "Cada solicitud debe estar asociada obligatoriamente a un Equipo"
// "Un equipo puede estar asociado a muchas solicitudes"
Equipo.hasMany(Solicitud, {
    foreignKey: 'equipoId',
    as: 'solicitudes'
});
Solicitud.belongsTo(Equipo, {
    foreignKey: 'equipoId',
    as: 'equipo'
});

// ==========================================
// 2. Relación USUARIO - SOLICITUD (Doble relación)
// ==========================================
// Relación A: El usuario que solicita el préstamo (Solicitante)
Usuario.hasMany(Solicitud, {
    foreignKey: 'usuarioId',
    as: 'solicitudesCreadas'
});
Solicitud.belongsTo(Usuario, {
    foreignKey: 'usuarioId',
    as: 'solicitante'
});

// Relación B: El usuario que aprueba/autoriza el préstamo (Autorizante)
// Puede ser null si la solicitud aún está pendiente, por eso pusimos allowNull: true en el modelo
Usuario.hasMany(Solicitud, {
    foreignKey: 'autorizadoPor',
    as: 'solicitudesAutorizadas'
});
Solicitud.belongsTo(Usuario, {
    foreignKey: 'autorizadoPor',
    as: 'autorizante'
});

// ==========================================
// 3. Relación SOLICITUD - HISTORIAL (Uno a Muchos)
// ==========================================
// "Pertenece a una solicitud"
Solicitud.hasMany(HistorialSolicitud, {
    foreignKey: 'solicitudId',
    as: 'historiales'
});
HistorialSolicitud.belongsTo(Solicitud, {
    foreignKey: 'solicitudId',
    as: 'solicitud'
});

// ==========================================
// 4. Relación USUARIO - HISTORIAL (Uno a Muchos)
// ==========================================
// "Pertenece al usuario que hizo la acción"
Usuario.hasMany(HistorialSolicitud, {
    foreignKey: 'usuarioId',
    as: 'accionesHistorial'
});
HistorialSolicitud.belongsTo(Usuario, {
    foreignKey: 'usuarioId',
    as: 'usuarioAccion'
});

// Exportamos todos los modelos ya relacionados
export { Usuario, Equipo, Solicitud, HistorialSolicitud };
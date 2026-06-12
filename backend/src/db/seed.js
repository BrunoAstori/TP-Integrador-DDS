import sequelize from './db.js';
import Usuario from '../models/Usuario.js';
import Equipo from '../models/Equipo.js';
import Solicitud from '../models/Solicitud.js';
import HistorialSolicitud from '../models/HistorialSolicitud.js';
import bcrypt from 'bcryptjs';

// Importamos las asociaciones para que Sequelize las reconozca
import '../models/asociaciones.js';

const seedDatabase = async () => {
    try {
        await sequelize.sync({ force: true });
        console.log('🔄 Base de datos limpia y sincronizada.');

        await Usuario.bulkCreate([
            { id: 1, nombre: 'Carla Ruiz', email: 'carla@dds.com', password: await bcrypt.hash('123456', 12), rol: 'usuario', activo: true },
            { id: 2, nombre: 'Juan Pérez', email: 'juan@dds.com', password: await bcrypt.hash('123457', 12), rol: 'usuario', activo: true },
            { id: 3, nombre: 'Carlos Gómez', email: 'carlos@dds.com', password: await bcrypt.hash('123458', 12), rol: 'encargado', activo: true },
            { id: 4, nombre: 'Admin General', email: 'admin@dds.com', password: await bcrypt.hash('123459', 12), rol: 'admin', activo: true },
        ], { individualHooks: false });
        console.log('👥 Usuarios insertados.');

        const equipos = await Equipo.bulkCreate([
            { id: 1, codigoInventario: 'INV-2026-001', nombre: 'Notebook Dell Inspiron 14', categoria: 'notebook', estado: 'disponible', ubicacion: 'Laboratorio A5', requiereAutorizacion: false },
            { id: 2, codigoInventario: 'INV-2026-002', nombre: 'Notebook HP ProBook 450', categoria: 'notebook', estado: 'prestado', ubicacion: 'Laboratorio A5', requiereAutorizacion: false },
            { id: 3, codigoInventario: 'INV-2026-003', nombre: 'Proyector Epson PowerLite X41', categoria: 'proyector', estado: 'disponible', ubicacion: 'Auditorio Central', requiereAutorizacion: true },
            { id: 4, codigoInventario: 'INV-2026-004', nombre: 'Cámara Canon EOS T7 Kit', categoria: 'cámara', estado: 'mantenimiento', ubicacion: 'Pañol de Medios', requiereAutorizacion: true },
            { id: 5, codigoInventario: 'INV-2026-005', nombre: 'Kit de Red Cisco Básico', categoria: 'kit de red', estado: 'disponible', ubicacion: 'Laboratorio B2', requiereAutorizacion: false },
            { id: 6, codigoInventario: 'INV-2026-006', nombre: 'Notebook Lenovo ThinkPad E14', categoria: 'notebook', estado: 'baja', ubicacion: 'Depósito Pasillo C', requiereAutorizacion: false },
            { id: 7, codigoInventario: 'INV-2026-007', nombre: 'Proyector BenQ MH535', categoria: 'proyector', estado: 'disponible', ubicacion: 'Aula 402', requiereAutorizacion: true },
            { id: 8, codigoInventario: 'INV-2026-008', nombre: 'Cámara Sony Alpha 6400', categoria: 'cámara', estado: 'disponible', ubicacion: 'Laboratorio de Medios', requiereAutorizacion: true }
        ]);
        console.log('💻 Equipos insertados.');

        await Solicitud.bulkCreate([
            { id: 1001, equipoId: 1, usuarioId: 1, fechaRetiro: '2026-06-12', fechaDevolucion: '2026-06-15', motivo: 'Estudio y desarrollo de TP de Sistemas', estado: 'pendiente', autorizadoPor: null },
            { id: 1002, equipoId: 2, usuarioId: 2, fechaRetiro: '2026-06-09', fechaDevolucion: '2026-06-12', motivo: 'Práctica para examen parcial de Redes', estado: 'aprobada', autorizadoPor: 4 },
            { id: 1003, equipoId: 3, usuarioId: 1, fechaRetiro: '2026-06-14', fechaDevolucion: '2026-06-14', motivo: 'Presentación de proyecto final de simulación', estado: 'pendiente', autorizadoPor: null },
            { id: 1004, equipoId: 4, usuarioId: 2, fechaRetiro: '2026-06-05', fechaDevolucion: '2026-06-07', motivo: 'Grabación de material audiovisual institucional', estado: 'rechazada', autorizadoPor: 3 },
            { id: 1005, equipoId: 5, usuarioId: 1, fechaRetiro: '2026-05-20', fechaDevolucion: '2026-05-22', motivo: 'Práctica libre de ruteo y subnetting', estado: 'devuelta', autorizadoPor: 4 },
            { id: 1006, equipoId: 1, usuarioId: 2, fechaRetiro: '2026-06-01', fechaDevolucion: '2026-06-03', motivo: 'Rendir examen final de Diseño de Sistemas', estado: 'devuelta', autorizadoPor: 3 },
            { id: 1007, equipoId: 7, usuarioId: 1, fechaRetiro: '2026-06-18', fechaDevolucion: '2026-06-19', motivo: 'Clase de soporte técnico en Aula Magna', estado: 'pendiente', autorizadoPor: null },
            { id: 1008, equipoId: 8, usuarioId: 2, fechaRetiro: '2026-06-25', fechaDevolucion: '2026-06-28', motivo: 'Rodaje de cortometraje para materia electiva', estado: 'pendiente', autorizadoPor: null },
            { id: 1009, equipoId: 3, usuarioId: 2, fechaRetiro: '2026-06-08', fechaDevolucion: '2026-06-09', motivo: 'Charla debate sobre Inteligencia Artificial', estado: 'cancelada', autorizadoPor: null },
            { id: 1010, equipoId: 6, usuarioId: 1, fechaRetiro: '2026-04-10', fechaDevolucion: '2026-04-12', motivo: 'Uso en laboratorio de testing', estado: 'devuelta', autorizadoPor: 4 },
            { id: 1011, equipoId: 2, usuarioId: 1, fechaRetiro: '2026-06-10', fechaDevolucion: '2026-06-15', motivo: 'Desarrollo de proyecto anual obligatorio', estado: 'aprobada', autorizadoPor: 4 },
            { id: 1012, equipoId: 5, usuarioId: 2, fechaRetiro: '2026-06-15', fechaDevolucion: '2026-06-17', motivo: 'Laboratorio de Sistemas Operativos Avanzados', estado: 'pendiente', autorizadoPor: null }
        ]);
        console.log('📋 Solicitudes insertadas.');

        await HistorialSolicitud.bulkCreate([
            { id: 1, solicitudId: 1001, usuarioId: 1, accion: 'creacion', fechaHora: '2026-06-10T09:00:00', valorAnterior: null, valorNuevo: JSON.stringify({ estado: 'pendiente' }) },
            { id: 2, solicitudId: 1002, usuarioId: 2, accion: 'creacion', fechaHora: '2026-06-08T10:30:00', valorAnterior: null, valorNuevo: JSON.stringify({ estado: 'pendiente' }) },
            { id: 3, solicitudId: 1002, usuarioId: 4, accion: 'aprobacion', fechaHora: '2026-06-08T11:15:00', valorAnterior: JSON.stringify({ estado: 'pendiente' }), valorNuevo: JSON.stringify({ estado: 'aprobada' }) },
            { id: 4, solicitudId: 1004, usuarioId: 2, accion: 'creacion', fechaHora: '2026-06-04T15:00:00', valorAnterior: null, valorNuevo: JSON.stringify({ estado: 'pendiente' }) },
            { id: 5, solicitudId: 1004, usuarioId: 3, accion: 'rechazo', fechaHora: '2026-06-04T18:20:00', valorAnterior: JSON.stringify({ estado: 'pendiente' }), valorNuevo: JSON.stringify({ estado: 'rechazada' }) },
            { id: 6, solicitudId: 1005, usuarioId: 4, accion: 'devolucion', fechaHora: '2026-05-22T16:00:00', valorAnterior: JSON.stringify({ estado: 'aprobada' }), valorNuevo: JSON.stringify({ estado: 'devuelta' }) },
            { id: 7, solicitudId: 1009, usuarioId: 2, accion: 'cancelacion', fechaHora: '2026-06-07T12:00:00', valorAnterior: JSON.stringify({ estado: 'pendiente' }), valorNuevo: JSON.stringify({ estado: 'cancelada' }) }
        ]);
        console.log('📜 Historial de solicitudes (auditoría) insertado.');

        console.log('🚀 Base de datos inicializada por completo.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al ejecutar el seed:', error);
        process.exit(1);
    }
};

seedDatabase();
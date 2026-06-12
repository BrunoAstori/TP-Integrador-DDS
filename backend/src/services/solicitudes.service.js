import { Op } from 'sequelize';
import Solicitud from '../models/Solicitud.js';
import Equipo from '../models/Equipo.js';
import Usuario from '../models/Usuario.js';
import sequelize from '../db/db.js';
import HistorialSolicitud from '../models/HistorialSolicitud.js';

const registrarHistorial = async (solicitudId, usuarioId, accion, estadoAnterior, estadoNuevo) => {
    await HistorialSolicitud.create({
        solicitudId,
        usuarioId,
        accion,
        valorAnterior: JSON.stringify({ estado: estadoAnterior }),
        valorNuevo: JSON.stringify({ estado: estadoNuevo }),
    });
};


export const listarSolicitudes = async (filtros, usuario) => {
    const { estado, equipoId, categoria, desde, hasta, page = 1, limit = 10, sortBy = 'createdAt', order = 'DESC' } = filtros;

    // Construimos el WHERE de solicitudes dinámicamente
    const whereSolicitud = {};

    // Si es usuario común, solo ve las suyas
    if (usuario.rol === 'usuario') {
        whereSolicitud.usuarioId = usuario.id;
    }

    if (estado) whereSolicitud.estado = estado;
    if (equipoId) whereSolicitud.equipoId = equipoId;

    if (desde || hasta) {
        whereSolicitud.fechaRetiro = {};
        if (desde) whereSolicitud.fechaRetiro[Op.gte] = desde;
        if (hasta) whereSolicitud.fechaRetiro[Op.lte] = hasta;
    }

    if (estado) whereSolicitud.estado = estado;
    if (equipoId) whereSolicitud.equipoId = equipoId;

    // Filtro de rango de fechas sobre fechaRetiro
    if (desde || hasta) {
        whereSolicitud.fechaRetiro = {};
        if (desde) whereSolicitud.fechaRetiro[Op.gte] = desde;
        if (hasta) whereSolicitud.fechaRetiro[Op.lte] = hasta;
    }

    // Construimos el WHERE del equipo (para filtrar por categoría)
    const whereEquipo = {};
    if (categoria) whereEquipo.categoria = categoria;

    const offset = (page - 1) * limit;

    const { count, rows } = await Solicitud.findAndCountAll({
        where: whereSolicitud,
        include: [
            {
                model: Equipo,
                as: 'equipo',
                where: whereEquipo,
                attributes: ['id', 'nombre', 'categoria', 'estado', 'ubicacion', 'codigoInventario']
            },
            {
                model: Usuario,
                as: 'solicitante',
                attributes: ['id', 'nombre', 'email']
            },
            {
                model: Usuario,
                as: 'autorizante',
                attributes: ['id', 'nombre', 'email']
            }
        ],
        order: [[sortBy, order.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    return { total: count, pagina: parseInt(page), limite: parseInt(limit), solicitudes: rows };
};

export const obtenerSolicitudPorId = async (id) => {
    const solicitud = await Solicitud.findByPk(id, {
        include: [
            {
                model: Equipo,
                as: 'equipo',
                attributes: ['id', 'nombre', 'categoria', 'estado', 'ubicacion', 'codigoInventario']
            },
            {
                model: Usuario,
                as: 'solicitante',
                attributes: ['id', 'nombre', 'email']
            },
            {
                model: Usuario,
                as: 'autorizante',
                attributes: ['id', 'nombre', 'email']
            }
        ]
    });
    return solicitud;
};

export const crearSolicitud = async ({ equipoId, usuarioId, fechaRetiro, fechaDevolucion, motivo }) => {
    // Regla 9: fechaRetiro debe ser anterior a fechaDevolucion
    if (fechaRetiro >= fechaDevolucion) {
        throw { status: 400, mensaje: 'La fecha de retiro debe ser anterior a la fecha de devolución.' };
    }

    // Regla 10: equipo debe existir y estar disponible
    const equipo = await Equipo.findByPk(equipoId);
    if (!equipo) {
        throw { status: 404, mensaje: 'El equipo no existe.' };
    }
    if (equipo.estado !== 'disponible') {
        throw { status: 400, mensaje: 'El equipo no está disponible.' };
    }

    // Regla 10: no debe haber solicitud aprobada superpuesta
    const superposicion = await Solicitud.findOne({
        where: {
            equipoId,
            estado: 'aprobada',
            fechaRetiro: { [Op.lt]: fechaDevolucion },
            fechaDevolucion: { [Op.gt]: fechaRetiro }
        }
    });
    if (superposicion) {
        throw { status: 400, mensaje: 'El equipo ya tiene una solicitud aprobada para ese período.' };
    }

    const solicitud = await Solicitud.create({ equipoId, usuarioId, fechaRetiro, fechaDevolucion, motivo, estado: 'pendiente' });

    await registrarHistorial(solicitud.id, usuarioId, 'creacion', null, 'pendiente');

    return solicitud;
};

export const editarSolicitud = async (id, { fechaRetiro, fechaDevolucion, motivo }, usuarioId) => {
    const solicitud = await Solicitud.findByPk(id);
    if (!solicitud) {
        throw { status: 404, mensaje: 'Solicitud no encontrada.' };
    }
    if (solicitud.estado !== 'pendiente') {
        throw { status: 400, mensaje: 'Solo se pueden editar solicitudes pendientes.' };
    }
    if (fechaRetiro && fechaDevolucion && fechaRetiro >= fechaDevolucion) {
        throw { status: 400, mensaje: 'La fecha de retiro debe ser anterior a la fecha de devolución.' };
    }

    const estadoAnterior = solicitud.estado;
    await solicitud.update({ fechaRetiro, fechaDevolucion, motivo });
    await registrarHistorial(solicitud.id, usuarioId, 'edicion', estadoAnterior, solicitud.estado);
    return solicitud;
};

export const cancelarSolicitud = async (id, usuarioId) => {
    const solicitud = await Solicitud.findByPk(id);
    if (!solicitud) {
        throw { status: 404, mensaje: 'Solicitud no encontrada.' };
    }
    if (solicitud.usuarioId !== usuarioId) {
        throw { status: 403, mensaje: 'Solo podés cancelar tus propias solicitudes.' };
    }
    if (solicitud.estado === 'devuelta') {
        throw { status: 400, mensaje: 'No se puede cancelar una solicitud ya devuelta.' };
    }
    if (['cancelada', 'rechazada'].includes(solicitud.estado)) {
        throw { status: 400, mensaje: `La solicitud ya está ${solicitud.estado}.` };
    }

    const estadoAnterior = solicitud.estado;
    await solicitud.update({ estado: 'cancelada' });
    await registrarHistorial(solicitud.id, usuarioId, 'cancelacion', estadoAnterior, 'cancelada');
    return solicitud;
};

export const aprobarSolicitud = async (id, usuarioId) => {
    const solicitud = await Solicitud.findByPk(id, { include: [{ model: Equipo, as: 'equipo' }] });
    if (!solicitud) {
        throw { status: 404, mensaje: 'Solicitud no encontrada.' };
    }
    if (solicitud.estado !== 'pendiente') {
        throw { status: 400, mensaje: 'Solo se pueden aprobar solicitudes pendientes.' };
    }
    if (solicitud.equipo.estado !== 'disponible') {
        throw { status: 400, mensaje: 'El equipo no está disponible.' };
    }

    const superposicion = await Solicitud.findOne({
        where: {
            equipoId: solicitud.equipoId,
            estado: 'aprobada',
            id: { [Op.ne]: id },
            fechaRetiro: { [Op.lt]: solicitud.fechaDevolucion },
            fechaDevolucion: { [Op.gt]: solicitud.fechaRetiro }
        }
    });
    if (superposicion) {
        throw { status: 400, mensaje: 'El equipo ya tiene una solicitud aprobada para ese período.' };
    }

    await solicitud.update({ estado: 'aprobada', autorizadoPor: usuarioId });
    await solicitud.equipo.update({ estado: 'prestado' });
    await registrarHistorial(solicitud.id, usuarioId, 'aprobacion', 'pendiente', 'aprobada');
    return solicitud;
};

export const rechazarSolicitud = async (id, usuarioId) => {
    const solicitud = await Solicitud.findByPk(id);
    if (!solicitud) {
        throw { status: 404, mensaje: 'Solicitud no encontrada.' };
    }
    if (solicitud.estado !== 'pendiente') {
        throw { status: 400, mensaje: 'Solo se pueden rechazar solicitudes pendientes.' };
    }

    await solicitud.update({ estado: 'rechazada', autorizadoPor: usuarioId });
    await registrarHistorial(solicitud.id, usuarioId, 'rechazo', 'pendiente', 'rechazada');
    return solicitud;
};

export const devolverSolicitud = async (id, usuarioId) => {
    const solicitud = await Solicitud.findByPk(id, { include: [{ model: Equipo, as: 'equipo' }] });
    if (!solicitud) throw { status: 404, mensaje: 'Solicitud no encontrada.' };
    if (solicitud.estado !== 'aprobada') {
        throw { status: 400, mensaje: 'Solo se pueden devolver solicitudes aprobadas.' };
    }
    await solicitud.update({ estado: 'devuelta' });
    await solicitud.equipo.update({ estado: 'disponible' });
    await registrarHistorial(solicitud.id, usuarioId, 'devolucion', 'aprobada', 'devuelta');
    return solicitud;
};

export const obtenerResumen = async () => {
    const hoy = new Date();


    //equipos disponibles por categoría
    const equiposPorCategoria = await Equipo.findAll({
        where: { estado: 'disponible' },
        attributes: ['categoria', [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']],
        group: ['categoria']
    });

    //solicitudes pendientes
    const solicitudesPendientes = await Solicitud.count({ where: { estado: 'pendiente' } });
    
    const equiposPrestados = await Equipo.count({ where: { estado: 'prestado' } });
    const prestamosVencidos = await Solicitud.findAll({
        where: {
            estado: 'aprobada',
            fechaDevolucion: { [Op.lt]: hoy }
        },
        include: [
            { model: Equipo, as: 'equipo', attributes: ['id', 'nombre', 'categoria'] },
            { model: Usuario, as: 'solicitante', attributes: ['id', 'nombre', 'email'] },
        ]
    });

    return { equiposPorCategoria, solicitudesPendientes, equiposPrestados, prestamosVencidos, totalVencidos: prestamosVencidos.length };
};

export const obtenerHistorial = async (id) => {
    const solicitud = await Solicitud.findByPk(id);
    if (!solicitud) throw { status: 404, mensaje: 'Solicitud no encontrada.' };

    return await HistorialSolicitud.findAll({
        where: { solicitudId: id },
        include: [{ model: Usuario, as: 'usuarioAccion', attributes: ['id', 'nombre', 'email'] }],
        order: [['fechaHora', 'ASC']]
    });
};
import { listarSolicitudes, obtenerSolicitudPorId, crearSolicitud, editarSolicitud, cancelarSolicitud, aprobarSolicitud, rechazarSolicitud, devolverSolicitud,obtenerResumen, obtenerHistorial} from '../services/solicitudes.service.js';

export const getSolicitudes = async (req, res) => {
    try {
        const { estado, equipoId, categoria, desde, hasta, page, limit, sortBy, order } = req.query;
        const solicitudes = await listarSolicitudes(
            { estado, equipoId, categoria, desde, hasta, page, limit, sortBy, order },
            req.usuario
        );
        res.status(200).json(solicitudes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las solicitudes.', detalle: error.message });
    }
};

export const getSolicitudById = async (req, res) => {
    try {
        const { id } = req.params;
        const solicitud = await obtenerSolicitudPorId(id);
        if (!solicitud) {
            return res.status(404).json({ error: 'Solicitud no encontrada.' });
        }
        res.status(200).json(solicitud);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la solicitud.', detalle: error.message });
    }
};

export const postSolicitud = async (req, res) => {
    try {
        const { equipoId, fechaRetiro, fechaDevolucion, motivo } = req.body;
        const usuarioId = req.usuario.id; // viene del middleware JWT (a implementar)
        const solicitud = await crearSolicitud({ equipoId, usuarioId, fechaRetiro, fechaDevolucion, motivo });
        res.status(201).json(solicitud);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ error: error.mensaje || 'Error al crear la solicitud.' });
    }
};

export const putSolicitud = async (req, res) => {
    try {
        const { fechaRetiro, fechaDevolucion, motivo } = req.body;
        const solicitud = await editarSolicitud(req.params.id, { fechaRetiro, fechaDevolucion, motivo }, req.usuario.id);
        res.status(200).json(solicitud);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ error: error.mensaje || 'Error al editar la solicitud.' });
    }
};

export const patchCancelarSolicitud = async (req, res) => {
    try {
        const solicitud = await cancelarSolicitud(req.params.id, req.usuario.id);
        res.status(200).json(solicitud);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ error: error.mensaje || 'Error al cancelar la solicitud.' });
    }
};

export const patchAprobarSolicitud = async (req, res) => {
    try {
        const solicitud = await aprobarSolicitud(req.params.id, req.usuario.id);
        res.status(200).json(solicitud);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ error: error.mensaje || 'Error al aprobar la solicitud.' });
    }
};

export const patchRechazarSolicitud = async (req, res) => {
    try {
        const solicitud = await rechazarSolicitud(req.params.id, req.usuario.id);
        res.status(200).json(solicitud);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ error: error.mensaje || 'Error al rechazar la solicitud.' });
    }
};

export const patchDevolverSolicitud = async (req, res) => {
    try {
        const solicitud = await devolverSolicitud(req.params.id, req.usuario.id);
        res.status(200).json(solicitud);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.mensaje || 'Error al devolver la solicitud.' });
    }
};

export const getResumen = async (req, res) => {
    try {
        const resumen = await obtenerResumen();
        res.status(200).json(resumen);
    } catch (error) {
        console.log('Error al obtener el resumen:', error);
        res.status(500).json({ error: 'Error al obtener el resumen.' });
    }
};

export const getHistorialSolicitud = async (req, res) => {
    try {
        const historial = await obtenerHistorial(req.params.id);
        res.status(200).json(historial);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.mensaje || 'Error al obtener el historial.' });
    }
};
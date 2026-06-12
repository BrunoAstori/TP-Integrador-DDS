import api from './api.js';

export const getSolicitudes = (params) => api.get('/solicitudes', { params });
export const getSolicitudById = (id) => api.get(`/solicitudes/${id}`);
export const getHistorial = (id) => api.get(`/solicitudes/${id}/historial`);
export const crearSolicitud = (datos) => api.post('/solicitudes', datos);
export const editarSolicitud = (id, datos) => api.put(`/solicitudes/${id}`, datos);
export const cancelarSolicitud = (id) => api.patch(`/solicitudes/${id}/cancelar`);
export const aprobarSolicitud = (id) => api.patch(`/solicitudes/${id}/aprobar`);
export const rechazarSolicitud = (id) => api.patch(`/solicitudes/${id}/rechazar`);
export const devolverSolicitud = (id) => api.patch(`/solicitudes/${id}/devolver`);
export const getResumen = () => api.get('/solicitudes/resumen');

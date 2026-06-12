import { Router } from 'express';
import { getSolicitudes, getSolicitudById, postSolicitud, putSolicitud, patchCancelarSolicitud, patchRechazarSolicitud, patchAprobarSolicitud, patchDevolverSolicitud, getResumen, getHistorialSolicitud } from '../controllers/solicitudes.controller.js';
import { soloRol } from '../middlewares/roles.middleware.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/solicitudes?estado=&equipoId=&categoria=&desde=&hasta=
router.get('/', verificarToken, getSolicitudes);

// GET /api/solicitudes/resumen
router.get('/resumen', verificarToken, soloRol('admin', 'encargado'), getResumen);

// GET /api/solicitudes/:id
router.get('/:id', getSolicitudById);

// GET /api/solicitudes/:id/historial
router.get('/:id/historial', verificarToken, getHistorialSolicitud);

// POST /api/solicitudes
router.post('/', verificarToken, postSolicitud);

// PUT /api/solicitudes/:id
router.put('/:id',verificarToken, putSolicitud);

// PATCH /api/solicitudes/:id/cancelar
router.patch('/:id/cancelar',verificarToken, patchCancelarSolicitud);

// PATCH /api/solicitudes/:id/aprobar
router.patch('/:id/aprobar',verificarToken, soloRol('admin', 'encargado'), patchAprobarSolicitud);

// PATCH /api/solicitudes/:id/rechazar
router.patch('/:id/rechazar',verificarToken, soloRol('admin', 'encargado'), patchRechazarSolicitud);

// PATCH /api/solicitudes/:id/devolver
router.patch('/:id/devolver', verificarToken, soloRol('admin', 'encargado'), patchDevolverSolicitud);



export default router;

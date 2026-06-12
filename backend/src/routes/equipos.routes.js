import { Router } from 'express';
import { getEquipos } from '../controllers/equipos.controller.js';

const router = Router();

router.get('/', getEquipos);

export default router;
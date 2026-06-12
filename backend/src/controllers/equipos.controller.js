import { listarEquipos } from '../services/equipos.service.js';

export const getEquipos = async (req, res) => {
    try {
        const equipos = await listarEquipos();
        res.status(200).json(equipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los equipos.' });
    }
};
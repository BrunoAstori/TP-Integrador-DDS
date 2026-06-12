import Equipo from '../models/Equipo.js';

export const listarEquipos = async () => {
    return await Equipo.findAll();
};
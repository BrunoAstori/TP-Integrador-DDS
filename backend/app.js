import express from 'express';
import cors from 'cors'; // 1. Importas cors usando sintaxis moderna
import sequelize from './src/db/db.js';
import { Usuario, Equipo, Solicitud, HistorialSolicitud } from './src/models/asociaciones.js';
import authRoutes from './src/routes/auth.routes.js';
import solicitudesRoutes from './src/routes/solicitudes.routes.js';
import equiposRoutes from './src/routes/equipos.routes.js';

const app = express();

const PORT = 3000;

app.use(cors({
    origin: 'https://tp-integrador-dds.onrender.com:5173', 
    credentials: true 
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/equipos', equiposRoutes);

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const mensaje = err.mensaje || err.message || 'Error interno del servidor.';
    res.status(status).json({ error: mensaje });
});

sequelize.sync({ force: false })
    .then(() => {
        console.log('Base de datos conectada y tablas sincronizadas con sus relaciones.');
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en el puerto ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error al sincronizar la base de datos:', error);
    });
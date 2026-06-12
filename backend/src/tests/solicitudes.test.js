import request from 'supertest';
import express from 'express';
import sequelize from '../db/db.js';
import '../models/asociaciones.js';
import authRoutes from '../routes/auth.routes.js';
import solicitudesRoutes from '../routes/solicitudes.routes.js';
import bcrypt from 'bcryptjs';
import { default as Usuario } from '../models/Usuario.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/solicitudes', solicitudesRoutes);

let tokenUsuario;
let tokenAdmin;

beforeAll(async () => {
    await sequelize.sync({ force: true });

    await Usuario.bulkCreate([
        { nombre: 'Usuario Test', email: 'usuario@test.com', password: await bcrypt.hash('123456', 10), rol: 'usuario', activo: true },
        { nombre: 'Admin Test', email: 'admin@test.com', password: await bcrypt.hash('123456', 10), rol: 'admin', activo: true }
    ], { individualHooks: false });

    const resUsuario = await request(app).post('/api/auth/login').send({ email: 'usuario@test.com', password: '123456' });
    const resAdmin = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: '123456' });
    tokenUsuario = resUsuario.body.token;
    tokenAdmin = resAdmin.body.token;

    const { default: Equipo } = await import('../models/Equipo.js');
    await Equipo.create({
        id: 1, codigoInventario: 'INV-TEST-001', nombre: 'Notebook Test',
        categoria: 'notebook', estado: 'disponible', ubicacion: 'Lab A', requiereAutorizacion: false
    });
    await Equipo.create({
        id: 99, codigoInventario: 'INV-TEST-099', nombre: 'Equipo No Disponible',
        categoria: 'notebook', estado: 'mantenimiento', ubicacion: 'Lab B', requiereAutorizacion: false
    });
});

afterAll(async () => {
    await sequelize.close();
});

// ─── REQUISITO 1: Login correcto e inválido ───────────────────────────────────

describe('Requisito 1: Login', () => {
    test('1a. Login correcto devuelve 200 y token', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: 'usuario@test.com', password: '123456' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    test('1b. Login con contraseña incorrecta devuelve 401', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: 'usuario@test.com', password: 'wrongpass' });
        expect(res.status).toBe(401);
    });

    test('1c. Login con email inexistente devuelve 404', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: 'noexiste@test.com', password: '123456' });
        expect(res.status).toBe(404);
    });
});

// ─── REQUISITO 2: Listado con y sin filtros ───────────────────────────────────

describe('Requisito 2: Listado de solicitudes', () => {
    test('2a. Listar sin filtros devuelve 200', async () => {
        const res = await request(app)
            .get('/api/solicitudes')
            .set('Authorization', `Bearer ${tokenUsuario}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('solicitudes');
    });

    test('2b. Listar con filtro por estado devuelve 200', async () => {
        const res = await request(app)
            .get('/api/solicitudes?estado=pendiente')
            .set('Authorization', `Bearer ${tokenUsuario}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('solicitudes');
    });
});

// ─── REQUISITO 3: Detalle existente e inexistente ─────────────────────────────

describe('Requisito 3: Detalle de solicitud', () => {
    test('3a. Solicitud inexistente devuelve 404', async () => {
        const res = await request(app).get('/api/solicitudes/9999');
        expect(res.status).toBe(404);
    });

    test('3b. Solicitud existente devuelve 200', async () => {
        const resSolicitud = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${tokenUsuario}`)
            .send({ equipoId: 1, fechaRetiro: '2026-12-01', fechaDevolucion: '2026-12-05', motivo: 'Test detalle' });

        const res = await request(app).get(`/api/solicitudes/${resSolicitud.body.id}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id');
    });
});

// ─── REQUISITO 4: Creación válida ─────────────────────────────────────────────

describe('Requisito 4: Creación válida de solicitud', () => {
    test('4a. Creación válida devuelve 201', async () => {
        const res = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${tokenUsuario}`)
            .send({ equipoId: 1, fechaRetiro: '2026-07-01', fechaDevolucion: '2026-07-05', motivo: 'Test' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
    });
});

// ─── REQUISITO 5: Creación inválida por fechas ────────────────────────────────

describe('Requisito 5: Fechas inconsistentes', () => {
    test('5a. fechaRetiro posterior a fechaDevolucion devuelve 400', async () => {
        const res = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${tokenUsuario}`)
            .send({ equipoId: 1, fechaRetiro: '2026-07-05', fechaDevolucion: '2026-07-01', motivo: 'Test' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('5b. fechaRetiro igual a fechaDevolucion devuelve 400', async () => {
        const res = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${tokenUsuario}`)
            .send({ equipoId: 1, fechaRetiro: '2026-07-05', fechaDevolucion: '2026-07-05', motivo: 'Test' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });
});

// ─── REQUISITO 6: Equipo no disponible o superposición ───────────────────────

describe('Requisito 6: Equipo no disponible o superposición', () => {
    test('6a. Equipo en mantenimiento devuelve 400', async () => {
        const res = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${tokenUsuario}`)
            .send({ equipoId: 99, fechaRetiro: '2026-07-01', fechaDevolucion: '2026-07-05', motivo: 'Test no disponible' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('6b. Superposición de fechas con solicitud aprobada devuelve 400', async () => {
        const resSolicitud = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${tokenUsuario}`)
            .send({ equipoId: 1, fechaRetiro: '2027-01-01', fechaDevolucion: '2027-01-10', motivo: 'Base superposicion' });

        await request(app)
            .patch(`/api/solicitudes/${resSolicitud.body.id}/aprobar`)
            .set('Authorization', `Bearer ${tokenAdmin}`);

        const res = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${tokenUsuario}`)
            .send({ equipoId: 1, fechaRetiro: '2027-01-05', fechaDevolucion: '2027-01-15', motivo: 'Superpuesta' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');

        await request(app)
            .patch(`/api/solicitudes/${resSolicitud.body.id}/devolver`)
            .set('Authorization', `Bearer ${tokenAdmin}`);
    });
});

// ─── REQUISITO 7: Acceso sin JWT ──────────────────────────────────────────────

describe('Requisito 7: Acceso sin JWT', () => {
    test('7a. POST sin token devuelve 401', async () => {
        const res = await request(app)
            .post('/api/solicitudes')
            .send({ equipoId: 1, fechaRetiro: '2026-07-01', fechaDevolucion: '2026-07-05', motivo: 'Test' });
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
    });
});

// ─── REQUISITO 8: JWT de usuario en acción de admin ──────────────────────────

describe('Requisito 8: Permisos por rol', () => {
    test('8a. Usuario sin rol admin no puede aprobar, devuelve 403', async () => {
        const resSolicitud = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${tokenUsuario}`)
            .send({ equipoId: 1, fechaRetiro: '2026-08-01', fechaDevolucion: '2026-08-05', motivo: 'Test permisos' });

        const res = await request(app)
            .patch(`/api/solicitudes/${resSolicitud.body.id}/aprobar`)
            .set('Authorization', `Bearer ${tokenUsuario}`);
        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('error');
    });
});

// ─── REQUISITO 9: Devolución inválida ────────────────────────────────────────

describe('Requisito 9: Devolución de solicitud no aprobada', () => {
    test('9a. Devolver solicitud pendiente devuelve 400', async () => {
        const resSolicitud = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${tokenUsuario}`)
            .send({ equipoId: 1, fechaRetiro: '2026-10-01', fechaDevolucion: '2026-10-05', motivo: 'No aprobada' });

        const res = await request(app)
            .patch(`/api/solicitudes/${resSolicitud.body.id}/devolver`)
            .set('Authorization', `Bearer ${tokenAdmin}`);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });
});

// ─── REQUISITO 10: Transición de estado no permitida ─────────────────────────

describe('Requisito 10: Transiciones de estado no permitidas', () => {
    test('10a. Aprobar solicitud cancelada devuelve 400', async () => {
        const resSolicitud = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${tokenUsuario}`)
            .send({ equipoId: 1, fechaRetiro: '2026-11-01', fechaDevolucion: '2026-11-05', motivo: 'Para cancelar' });

        await request(app)
            .patch(`/api/solicitudes/${resSolicitud.body.id}/cancelar`)
            .set('Authorization', `Bearer ${tokenUsuario}`);

        const res = await request(app)
            .patch(`/api/solicitudes/${resSolicitud.body.id}/aprobar`)
            .set('Authorization', `Bearer ${tokenAdmin}`);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('10b. Aprobar solicitud ya aprobada devuelve 400', async () => {
        const resSolicitud = await request(app)
            .post('/api/solicitudes')
            .set('Authorization', `Bearer ${tokenUsuario}`)
            .send({ equipoId: 1, fechaRetiro: '2026-09-01', fechaDevolucion: '2026-09-05', motivo: 'Para aprobar dos veces' });

        await request(app)
            .patch(`/api/solicitudes/${resSolicitud.body.id}/aprobar`)
            .set('Authorization', `Bearer ${tokenAdmin}`);

        const res = await request(app)
            .patch(`/api/solicitudes/${resSolicitud.body.id}/aprobar`)
            .set('Authorization', `Bearer ${tokenAdmin}`);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');

        await request(app)
            .patch(`/api/solicitudes/${resSolicitud.body.id}/devolver`)
            .set('Authorization', `Bearer ${tokenAdmin}`);
    });
});
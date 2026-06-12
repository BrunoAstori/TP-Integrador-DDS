import { Usuario } from '../models/asociaciones.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_dev';
const JWT_EXPIRES_IN = '8h';

// CASO 1: Registrar Usuario
export const registrar = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        const usuarioExiste = await Usuario.findOne({ where: { email } });
        if (usuarioExiste) {
            return res.status(400).json({ mensaje: 'El email ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);
        const nuevoUsuario = await Usuario.create({
            nombre,
            email,
            password,
            rol
        });

        res.status(201).json({
            mensaje: 'Usuario registrado con éxito.',
            usuario: {
                id: nuevoUsuario.id,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email,
                rol: nuevoUsuario.rol
            }
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor al registrar.', error: error.message });
    }
};

// CASO 2: Iniciar Sesión (Login)
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        if (!usuario.activo) {
            return res.status(403).json({ mensaje: 'Esta cuenta se encuentra duplicada o desactivada.' });
        }

        const passwordCorrecta = await bcrypt.compare(password, usuario.password);
        if (!passwordCorrecta) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta.' });
        }

        // Generamos el JWT con el id, email y rol del usuario
        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(200).json({
            mensaje: 'Inicio de sesión correcto.',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor al iniciar sesión.', error: error.message });
    }
};

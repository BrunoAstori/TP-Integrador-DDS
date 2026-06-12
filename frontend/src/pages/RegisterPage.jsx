import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrar } from '../services/auth.service.js';

const RegisterPage = () => {
    const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'usuario' });
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [errores, setErrores] = useState({});

    const validar = () => {
        const nuevosErrores = {};
        if (!form.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.';
        if (!form.email.trim()) nuevosErrores.email = 'El email es obligatorio.';
        else if (!/\S+@\S+\.\S+/.test(form.email)) nuevosErrores.email = 'El email no es válido.';
        if (!form.password.trim()) nuevosErrores.password = 'La contraseña es obligatoria.';
        else if (form.password.length < 6) nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres.';
        return nuevosErrores;
    };
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const nuevosErrores = validar();
        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }
        setErrores({});
        setCargando(true);
        try {
            await registrar(form);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al registrarse.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-center mb-4">Registrarse</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Nombre</label>
                        <input type="text" name="nombre" className={`form-control ${errores.nombre ? 'is-invalid' : ''}`} value={form.nombre} onChange={handleChange}  />
                        {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" className={`form-control ${errores.email ? 'is-invalid' : ''}`} value={form.email} onChange={handleChange}  />
                        {errores.email && <div className="invalid-feedback">{errores.email}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input type="password" name="password" className={`form-control ${errores.password ? 'is-invalid' : ''}`} value={form.password} onChange={handleChange}  />
                        {errores.password && <div className="invalid-feedback">{errores.password}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Rol</label>
                        <select name="rol" className={`form-select ${errores.rol ? 'is-invalid' : ''}`} value={form.rol} onChange={handleChange}>
                            <option value="usuario">Usuario</option>
                            <option value="encargado">Encargado</option>
                            <option value="admin">Admin</option>
                        </select>
                        {errores.rol && <div className="invalid-feedback">{errores.rol}</div>}
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={cargando}>
                        {cargando ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>
                <p className="text-center mt-3">
                    ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
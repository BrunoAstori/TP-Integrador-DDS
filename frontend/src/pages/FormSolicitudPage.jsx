import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { crearSolicitud, editarSolicitud, getSolicitudById } from '../services/solicitudes.service.js';
import { getEquipos } from '../services/equipos.service.js';

const FormSolicitudPage = () => {
    const { id } = useParams();
    const esEdicion = Boolean(id);
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const [form, setForm] = useState({ equipoId: '', fechaRetiro: '', fechaDevolucion: '', motivo: '' });
    const [equipos, setEquipos] = useState([]);
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [errores, setErrores] = useState({});

    const validar = () => {
        const nuevosErrores = {};
        if (!esEdicion && !form.equipoId) nuevosErrores.equipoId = 'Seleccioná un equipo.';
        if (!form.fechaRetiro) nuevosErrores.fechaRetiro = 'La fecha de retiro es obligatoria.';
        if (!form.fechaDevolucion) nuevosErrores.fechaDevolucion = 'La fecha de devolución es obligatoria.';
        if (form.fechaRetiro && form.fechaDevolucion && form.fechaRetiro >= form.fechaDevolucion)
            nuevosErrores.fechaDevolucion = 'La fecha de devolución debe ser posterior al retiro.';
        if (!form.motivo.trim()) nuevosErrores.motivo = 'El motivo es obligatorio.';
        return nuevosErrores;
    };

    useEffect(() => {
        getEquipos().then(res => setEquipos(res.data));
        if (esEdicion) {
            getSolicitudById(id).then(res => {
                const { equipoId, fechaRetiro, fechaDevolucion, motivo } = res.data;
                setForm({ equipoId, fechaRetiro, fechaDevolucion, motivo });
            });
        }
    }, [id]);

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
            if (esEdicion) {
                await editarSolicitud(id, form);
            } else {
                await crearSolicitud({ ...form, usuarioId: usuario.id });
            }
            navigate('/solicitudes');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar la solicitud.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container mt-4" style={{ maxWidth: '500px' }}>
            <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => navigate(-1)}>← Volver</button>
            <h2 className="mb-4">{esEdicion ? 'Editar Solicitud' : 'Nueva Solicitud'}</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                {!esEdicion && (
                    <div className="mb-3">
                        <label className="form-label">Equipo</label>
                        <select name="equipoId" className={`form-select ${errores.equipoId ? 'is-invalid' : ''}`} value={form.equipoId} onChange={handleChange}>
                            <option value="">Seleccioná un equipo</option>
                            {equipos.filter(e => e.estado === 'disponible').map(e => (
                                <option key={e.id} value={e.id}>{e.nombre} — {e.categoria}</option>
                            ))}
                        </select>
                        {errores.equipoId && <div className="invalid-feedback">{errores.equipoId}</div>}
                    </div>
                )}
                <div className="mb-3">
                    <label className="form-label">Fecha de Retiro</label>
                    <input type="date" name="fechaRetiro" className={`form-control ${errores.fechaRetiro ? 'is-invalid' : ''}`} value={form.fechaRetiro} onChange={handleChange} />
                    {errores.fechaRetiro && <div className="invalid-feedback">{errores.fechaRetiro}</div>}
                </div>
                <div className="mb-3">
                    <label className="form-label">Fecha de Devolución</label>
                    <input type="date" name="fechaDevolucion" className={`form-control ${errores.fechaDevolucion ? 'is-invalid' : ''}`} value={form.fechaDevolucion} onChange={handleChange} />
                    {errores.fechaDevolucion && <div className="invalid-feedback">{errores.fechaDevolucion}</div>}
                </div>
                <div className="mb-3">
                    <label className="form-label">Motivo</label>
                    <textarea name="motivo" className={`form-control ${errores.motivo ? 'is-invalid' : ''}`} rows={3} value={form.motivo} onChange={handleChange} />
                    {errores.motivo && <div className="invalid-feedback">{errores.motivo}</div>}
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={cargando}>
                    {cargando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Crear Solicitud'}
                </button>
            </form>
        </div>
    );
};

export default FormSolicitudPage;
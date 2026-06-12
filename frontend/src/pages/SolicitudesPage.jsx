import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getSolicitudes } from '../services/solicitudes.service.js';

const SolicitudesPage = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [total, setTotal] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({ estado: '', categoria: '', desde: '', hasta: '', page: 1, limit: 10 });
    const { usuario, cerrarSesion } = useAuth();
    const navigate = useNavigate();

    const cargarSolicitudes = async () => {
        setCargando(true);
        setError(null);
        try {
            const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== ''));
            const res = await getSolicitudes(params);
            setSolicitudes(res.data.solicitudes);
            setTotal(res.data.total);
        } catch (err) {
            setError('Error al cargar las solicitudes.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargarSolicitudes(); }, [filtros.page]);

    const handleFiltrar = (e) => {
        e.preventDefault();
        setFiltros({ ...filtros, page: 1 });
        cargarSolicitudes();
    };

    const handleChange = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });

    const badgeEstado = (estado) => {
        const colores = { pendiente: 'warning', aprobada: 'success', rechazada: 'danger', cancelada: 'secondary', devuelta: 'info' };
        return <span className={`badge bg-${colores[estado] || 'dark'}`}>{estado}</span>;
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Solicitudes</h2>
                <div className="d-flex gap-2">
                    {['admin', 'encargado',].includes(usuario?.rol)} 
                    <Link to="/solicitudes/nueva" className="btn btn-primary">Nueva Solicitud</Link>
                </div>
            </div>

            {/* Filtros */}
            <form onSubmit={handleFiltrar} className="row g-2 mb-4">
                <div className="col-md-2">
                    <select name="estado" className="form-select" value={filtros.estado} onChange={handleChange}>
                        <option value="">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                        <option value="cancelada">Cancelada</option>
                        <option value="devuelta">Devuelta</option>
                    </select>
                </div>
                <div className="col-md-2">
                    <select name="categoria" className="form-select" value={filtros.categoria} onChange={handleChange}>
                        <option value="">Todas las categorías</option>
                        <option value="notebook">Notebook</option>
                        <option value="proyector">Proyector</option>
                        <option value="cámara">Cámara</option>
                        <option value="kit de red">Kit de red</option>
                    </select>
                </div>
                <div className="col-md-2">
                    <input type="date" name="desde" className="form-control" value={filtros.desde} onChange={handleChange} />
                </div>
                <div className="col-md-2">
                    <input type="date" name="hasta" className="form-control" value={filtros.hasta} onChange={handleChange} />
                </div>
                <div className="col-md-2">
                    <button type="submit" className="btn btn-outline-primary w-100">Filtrar</button>
                </div>
            </form>

            {/* Tabla */}
            {cargando ? (
                <div className="text-center"><div className="spinner-border" /></div>
            ) : error ? (
                <div className="alert alert-danger">{error}</div>
            ) : solicitudes.length === 0 ? (
                <div className="alert alert-info">No hay solicitudes para mostrar.</div>
            ) : (
                <>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Equipo</th>
                                <th>Solicitante</th>
                                <th>Retiro</th>
                                <th>Devolución</th>
                                <th>Estado</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitudes.map(s => (
                                <tr key={s.id}>
                                    <td>{s.id}</td>
                                    <td>{s.equipo?.nombre}</td>
                                    <td>{s.solicitante?.nombre}</td>
                                    <td>{s.fechaRetiro}</td>
                                    <td>{s.fechaDevolucion}</td>
                                    <td>{badgeEstado(s.estado)}</td>
                                    <td><Link to={`/solicitudes/${s.id}`} className="btn btn-sm btn-outline-primary">Ver</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Paginación */}
                    <div className="d-flex justify-content-between align-items-center">
                        <span>Total: {total}</span>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-secondary btn-sm" disabled={filtros.page === 1} onClick={() => setFiltros({ ...filtros, page: filtros.page - 1 })}>Anterior</button>
                            <span className="align-self-center">Página {filtros.page}</span>
                            <button className="btn btn-outline-secondary btn-sm" disabled={filtros.page * filtros.limit >= total} onClick={() => setFiltros({ ...filtros, page: filtros.page + 1 })}>Siguiente</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SolicitudesPage;
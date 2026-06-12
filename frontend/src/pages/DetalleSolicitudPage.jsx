import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getSolicitudById, getHistorial, cancelarSolicitud, aprobarSolicitud, rechazarSolicitud, devolverSolicitud } from '../services/solicitudes.service.js';

const DetalleSolicitudPage = () => {
    const { id } = useParams();
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [solicitud, setSolicitud] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [accionError, setAccionError] = useState(null);

    const cargar = async () => {
        setCargando(true);
        try {
            const [resSol, resHist] = await Promise.all([getSolicitudById(id), getHistorial(id)]);
            setSolicitud(resSol.data);
            setHistorial(resHist.data);
        } catch {
            setError('Error al cargar la solicitud.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargar(); }, [id]);

    const ejecutarAccion = async (accion) => {
        setAccionError(null);
        try {
            if (accion === 'cancelar') await cancelarSolicitud(id);
            if (accion === 'aprobar')  await aprobarSolicitud(id);
            if (accion === 'rechazar') await rechazarSolicitud(id);
            if (accion === 'devolver') await devolverSolicitud(id);
            await cargar();
        } catch (err) {
            setAccionError(err.response?.data?.error || 'Error al ejecutar la acción.');
        }
    };

    const badgeEstado = (estado) => {
        const colores = { pendiente: 'warning', aprobada: 'success', rechazada: 'danger', cancelada: 'secondary', devuelta: 'info' };
        return <span className={`badge bg-${colores[estado] || 'dark'}`}>{estado}</span>;
    };

    const esAdmin = ['admin', 'encargado'].includes(usuario?.rol);
    const esPropietario = solicitud?.usuarioId === usuario?.id;

    if (cargando) return <div className="container mt-4 text-center"><div className="spinner-border" /></div>;
    if (error)    return <div className="container mt-4"><div className="alert alert-danger">{error}</div></div>;

    return (
        <div className="container mt-4" style={{ maxWidth: '700px' }}>
            <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => navigate('/solicitudes')}>← Volver</button>
            <h2 className="mb-3">Solicitud #{solicitud.id}</h2>

            {accionError && <div className="alert alert-danger">{accionError}</div>}

            <div className="card mb-4">
                <div className="card-body">
                    <p><strong>Estado:</strong> {badgeEstado(solicitud.estado)}</p>
                    <p><strong>Equipo:</strong> {solicitud.equipo?.nombre} ({solicitud.equipo?.categoria})</p>
                    <p><strong>Solicitante:</strong> {solicitud.solicitante?.nombre}</p>
                    <p><strong>Motivo:</strong> {solicitud.motivo}</p>
                    <p><strong>Retiro:</strong> {solicitud.fechaRetiro}</p>
                    <p><strong>Devolución:</strong> {solicitud.fechaDevolucion}</p>
                    {solicitud.autorizante && <p><strong>Autorizado por:</strong> {solicitud.autorizante.nombre}</p>}
                </div>
            </div>

            {/* Acciones */}
            <div className="d-flex gap-2 mb-4">
                {esPropietario && solicitud.estado === 'pendiente' && (
                    <button className="btn btn-outline-warning" onClick={() => navigate(`/solicitudes/${id}/editar`)}>Editar</button>
                )}
                {esPropietario && !['devuelta', 'cancelada', 'rechazada'].includes(solicitud.estado) && (
                    <button className="btn btn-outline-secondary" onClick={() => ejecutarAccion('cancelar')}>Cancelar</button>
                )}
                {esAdmin && solicitud.estado === 'pendiente' && (
                    <>
                        <button className="btn btn-success" onClick={() => ejecutarAccion('aprobar')}>Aprobar</button>
                        <button className="btn btn-danger"  onClick={() => ejecutarAccion('rechazar')}>Rechazar</button>
                    </>
                )}
                {esAdmin && solicitud.estado === 'aprobada' && (
                    <button className="btn btn-info" onClick={() => ejecutarAccion('devolver')}>Marcar Devuelta</button>
                )}
            </div>

            {/* Historial */}
            <h5>Historial</h5>
            {historial.length === 0 ? (
                <p className="text-muted">Sin historial.</p>
            ) : (
                <ul className="list-group">
                    {historial.map(h => (
                        <li key={h.id} className="list-group-item">
                            <div className="d-flex justify-content-between">
                                <span><strong>{h.accion}</strong> — {h.usuarioAccion?.nombre}</span>
                                <small className="text-muted">{new Date(h.fechaHora).toLocaleString()}</small>
                            </div>
                            {h.valorAnterior && <small className="text-muted">Anterior: {h.valorAnterior} → Nuevo: {h.valorNuevo}</small>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DetalleSolicitudPage;
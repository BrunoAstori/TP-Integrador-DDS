import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResumen } from '../services/solicitudes.service.js';

const ResumenPage = () => {
    const [resumen, setResumen] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        getResumen()
            .then(res => setResumen(res.data))
            .catch(() => setError('Error al cargar el resumen.'))
            .finally(() => setCargando(false));
    }, []);

    if (cargando) return <div className="container mt-4 text-center"><div className="spinner-border" /></div>;
    if (error) return <div className="container mt-4"><div className="alert alert-danger">{error}</div></div>;

    return (
        <div className="container mt-4">
            <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => navigate('/solicitudes')}>← Volver</button>
            <h2 className="mb-4">Panel de Resumen</h2>

            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Solicitudes Pendientes</h5>
                            <p className="display-6">{resumen.solicitudesPendientes}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Equipos Prestados</h5>
                            <p className="display-6">{resumen.equiposPrestados}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Préstamos Vencidos</h5>
                            <p className="display-6 text-danger">{resumen.totalVencidos}</p>
                        </div>
                    </div>
                </div>
            </div>

            <h5 className="mb-3">Equipos Disponibles por Categoría</h5>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Categoría</th>
                        <th>Cantidad</th>
                    </tr>
                </thead>
                <tbody>
                    {resumen.equiposPorCategoria.map(e => (
                        <tr key={e.categoria}>
                            <td>{e.categoria}</td>
                            <td>{e.cantidad}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {resumen.prestamosVencidos.length > 0 && (
                <>
                    <h5 className="mb-3 mt-4">Detalle Préstamos Vencidos</h5>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Equipo</th>
                                <th>Solicitante</th>
                                <th>Fecha Devolución</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resumen.prestamosVencidos.map(s => (
                                <tr key={s.id}>
                                    <td>{s.id}</td>
                                    <td>{s.equipo?.nombre}</td>
                                    <td>{s.solicitante?.nombre}</td>
                                    <td className="text-danger">{s.fechaDevolucion}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default ResumenPage;
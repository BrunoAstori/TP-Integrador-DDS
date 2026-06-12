import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();
    return (
        <div className="container d-flex flex-column justify-content-center align-items-center vh-100 text-center">
            <h1 className="display-1">404</h1>
            <p className="lead">Página no encontrada.</p>
            <button className="btn btn-primary" onClick={() => navigate('/solicitudes')}>Volver al inicio</button>
        </div>
    );
};

export default NotFoundPage;
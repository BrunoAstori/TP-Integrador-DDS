import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
    const { usuario, cerrarSesion } = useAuth();
    const navigate = useNavigate();

    const handleCerrarSesion = () => {
        cerrarSesion();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container">
                <Link className="navbar-brand" to="/solicitudes">Equipamiento</Link>
                <div className="d-flex gap-3 align-items-center">
                    {usuario && (
                        <>
                            <span className="text-white">Hola, {usuario.nombre}</span>
                            <Link className="nav-link text-white" to="/solicitudes">Solicitudes</Link>
                            {['admin', 'encargado'].includes(usuario.rol) && (
                                <Link className="nav-link text-white" to="/resumen">Resumen</Link>
                            )}
                            <button className="btn btn-outline-light btn-sm" onClick={handleCerrarSesion}>Cerrar Sesión</button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const RutaProtegida = ({ children, roles }) => {
    const { usuario } = useAuth();

    if (!usuario) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(usuario.rol)) return <Navigate to="/solicitudes" replace />;

    return children;
};

export default RutaProtegida;
import { Routes, Route, Navigate } from 'react-router-dom';
import RutaProtegida from './routes/RutaProtegida.jsx';
import {useAuth} from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SolicitudesPage from './pages/SolicitudesPage.jsx';
import DetalleSolicitudPage from './pages/DetalleSolicitudPage.jsx';
import FormSolicitudPage from './pages/FormSolicitudPage.jsx';
import ResumenPage from './pages/ResumenPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import Navbar from './components/Navbar.jsx';

const App = () => {
  const { usuario } = useAuth();

  return (
    <>
      {usuario && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/solicitudes" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/solicitudes" element={
          <RutaProtegida>
            <SolicitudesPage />
          </RutaProtegida>
        } />
        <Route path="/solicitudes/nueva" element={
          <RutaProtegida>
            <FormSolicitudPage />
          </RutaProtegida>
        } />
        <Route path="/solicitudes/:id" element={
          <RutaProtegida>
            <DetalleSolicitudPage />
          </RutaProtegida>
        } />
        <Route path="/solicitudes/:id/editar" element={
          <RutaProtegida>
            <FormSolicitudPage />
          </RutaProtegida>
        } />
        <Route path="/resumen" element={
          <RutaProtegida roles={['admin', 'encargado']}>
            <ResumenPage />
          </RutaProtegida>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );

};

export default App;
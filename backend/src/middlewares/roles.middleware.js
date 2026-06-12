export const soloRol = (...roles) => (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
        return res.status(403).json({ error: 'No tenés permisos para realizar esta acción.' });
    }
    next();
};
// src/models/Solicitud.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/db.js';

class Solicitud extends Model { }

Solicitud.init({
    equipoId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fechaRetiro: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    fechaDevolucion: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    motivo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pendiente'
    },
    autorizadoPor: {
        type: DataTypes.INTEGER,
        allowNull: true // Puede ser null si todavía no fue aprobada
    }
}, {
    sequelize,
    modelName: 'Solicitud',
    tableName: 'solicitudes',
    timestamps: true
});

export default Solicitud;
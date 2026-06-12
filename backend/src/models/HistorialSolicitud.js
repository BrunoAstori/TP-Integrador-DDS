// src/models/HistorialSolicitud.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/db.js';

class HistorialSolicitud extends Model { }

HistorialSolicitud.init({
    solicitudId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    usuarioId: {
        type: DataTypes.INTEGER, // El usuario que hizo la acción
        allowNull: false
    },
    accion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fechaHora: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW // Toma la fecha y hora actual automáticamente
    },
    valorAnterior: {
        type: DataTypes.JSON,
        allowNull: true // No es obligatorio (ej: si es una creación, no hay valor anterior)
    },
    valorNuevo: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'HistorialSolicitud',
    tableName: 'historial_solicitudes',
    timestamps: true // Opcional acá, ya que tenemos el campo fechaHora manual
});

export default HistorialSolicitud;
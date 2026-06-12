// src/models/Equipo.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/db.js';

class Equipo extends Model { }

Equipo.init({
  codigoInventario: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'disponible'
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  requiereAutorizacion: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Equipo',
  tableName: 'equipos',
  timestamps: true
});

export default Equipo;
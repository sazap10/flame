const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const App = sequelize.define(
  'App',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'cancel',
    },
    iconLight: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    iconDark: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    isPublic: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    containerName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    dockerControl: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
  },
  {
    tableName: 'apps',
  }
);

module.exports = App;

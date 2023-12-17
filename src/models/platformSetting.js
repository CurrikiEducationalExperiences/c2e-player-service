const { DataTypes } = require("sequelize");
const { sequelize } = require('../database/database');

const PlatformSetting = sequelize.define("platformsetting", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  lti_client_id: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cee_licensee_id: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cee_secret_key: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  cee_provider_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
});

module.exports = { PlatformSetting };
const Sequelize = require('sequelize');
const sequelize = require('../../database/connection');
module.exports = sequelize.define('Client', {
    id:{
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING(200),
        allowNull: false,
    },
    office_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
    },
    createdBy: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        foreignKey: true
    },
    modifiedBy: {
        type: Sequelize.INTEGER(11),
        foreignKey: true
    },
    createdAt: Sequelize.DATE,
    modifiedAt: Sequelize.DATE,
});

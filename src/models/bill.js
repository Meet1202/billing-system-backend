const Sequelize = require('sequelize');
const sequelize = require('../../database/connection');
module.exports = sequelize.define('Bill', {
    id:{
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    bill_number:{
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
    },
    createdAt: Sequelize.DATE,
    date:{
        type: Sequelize.STRING(20),
        allowNull: false,
    },
    clientId:{
        type: Sequelize.INTEGER(11),
        allowNull: false,
        foreignKey: true
    },
    items: {
        type: Sequelize.JSON,
        allowNull: false
    },
    total_price: {
        type: Sequelize.INTEGER(200),
        allowNull: false
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
    modifiedAt: Sequelize.DATE
});

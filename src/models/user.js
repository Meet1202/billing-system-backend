const Sequelize = require('sequelize');
const sequelize = require('../../database/connection');
module.exports = sequelize.define('User', {
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
    email: {
        type: Sequelize.STRING(300),
        unique: true
    },
    phone: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING(200),
        allowNull: false
    },
    accessToken: {
        type: Sequelize.STRING(200),
        allowNull: true,
        defaultValue: null
    },
    loginAt: {
        type: Sequelize.DATE
    },
    createdAt: Sequelize.DATE,
    modifiedAt: Sequelize.DATE
});

const Client = require('../models/client');
const Bill = require('../models/bill');
const User = require('../models/user');
const commonService = require('./common-services');
const moment = require('moment');
const _ = {
    cloneDeep: require('lodash/cloneDeep')
}

User.hasMany(Client, {foreignKey: 'createdBy'});
Client.belongsTo(User, {foreignKey: 'createdBy', as: 'user'});

const getClientList = (req, res, next) => {
    let currentObj = {};
    commonService.getRecordCounts(req, Client)
        .then((data) => {
            currentObj = data;
            return Client.findAll({
                limit: data.limit,
                offset: data.offset
            });
        })
        .then((client) => {
            commonService.sendResponse(res, client, currentObj);
        }).catch((error) => {
        commonService.sendError('No client found in data base.', next, error);
    });
}

const getClientById = (req, res, next) => {
        if (req.params.id) {
        let id = req.params.id;
        Client.findOne({
            where: {
                id: id,
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: {
                        exclude: ['password', 'accessToken']
                    }
                },
            ]
        }).then((client) => {
            commonService.sendResponse(res, client);
        }).catch((error) => {
            commonService.sendError('No client found in data base.', next, error);
        });
    } else {
        commonService.sendError('Please provide client id.', next);
    }
}

const createClient = (req, res, next) => {
    const createdBy = commonService.getCurrentUserId(req.headers.accesstoken);
    const request = commonService.checkRequest(req, ['name', 'office_name']);
    if (typeof request == 'object') {
        if (request.isProper) {
            const clientObject = _.cloneDeep(req.body);
            clientObject.createdBy = createdBy;
            clientObject.createdAt = moment().format();
            Client.create(clientObject)
                .then((client) => {
                    commonService.sendResponse(res, client);
                }).catch((error) => {
                commonService.sendError('Could\'t create client.', next, error);
            });
        } else {
            commonService.sendError('Please provide ' + request.attr + ' field.', next);
        }
    } else {
        commonService.sendError('Please provide body to create client.', next);
    }
}

const updateClient = (req, res, next) => {
    if (!req.params.clientId) {
        commonService.sendError('Please provide id of client in url.', next);
        return;
    }
    const modifiedBy = commonService.getCurrentUserId(req.headers.accesstoken);
    const request = {isProper: true}
    if (typeof request == 'object') {
        if (request.isProper) {
            const clientObject = _.cloneDeep(req.body);
            clientObject.modifiedBy = modifiedBy;
            clientObject.modifiedAt = moment().format();
            Client.findOne({
                where: {id: req.params.clientId}
            })
                .then((client) => {
                    if (client) {
                        return client.update(clientObject);
                    } else {
                        commonService.sendError('There is no client with id = ' + req.params.id, next);
                    }
                })
                .then((updateResponse) => {
                    commonService.sendResponse(res, updateResponse);
                }).catch((error) => {
                commonService.sendError('Could not updated', next, error);
            });
        } else {
            commonService.sendError('Please provide ' + request.attr + ' field.', next);
        }
    } else {
        commonService.sendError('Please provide body to update client.', next);
    }
}

const deleteClient = (req, res, next) => {
    const id = req.params.clientId;
    Bill.destroy({
        where: {clientId: id}
    })
    Client.destroy({
        where: {id: id}
    })
        .then((client) => {
            commonService.sendResponse(res, 'Client deleted successfully.');
        })
        .catch((error) => {
            commonService.sendError('Client can\'t deleted.', next, error);
        })
};

const getClientBySearchTerm = (req, res, next) => {
    let currentObj = {};
    commonService.getRecordCounts(req, Client)
        .then((data) => {
            currentObj = data;
            return commonService.getDataBySearchTerm(Client, 'name', req.query.term || '', data);
        })
        .then((client) => {
            commonService.sendResponse(res, client, currentObj);
        })
        .catch((error) => {
            commonService.sendError('Can\'t fetched client.', next, error);
        })
}
module.exports = {
    getClientList: getClientList,
    getClientById: getClientById,
    createClient: createClient,
    updateClient: updateClient,
    deleteClient: deleteClient,
    getClientBySearchTerm: getClientBySearchTerm
}

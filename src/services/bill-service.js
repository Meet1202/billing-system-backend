const Bill = require('../models/bill');
const Client = require('../models/Client');
const commonService = require('./common-services');
const moment = require('moment');
const _ = {
    cloneDeep: require('lodash/cloneDeep')
}

Client.hasMany(Bill, {foreignKey: 'clientId'});
Bill.belongsTo(Client, {foreignKey: 'clientId', as: 'client'});

const getBillList = (req, res, next) => {
    let currentObj = {};
    let id = req.params.clientId;
    commonService.getRecordCounts(req, Bill)
        .then((data) => {
            currentObj = data;
            return Bill.findAll({
                where:{
                    clientId: id
                },
                limit: data.limit,
                offset: data.offset
            });
        })
        .then((bill) => {
            commonService.sendResponse(res, bill, currentObj);
        }).catch((error) => {
        commonService.sendError('No bill found in data base.', next, error);
    });
}

const getBillById = (req, res, next) => {
    if (req.params.id) {
        let id = req.params.id;
        Bill.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: Client,
                    as: 'client'
                },
            ]
        }).then((bill) => {
            commonService.sendResponse(res, bill);
        }).catch((error) => {
            commonService.sendError('No bill found in data base.', next, error);
        });
    } else {
        commonService.sendError('Please provide bill id.', next);
    }
}

const createBill = (req, res, next) => {
    const createdBy = commonService.getCurrentUserId(req.headers.accesstoken);
    const request = commonService.checkRequest(req, ['date', 'items', 'total_price', 'clientId']);
    if (typeof request == 'object') {
        if (request.isProper) {
            const billObject = _.cloneDeep(req.body);
            billObject.createdBy = createdBy;
            billObject.createdAt = moment().format();
            Bill.create(billObject)
                .then((bill) => {
                    const id = 'DO-' + bill.dataValues.id;
                    return bill.update({bill_number: id});
                })
                .then((bill) => {
                    commonService.sendResponse(res, bill);
                }).catch((error) => {
                commonService.sendError('Could\'t bill client.', next, error);
            });
        } else {
            commonService.sendError('Please provide ' + request.attr + ' field.', next);
        }
    } else {
        commonService.sendError('Please provide body to bill client.', next);
    }
}

const updateBill = (req, res, next) => {
    if (!req.params.billId) {
        commonService.sendError('Please provide id of bill in url.', next);
        return;
    }
    const modifiedBy = commonService.getCurrentUserId(req.headers.accesstoken);
    const request = {isProper: true}
    if (typeof request == 'object') {
        if (request.isProper) {
            const billObject = _.cloneDeep(req.body);
            billObject.modifiedBy = modifiedBy;
            billObject.modifiedAt = moment().format();
            Bill.findOne({
                where: {id: req.params.billId}
            })
                .then((bill) => {
                    if (bill) {
                        return bill.update(billObject);
                    } else {
                        commonService.sendError('There is no bill with id = ' + req.params.id, next);
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
        commonService.sendError('Please provide body to update bill.', next);
    }
}

const deleteBill = (req, res, next) => {
    const id = parseInt(req.params.billId);
    Bill.destroy({
        where: {id: id}
    })
        .then((bill) => {
            commonService.sendResponse(res, 'Bill deleted successfully.');
        })
        .catch((error) => {
            commonService.sendError('Bill can\'t deleted.', next, error);
        })
};

const getBillBySearchTerm = (req, res, next) => {
    let currentObj = {};
    commonService.getRecordCounts(req, Bill)
        .then((data) => {
            currentObj = data;
            return commonService.getDataBySearchTerm(Bill, 'bill_number', req.query.term || '', data);
        })
        .then((bill) => {
            commonService.sendResponse(res, bill, currentObj);
        })
        .catch((error) => {
            commonService.sendError('Can\'t fetched bill.', next, error);
        })
}
module.exports = {
    getBillList: getBillList,
    getBillById: getBillById,
    createBill: createBill,
    updateBill: updateBill,
    deleteBill: deleteBill,
    getBillBySearchTerm: getBillBySearchTerm
}

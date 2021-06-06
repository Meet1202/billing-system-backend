const User = require('../models/user');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const _ = {
    forEach: require('lodash/forEach'),
    cloneDeep: require('lodash/cloneDeep'),
    merge: require('lodash/merge')
};
const crypto = require("crypto-js");

const SECRET_KEY = 'qBZ0rexLKPg321fvAqYRqD7LhRpLOIO'; // After dot

const ID_SEPARATOR = 'log-ged-in-user';

const sendError = (customMessage, next, server = null) => {
    let serverMessage = null;
    if (server && (server.message || server.msg)) {
        serverMessage = server.message || server.msg;
    }
    const error = new Error(JSON.stringify(
        {
            server: serverMessage,
            custom: customMessage
        }));
    next(error);
}

const sendResponse = (res, object, extraObj) => {
    let sendObj = {
        status: 200,
        data: object
    };
    if(extraObj && Object.keys(extraObj).length > 0){
        sendObj = _.merge(sendObj, extraObj);
    }
    res.status(200).send(sendObj);
}

const checkRequest = (req, arrayOfAttr) => {
    if (req && req.body && arrayOfAttr) {
        let value = {isProper: true};
        _.forEach(_.cloneDeep(arrayOfAttr), (attr) => {
            if (!req.body[attr] || req.body[attr] == '') {
                value = {isProper: false, attr: attr};
            }
        });
        return value;
    }
    return false;
}

const getEncryptedMessage = (text) => {
    return Buffer.from(text).toString('base64')
}

const getDecryptedMessage = (encodedText) => {
    return Buffer.from(encodedText, 'base64').toString()
}

const getEncryptedMessageByCrypto = (text) => {
    return crypto.AES.encrypt(text, SECRET_KEY).toString();
}

const getDecryptedMessageByCrypto = (encodedText) => {
    const bytes = crypto.AES.decrypt(encodedText, SECRET_KEY);
    return bytes.toString(crypto.enc.Utf8);
}

const getCurrentUserId = (token) => {
    const encryptedUserId = token.split(ID_SEPARATOR);
    return getDecryptedMessage(encryptedUserId[1]);
}

const getRecordCounts = (req, module, defaultLimit = 20, defaultPage = 1) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : defaultLimit;
    let page = req.query.page ? parseInt(req.query.page) : defaultPage;
    let offset = 0;
    let totalCount = 0;
    return module.findAndCountAll()
        .then((data) => {
            totalCount = Math.ceil(data.count / limit);
            offset = limit * (page - 1);
            return {totalCount: totalCount, offset: offset, limit: limit};
        });
}

const getDataBySearchTerm = (model, fieldName, term, paginationObj) => {
    return model.findAll({
        where: {
            [fieldName]: {
                [Op.like]: `%${term}%`
            }
        },
        limit: paginationObj.limit || 100,
        offset: paginationObj.offset || 0
    });
}


module.exports = {
    sendError: sendError,
    sendResponse: sendResponse,
    checkRequest: checkRequest,
    getEncryptedMessage: getEncryptedMessage,
    getDecryptedMessage: getDecryptedMessage,
    getEncryptedMessageByCrypto: getEncryptedMessageByCrypto,
    getDecryptedMessageByCrypto: getDecryptedMessageByCrypto,
    ID_SEPARATOR: ID_SEPARATOR,
    getCurrentUserId: getCurrentUserId,
    getRecordCounts: getRecordCounts,
    getDataBySearchTerm: getDataBySearchTerm
};

const User = require('../models/user');
const commonService = require('./common-services');
const moment = require('moment');
const _ = {
    cloneDeep: require('lodash/cloneDeep')
}

const getUserById = (req, res, next) => {
    if (req.body.id) {
        let userId = req.body.id;
        User.findOne({
            where: {
                id: userId
            }
        }).then((user) => {
            delete user.dataValues.password;
            commonService.sendResponse(res, user);
        }).catch((error) => {
            commonService.sendError('No users found in data base.', next, error);
        });
    } else {
        commonService.sendError('Please provide user id.', next);
    }
}

const createUser = (req, res, next) => {
    const createdBy = req.params.userId;
    const request = commonService.checkRequest(req, ['name', 'email', 'phone', 'password']);
    if (typeof request == 'object') {
        if (request.isProper) {
            let userObject = req.body;
            userObject.createdBy = createdBy;
            new Promise((resolve, reject) => {
                try {
                    const round1 = commonService.getEncryptedMessage(userObject.password);
                    const round2 = commonService.getEncryptedMessageByCrypto(round1);
                    const round3 = commonService.getEncryptedMessage(round2);
                    resolve(round3);
                } catch (error) {
                    reject(error || 'Hashing is not working.');
                }
            })
                .then((password) => {
                    userObject.password = password;
                    return User.create(userObject);
                })
                .then((user) => {
                    delete user.dataValues.password;
                    commonService.sendResponse(res, user);
                }).catch((error) => {
                commonService.sendError('Issue creating user please try again later.', next, error);
            });
        } else {
            commonService.sendError('Please provide ' + request.attr + ' field.', next);
        }
    } else {
        commonService.sendError('Please provide body to register user.', next);
    }
}

const loginUser = (req, res, next) => {
    console.log(req.body.email)
    const date = moment().format();
    const request = commonService.checkRequest(req, ['email', 'password']);
    if (typeof request == 'object') {
        if (request.isProper) {
            User.findOne({
                where: {email: req.body.email}
            })
                .then((user) => {
                    if (user) {
                        return new Promise((resolve, reject) => {
                            try {
                                const round1 = commonService.getDecryptedMessage(user.dataValues.password);
                                const round2 = commonService.getDecryptedMessageByCrypto(round1);
                                const originalPassword = commonService.getDecryptedMessage(round2);
                                console.log(originalPassword);
                                if (originalPassword === req.body.password) {
                                    resolve(user);
                                } else {
                                    commonService.sendError('You entered email or password is not correct.', next);
                                }
                            } catch (error) {
                                reject({message: error || 'There is error in encryption.'});
                            }
                        });
                    } else {
                        commonService.sendError('There is no user with id = ' + userId, next);
                    }
                })
                .then((user) => {
                    const accessTokenPrefix = 'AB-' + Math.random();
                    return new Promise((resolve, reject) => {
                        try {
                            const round1 = commonService.getEncryptedMessage(accessTokenPrefix);
                            const round2 = commonService.getEncryptedMessageByCrypto(round1);
                            const hash = commonService.getEncryptedMessage(round2);
                            console.log(hash)
                            resolve({user: user, hash: hash});
                        } catch (error) {
                            reject(error || 'Hashing is not working.');
                        }
                    })
                })
                .then((loginObj) => {
                    const encryptedId = commonService.getEncryptedMessage(loginObj.user.dataValues.id.toString());
                    return loginObj.user.update({
                        loginAt: date,
                        accessToken: loginObj.hash + commonService.ID_SEPARATOR + encryptedId
                    });
                })
                // Todo:: need to pass access token to frontend...
                .then((updateResponse) => {
                    const userResponse = _.cloneDeep(updateResponse);
                    delete userResponse.dataValues['password'];
                    commonService.sendResponse(res, userResponse);
                }).catch((error) => {
                commonService.sendError('User is not registered ot Having some issue to update please try angain later!', next, error);
            });
        } else {
            commonService.sendError('Please provide ' + request.attr + ' field.', next);
        }
    } else {
        commonService.sendError('Please provide password to update user password.', next);
    }
}

const logOutUser = (req, res, next) => {
    const accessToken = req.headers.accesstoken;
    User.findOne({
        where: {accessToken: accessToken}
    })
        .then((user) => {
            return user.update({accessToken: null});
        })
        .then((user) => {
            commonService.sendResponse(res, {message: 'User Logged out successfully.'});
        })
        .catch((error) => {
            commonService.sendError('There is some error please try again.', next, error);
        })
};

const deleteUser = (req, res, next) => {
    const userId = req.params.userId;
    User.destroy({
        where: {id: userId}
    })
        .then((user) => {
            commonService.sendResponse(res, 'User deleted successfully.');
        })
        .catch((error) => {
            commonService.sendError('User can\'t deleted.', next, error);
        })
};

const updateUser = (req, res, next) => {
    const request = commonService.checkRequest(req, []);
    if (typeof request == 'object') {
        if (request.isProper) {
            const accessToken = req.headers.accesstoken;
            const userId = req.params.userId;
            const modifiedBy = commonService.getCurrentUserId(accessToken);
            const userObject = req.body;
            userObject.modifiedAt = modifiedBy;
            User.findOne({
                where: {id: userId}
            })
                .then((user) => {
                    if (user) {
                        return user.update(userObject);
                    } else {
                        commonService.sendError('There is no user with id = ' + userId, next);
                    }
                })
                .then((updateResponse) => {
                    commonService.sendResponse(res, 'User updated successfully.');
                }).catch((error) => {
                commonService.sendError(error, next, error);
            });
        } else {
            commonService.sendError('Please provide ' + request.attr + ' field.', next);
        }
    } else {
        commonService.sendError('Please provide body to update user.', next);
    }
}

const updateUserPassword = (req, res, next) => {
    if (!req.headers.accesstoken) {
        commonService.sendError('Please provide access token.', next);
        return;
    }
    const accessToken = req.headers.accesstoken;
    const parentUserId = commonService.getCurrentUserId(accessToken)
    const userId = req.params.userId;
    const request = commonService.checkRequest(req, ['password']);

    if (typeof request == 'object') {
        if (request.isProper) {
            const userPassword = req.body.password;
            User.findOne({
                where: {id: userId}
            })
                .then(async (user) => {
                    if (user) {
                        let password = userPassword;
                        try {
                            const round1 = commonService.getEncryptedMessage(userPassword);
                            const round2 = commonService.getEncryptedMessageByCrypto(round1);
                            password = commonService.getEncryptedMessage(round2);
                        } catch (error) {
                            commonService.sendError('There is error to update password because of encyption.', next, error);
                            return;
                        }
                        return user.update({password: password, modifiedBy: parentUserId});
                    } else {
                        commonService.sendError('There is no user with id = ' + userId, next);
                    }
                })
                .then((updateResponse) => {
                    commonService.sendResponse(res, 'Password changed successfully.');
                }).catch((error) => {
                commonService.sendError(error, next, error);
            });
        } else {
            commonService.sendError('Please provide ' + request.attr + ' field.', next);
        }
    } else {
        commonService.sendError('Please provide password to update user password.', next);
    }
}

module.exports = {
    getUserById: getUserById,
    createUser: createUser,
    loginUser: loginUser,
    logOutUser: logOutUser,
    deleteUser: deleteUser,
    updateUser: updateUser,
    updateUserPassword: updateUserPassword,
};

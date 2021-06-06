const express = require('express');
const user = express.Router();
const userService = require('./../services/user-service')

user.post('/', [userService.createUser]);

user.put('/login', [userService.loginUser]);

user.put('/logout', [userService.logOutUser]);

user.get('/', [userService.getUserById]);

user.put('/:userId/update', [userService.updateUser]);

user.put('/:userId/change-password', [userService.updateUserPassword]);

user.delete('/:userId', [userService.deleteUser]);

module.exports = user;


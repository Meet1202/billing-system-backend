const routes  = require('express').Router();

const user = require('./user');
const client = require('./client');
const bill = require('./bill');

routes.use('/users', user);
routes.use('/clients', client);
routes.use('/bills', bill);

routes.get('/', (req, res) => {
    res.status(200).json({ message: 'Connected To Dhanlakshmi apis!' });
});

module.exports = routes;

const express = require('express');
const client = express.Router();
const clientService = require('./../services/client-service')

client.get('/all',[clientService.getClientList]);

client.get('/:id', [clientService.getClientById]);

client.post('/', [clientService.createClient]);

client.put('/:clientId/update', [clientService.updateClient]);

client.delete('/:clientId', [clientService.deleteClient]);

client.get('/search', [clientService.getClientBySearchTerm]);

module.exports = client;

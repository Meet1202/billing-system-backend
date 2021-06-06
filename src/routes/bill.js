const express = require('express');
const bill = express.Router();
const billService = require('./../services/bill-service')

bill.get('/all/:clientId',[billService.getBillList]);

bill.get('/:id', [billService.getBillById]);

bill.post('/', [billService.createBill]);

bill.put('/:billId/update', [billService.updateBill]);

bill.delete('/:billId', [billService.deleteBill]);

bill.get('/search', [billService.getBillBySearchTerm]);


module.exports = bill;

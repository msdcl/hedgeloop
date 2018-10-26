const express = require('express');
const router = express.Router();
const stockController = require("./../../app/controllers/stock");
const appConfig = require("./../../config/config")

module.exports.setRouter = (app) => {

    let baseUrl = appConfig.apiVersion;


    app.post(`${baseUrl}/getAllStocks` ,stockController.getAllStocks);
    app.post(`${baseUrl}/addStocks` ,stockController.createStock);
    app.post(`${baseUrl}/getStockData` ,stockController.getStockData);
   
  
}
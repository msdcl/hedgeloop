const stockController = require("./../../app/controllers/stock");

let addStockDataToHistory = ()=>{
    stockController.stockPriceHistory()
}
module.exports = {
    addStockDataToHistory:addStockDataToHistory
}
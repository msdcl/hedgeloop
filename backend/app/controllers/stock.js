const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const sock_session = require('../libs/activeSockets')
// const check = require('../libs/checkLib')
// const passwordLib = require('./../libs/generatePasswordLib');
// const token = require('../libs/tokenLib')
// const redis = require('../libs/redisLib')
// const sendEmail = require('../libs/sendEmails')
/* Models */
const StockModel = mongoose.model('Stock');
const HistoryModel = mongoose.model('StockHistory');


let createStock  = (req,res)=>{
  
    let newStock = new StockModel({
        id: shortid.generate(),
        name: req.body.name,
        price: req.body.price,
        time: time.getEpoch()
    })

    newStock.save((err, newStock) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'createStock', 10)
            let apiResponse = response.generate(true, 'Failed to add new stock', 500, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'New stock added', 200, newStock)
            res.send(apiResponse)
        }
    })
}
 let updateStockPrice =  (stock)=>{
    StockModel.findOneAndUpdate({ 'name': stock.name},{$set:{'price':stock.price , 'time':stock.time}}, { new: true }, (err, result) => {

        if (err) {
            console.log(err)
            let apiResponse = response.generate(true, ' stock updation failed', 400, err)
            console.log(apiResponse)
        } else {
           console.log(result);
        }
    })
 }

 let stockPriceHistory  = ()=>{
     let getALlStocks = ()=>{
         return new Promise((resolve,reject)=>{
            StockModel.find()
            .select('-_id -__v')
            .exec((err, result) => {
              if (err) {
                  
                console.log(err)
                logger.error(err.message, 'stockPriceHistory:getAllStocks', 10)
                let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
                reject(apiResponse)
              } else {
               
                resolve(result)
        
              }
            })
         })
     }

     let addHistory = (allStocks)=>{
        return new Promise((resolve,reject)=>{
            for(let stock of allStocks){
                let newStock = new HistoryModel({
                    id: shortid.generate(),
                    name: stock.name,
                    price: stock.price,
                    time: stock.time
                })
            
                newStock.save((err, newStock) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'addHistory', 10)
                        let apiResponse = response.generate(true, 'Failed to add in stock history', 500, null)
                        reject(apiResponse)
                    } else {
                     let currPrice= getRandomArbitrary(Number(stock.price)-10,Number(stock.price)+10);
                     stock['price']=''+currPrice;
                     stock['time']= time.getEpoch();
                     updateStockPrice(stock);
                     let clients = sock_session.sessions;
                     for(let client of clients){
                         client.emit('new-stock-prices',stock)
                     }
                    }
                })
            }
           let clients = sock_session.sessions;
           for(let client of clients){
               client.emit('last-stock-prices',allStocks)
           }
            resolve("20 entries in history")
        })
        
     }

     getALlStocks()
         .then(addHistory)
         .then((resolve) => {
           
            console.log(resolve)
        })
        .catch((err) => {
            console.log(err);
        })
 }

  let getAllStocks =  (req,res)=>{
    StockModel.find()
    .select('-_id -__v')
    .exec((err, result) => {
      if (err) {
          
        console.log(err)
        logger.error(err.message, 'getAllStocks', 10)
        let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
        res.send(apiResponse)
      } else {
        console.log('all Stocks on platform')

        let apiResponse = response.generate(false,'All stocks' , 200, result)
        res.send(apiResponse)

      }
    })
  }
  
  let getRandomArbitrary=(min, max)=> {
    return  Math.floor(Math.random()*(max-min+1)+min)
}
  
let getStockData = (req,res)=>{
    HistoryModel.find({'name':req.body.name})
    .select('-_id -__v')
    .sort({time:1})
    .exec((err, result) => {
      if (err) {
          
        console.log(err)
        logger.error(err.message, 'geStockData', 10)
        let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
        res.send(apiResponse)
      } else {
        console.log('stocks data')

        let apiResponse = response.generate(false,'stocks data' , 200, result)
        res.send(apiResponse)

      }
    })
}
module.exports = {
    createStock:createStock,
    getAllStocks:getAllStocks,
    stockPriceHistory:stockPriceHistory,
    getStockData:getStockData
}
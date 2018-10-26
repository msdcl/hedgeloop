'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let userSchema = new Schema({
  id: {
    type: String,
    default: '',
    index: true,
    unique: true
  },
  name: {
    type: String,
    default: ''
  },
  price: {
    type: String,
    default: ''
  },
  time: {
    type: String,
    default: ''
  }

})


mongoose.model('Stock', userSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const domainSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('Domain', domainSchema);
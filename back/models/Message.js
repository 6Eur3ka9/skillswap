const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const messageSchema = new Schema({
  exchangeId: {
    type: Schema.Types.ObjectId,
    ref: 'Exchange',
    required: true
  },
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  readAt: Date
});
module.exports = mongoose.model('Message', messageSchema);
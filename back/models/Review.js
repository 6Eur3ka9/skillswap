const mongoose = require('mongoose');
const { Schema } = mongoose;




const reviewSchema = new Schema({
  exchangeId: {
    type: Schema.Types.ObjectId,
    ref: 'Exchange',
    required: true
  },
  reviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  revieweeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    required: true
  },
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('Review', reviewSchema);
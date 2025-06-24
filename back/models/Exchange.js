const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const exchangeSchema = new Schema({
  listingId: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  requesterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  completedAt: Date,
  cancelledAt: Date
});
module.exports = mongoose.model('Exchange', exchangeSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listingId: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});
favoriteSchema.index({ userId: 1, listingId: 1 }, { unique: true });
module.exports = mongoose.model('Favorite', favoriteSchema);
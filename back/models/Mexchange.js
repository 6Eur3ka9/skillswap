const mongoose = require('mongoose');
const { Schema } = mongoose;

const mexchangeSchema = new Schema({
  participants: [
    { type: Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mexchange', mexchangeSchema);
const mongoose = require('mongoose');
const { Schema } = mongoose;

const skillSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['remote', 'physical']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('Skill', skillSchema);

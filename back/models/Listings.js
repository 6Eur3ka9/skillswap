const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const listingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  modality: {
    type: String,
    required: true,
    enum: ['remote', 'physical']
  },
  offeredSkills: [{
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  }],
  wantedSkills: [{
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  }],
  domains: [{
    type: Schema.Types.ObjectId,
    ref: 'Domain'
  }],
location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: [{ type: Number }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profilePicture: {
    type: String,
    required: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

listingSchema.index({ modality: 1, domains: 1 });
listingSchema.index({ offeredSkills: 1 });
listingSchema.index({ wantedSkills: 1 });
listingSchema.index({ location: '2dsphere' }, { sparse: true });
module.exports = mongoose.model('Listing', listingSchema);
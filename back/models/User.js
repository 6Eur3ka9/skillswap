const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 25,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    maxlength: 20,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    maxlength: 20,
    trim: true
  },
  city: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  profilePicture: {
    type: String,
    default: 'defaultprofile.jpg'
  },
  skillsOffered: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
  skillsWanted: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
  domains: [{ type: Schema.Types.ObjectId, ref: 'Domain' }],
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Listing' }],
  tokenVersion: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);

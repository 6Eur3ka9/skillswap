const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const router = express.Router();
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_pictures',
    format: async (req, file) => 'jpg', 
    public_id: (req, file) => file.fieldname + '-' + Date.now(),
  },
});

const upload = multer({ storage: storage });

router.post('/register', async (req, res) => {
  const { name, username, phone, city, date, email, password } = req.body;
  const created_at = new Date();
  const profilePicture = 'defaultprofile.jpg'; 

  

  try {
    if (!name || !username || !phone || !city || !date || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    console.log(req.body);
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ msg: 'Username or Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username,
      city,
      phone,
      date,
      email,
      password: hashedPassword,
      created_at,
      profilePicture 
    });

    await newUser.save();
    res.status(201).json({ msg: 'User registered successfully', userId: newUser._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid email credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid password credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_JWT, { expiresIn: '1h' });
    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/uploadProfilePicture', upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ msg: 'User ID is required' });
    }
    console.log('Received userId:', userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    console.log('File:', JSON.stringify(req.file, null, 2)); 
    console.log('User:', JSON.stringify(user, null, 2)); 

    user.profilePicture = req.file.path; 
    
    await user.save();

    res.status(200).json({ msg: 'Profile picture uploaded successfully', profilePicture: user.profilePicture });
  
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error(err); 
  }
});

router.get('/user/:userid', async (req, res) => {
  const { userid } = req.params;
  try {
    const user = await User.findById(userid).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving user data' });
    console.error(error);
  }
});

module.exports = router;

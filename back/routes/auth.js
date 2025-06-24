require('dotenv').config()
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Session = require('../models/Session')
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('cloudinary').v2
const router = express.Router()
const { authenticateJWT } = require('../middleware/authenticate');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profile_pictures',
    format: async () => 'jpg',
    public_id: file => `${file.fieldname}-${Date.now()}`
  }
})
const upload = multer({ storage })

function createAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}

function createRefreshToken(payload) {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}


router.post('/register', async (req, res) => {
  try {
    const { name, username, phone, city, dateOfBirth, email, password } = req.body
    
    
    if (!name || !username || !phone || !city || !dateOfBirth || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' })
    }
    const existingUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existingUser) return res.status(400).json({ msg: 'Username or Email already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      name,
      username,
      city,
      phone,
      dateOfBirth,
      email,
      password: hashedPassword,
      created_at: new Date(),
      profilePicture: 'defaultprofile.jpg'
    })
    await newUser.save()

    const payload = { userId: newUser._id }
    const accessToken  = createAccessToken(payload)
    const refreshToken = createRefreshToken(payload)


    await Session.create({
      userId: newUser._id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7*24*60*60*1000)
    })

    res.json({ userId: newUser._id, accessToken, refreshToken })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Server error' })
  }
})


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ msg: 'Invalid email credentials' })
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ msg: 'Invalid password credentials' })

    const payload = { userId: user._id }
    const accessToken  = createAccessToken(payload)
    const refreshToken = createRefreshToken(payload)


    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7*24*60*60*1000)
    })

    res.json({ userId: user._id, accessToken, refreshToken })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Server error' })
  }
})


router.post('/refresh_token', async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(401).json({ msg: 'No token provided' })

  try {

    const session = await Session.findOne({ refreshToken })
    if (!session) return res.status(401).json({ msg: 'Invalid refresh token' })

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, payload) => {
      if (err) return res.status(401).json({ msg: 'Invalid refresh token' })

      const newPayload      = { userId: payload.userId }
      const newAccessToken  = createAccessToken(newPayload)
      const newRefreshToken = createRefreshToken(newPayload)

    
      session.refreshToken = newRefreshToken
      session.expiresAt    = new Date(Date.now() + 7*24*60*60*1000)
      await session.save()

      res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken })
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Server error' })
  }
})





router.post('/uploadProfilePicture', authenticateJWT, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ msg: 'User not found' })

   
      
    user.profilePicture = req.body.profilePicture.uri
    await user.save()
    res.status(200).json({ profilePicture: user.profilePicture })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Server error' })
  }
})


router.get('/user/:userid', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.params.userid).select('-password')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.status(200).json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/logout', authenticateJWT, async (req, res) => {
  const { refreshToken } = req.body;

  await Session.deleteOne({ refreshToken, userId: req.user.userId });

  res.send({ msg: 'Déconnecté' });
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const Listing = require('../models/Listings');
const Skill = require('../models/skill');
const Domain = require('../models/Domain');

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const router = express.Router();
const { authenticateJWT } = require('../middleware/authenticate');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'listings_pictures',
    format: async () => 'jpg',
    public_id: file => `${file.fieldname}-${Date.now()}`
  }
});
const upload = multer({ storage });






router.post('/create-listing',authenticateJWT, upload.single('listingsPicture'), async (req, res) => {
  try {
    let {
      title,
      description,
      modality,
      offeredSkills = [],
      wantedSkills = [],
      domains = [],
      latitude,
      longitude,
      userId
    } = req.body;

 
    if (!title || !description || !modality || !userId) {
      return res.status(400).json({ msg: 'Veuillez renseigner tous les champs obligatoires.' });
    }

    
    if (typeof offeredSkills === 'string') offeredSkills = offeredSkills.split(',').map(s => s.trim());
    if (typeof wantedSkills === 'string') wantedSkills = wantedSkills.split(',').map(s => s.trim());
    if (typeof domains === 'string') domains = domains.split(',').map(s => s.trim());

    if (!offeredSkills.length || !wantedSkills.length) {
      return res.status(400).json({ msg: 'Veuillez indiquer au moins une compétence offerte et recherchée.' });
    }

  
    const offeredSkillIds = await Promise.all(
      offeredSkills.map(async name => {
        let skill = await Skill.findOne({ name });
        if (!skill) skill = await Skill.create({ name, category: modality });
        return skill._id;
      })
    );
    const wantedSkillIds = await Promise.all(
      wantedSkills.map(async name => {
        let skill = await Skill.findOne({ name });
        if (!skill) skill = await Skill.create({ name, category: modality });
        return skill._id;
      })
    );
    const domainIds = await Promise.all(
      domains.map(async name => {
        let domain = await Domain.findOne({ name });
        if (!domain) domain = await Domain.create({ name });
        return domain._id;
      })
    );


    const listingData = {
      user: userId,
      title,
      description,
      modality,
      offeredSkills: offeredSkillIds,
      wantedSkills: wantedSkillIds,
      domains: domainIds,
      isActive: true,
      profilePicture: req.body.image.uri || null,
      created_at: new Date(),
      updated_at: new Date()
    };


    if (modality === 'physical' && latitude != null && longitude != null) {
      listingData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }


    const newListing = await Listing.create(listingData);
    return res.status(201).json({ msg: 'Annonce créée avec succès.', listing: newListing });
  } catch (err) {
    console.error('Error creating listing:', err);
    return res.status(500).json({ msg: 'Erreur serveur.' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const listings = await Listing.find({ isActive: true })
      .populate('user', '-password')
      .populate('offeredSkills')
      .populate('wantedSkills')
      .populate('domains');
    return res.status(200).json({ listings });
  } catch (err) {
    console.error('Error fetching listings:', err);
    return res.status(500).json({ msg: 'Erreur serveur.' });
  }
});

router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('user', '-password')
      .populate('offeredSkills')
      .populate('wantedSkills')
      .populate('domains');
    if (!listing) return res.status(404).json({ msg: 'Annonce non trouvée' });
    res.json({ listing });
  } catch (err) {
    console.error('Error fetching listing by id:', err);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

router.get('/user/:userId',authenticateJWT, async (req, res) => {
  const { userId } = req.params;
  try {

    const listings = await Listing.find({ user: userId, isActive: true })
      .populate('offeredSkills')  
      .populate('wantedSkills')   
      .populate('domains')       
      .populate('user', '-password'); 

    return res.json({ listings });
  } catch (err) {
    console.error('Error fetching listings by userId:', err);
    return res.status(500).json({ msg: 'Erreur serveur' });
  }
});


module.exports = router;

const express = require('express');
const path = require('path');
const router = express.Router();
const cloudinary = require('cloudinary').v2; // Import Cloudinary SDK
const fs = require('fs');
const multiparty = require('multiparty');
// Configure Cloudinary with your credentials
cloudinary.config({ 
  cloud_name: 'dimpjogcr', 
  api_key: '577184584142339', 
  api_secret: 'yd-2vMTFJsrdIpe2nqeIg6vCRqI' 
});

// Image upload using multer with promises
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/img';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, 'public/img');
  },
  filename: (req, file, cb) => {
    var filetype = '';
    if (file.mimetype === 'image/gif') {
      filetype = 'gif';
    }
    if (file.mimetype === 'image/png') {
      filetype = 'png';
    }
    if (file.mimetype === 'image/jpeg') {
      filetype = 'jpg';
    }
    cb(null, 'image-' + Date.now() + '.' + filetype);
  },
});

const upload = multer({ storage: storage });

// Function to upload file with Multer and return a Promise
const uploadFile = (req, res) => {
  return new Promise((resolve, reject) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(req.file);
      }
    });
  });
};

// Handle image upload endpoint
router.post('/image', async (req, res) => {
  const form = new multiparty.Form();
try{
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: err.message },
      });
    }

    const file = files.file[0]; // Assuming 'file' is the field name for the uploaded file

    if (!file) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: 'Please upload a valid file.' },
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(file.path);

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        cloudinaryUrl: result.secure_url,
        fileName: result.original_filename,
        file:file.path
      },
    });
  });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      error: { code: 400, message: error.message },
    });
  }
});
module.exports = router


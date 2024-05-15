const express = require('express');
const path = require('path');
const router = express.Router();
/**Image upload using multer */
const cloudinary = require('cloudinary').v2; // Import Cloudinary SDK
var multer = require('multer');
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/img');
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

var upload = multer({ storage: storage });

cloudinary.config({ 
  cloud_name: 'dimpjogcr', 
  api_key: '577184584142339', 
  api_secret: 'yd-2vMTFJsrdIpe2nqeIg6vCRqI' 
});

var fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/document');
  },
  filename: (req, file, cb) => {
    console.log(file);
    var ext = file.mimetype.split("/")[1]

    cb(null, 'document-' + Date.now() + `.${ext}` );
  },
});

var uploadJson = multer({ storage: fileStorage });


// module.exports = (app) => {
  // var router = require('express').Router();

 router.post('/image',async function (req, res) {
    try{
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: 'Please upload a valid file.' },
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path);
    // console.log(result,"=======================");
    return res.status(200).json({
          success: true,
          message: "Image upload successfully",
          data:{
            url: result.url,
      fileName: result.original_filename,
          }
        });
    // return res.send('Image uploaded successfully!',req.file.filename);
    // return res.json({
    //   filePath: 'img/' + req.file.filename,
    //   fileName: req.file.filename,
    // });
    }catch(error){
      
        return res.status(400).json({
          success: false,
          error: { code: 400, message: error },
        });
      
    }  
  });

  router.post(
    '/document',
    uploadJson.single('file'),
    function (req, res, next) {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: 'Please upload a valid document file.' },
        });
      }
      return res.json({
        filePath: 'document/' + req.file.filename,
        fileName: req.file.filename,
      });
    }
  );

  // app.use('/api', router);
// };
module.exports = router


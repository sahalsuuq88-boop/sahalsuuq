// import express from "express";
import multer from "multer";
// import  streamifier from "streamifier";
// import dotenv from 'dotenv';
// import { resolve } from "path";
import cloudinary from '../config/cloudinary.js'
import {CloudinaryStorage} from 'multer-storage-cloudinary'







// const storage = multer.memoryStorage();
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "awl-products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});
const upload = multer({storage})

// cloudRouter.post('/', upload.single('image'), async(req, res) => {
//     try {
//         if(!req.file){
//             return res.status(400).send("No File Uploaded")
//         }
//         // function to handle the stream upload to cloudinary
//         const streamUpload = (filBuffer) => {
//             return new Promise((resolve, reject) => {
//                 const stream = cloudinary.uploader.upload_stream((error, result) => {
//                     if(result){
//                         resolve(result);
//                     }else{
//                         reject(error)
//                     }
//                 });
//                 // Use streamifier to convert file buffer to a stream
//                 streamifier.createReadStream(filBuffer).pipe(stream)
//             })
//         }
//         // call the streamUpload function
//         const result = await streamUpload(req.file.buffer)

//         // Respond with the upload image url
//         res.json({imageUrl : result.secure_url})
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("server error")
//     }
// })

export default upload;
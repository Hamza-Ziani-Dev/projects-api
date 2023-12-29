const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const {User, validateUpdateUser} = require('../models/User');
const {Post } = require("../models/Post");
const { Comment } = require("../models/Comment");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
  cloudinaryRemoveMultipleImage
} = require("../utils/cloudinary");
const path = require('path');
const fs = require('fs');


/**------------- Get Users Count ----------------------------------
 * @desc    Get Users Count
 * @route   /api/users/count
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
 const getUsersCountCtrl = asyncHandler(async (req, res) => {
   const count = await User.count();
   res.status(200).json(count);
 });



/**------------- Get All Users----------------------------------
 * @desc    Get Users
 * @route   /api/users/profile
 * @method  GET
 * @access  private (Only Admin)
 ------------------------------------------------*/
 const getAllUsersCtrl = asyncHandler (async (req,res,next)=>{
    
    const users = await User.find().select("-password");
    res.status(200).json(users);

 });

 /**---------------- Get One User -------------------------------
 * @desc    Get One User
 * @route   /api/users/profile/:id
 * @method  GET
 * @access  private (Only Admin)
 ------------------------------------------------*/
 const getOneUserCtrl = asyncHandler (async (req,res,next)=>{
   const user = await User.findById(req.params.id).select("-password").populate("posts");
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }

  res.status(200).json(user);
});


/**---------------- Update User Profile -------------------------------
 * @desc    Update User Profile
 * @route   /api/users/profile/:id
 * @method  PUT
 * @access  private (only user himself)
 ------------------------------------------------*/
 const updateUserCtrl = asyncHandler(async (req,res) => {
    //validate data before
  const { errors } = validateUpdateUser(req.body);
  console.log(errors);
  if (errors) {
    return res.status(400).json({ message: errors.details[0].message });
  }

// HashPassword:
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id,{
      $set: {
        username: req.body.username,
        password: req.body.password,
        bio: req.body.bio,
      },
    },
    { new: true }).select("-password");
  res.status(200).json(updatedUser);
});


 /**-------------- Delete One User ---------------------------------
 * @desc    Delete One User
 * @route   /api/users/profile/:id
 * @method  DELETE
 * @access  private (Only Admin Or User Him Self)
 ------------------------------------------------*/
 const deleteUserCtrl = asyncHandler (async (req,res,next)=>{
  // 1. Get the user from DB
  const user = await User.findOne({_id:req.params.id});

  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

//   // 2. Get all posts from DB
  const posts = await Post.find({ user: user._id });

//   // 3. Get the public ids from the posts
  const publicIds = posts?.map((post) => post.image.publicId);

//   // 4. Delete all posts image from cloudinary that belong to this user
  if(publicIds?.length > 0) {
    await cloudinaryRemoveMultipleImage(publicIds);
  }

//   // 5. Delete the profile picture from cloudinary
  if(user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }
  
//   // 6. Delete user posts & comments
   await Post.deleteMany({ user: user._id });
   await Comment.deleteMany({ user: user._id });

//   // 7. Delete the user himself
  const userDelete = await User.findByIdAndDelete(req.params.id);


//   // 8. Send a response to the client
  res.status(200).json({ message: "Your Profile Has Been Deleted" });
  
  
});



/**---------------- Profile Photo Upload -------------------------------
 * @desc    Profile Photo Upload
 * @route   /api/users/profile/profile-photo-upload
 * @method  POST
 * @access  private (only logged in user)
 ------------------------------------------------*/
 const profilePhotoUploadCtrl = asyncHandler(async (req, res) => {
  // 1. Validation
  if (!req.file) {
    return res.status(400).json({ message: "no file provided" });
  }

  // 2. Get the path to the image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

  // // 3. Upload to cloudinary
 const result = await cloudinaryUploadImage(imagePath);

  // 4. Get the user from DB
  const user = await User.findById(req.user.id);

  // 5. Delete the old profile photo if exist
  if (user.profilePhoto?.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }

  // 6. Change the profilePhoto field in the DB
  user.profilePhoto = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await user.save();

  // 7. Send response to client
  res.status(200).json({
    message: "your profile photo uploaded successfully",
    profilePhoto: { url: result.secure_url, publicId: result.public_id },
  });

  // 8. Remvoe image from the server
  fs.unlinkSync(imagePath);
});

 module.exports = {
    getAllUsersCtrl,
    getOneUserCtrl,
    deleteUserCtrl,
    getUsersCountCtrl,
    updateUserCtrl,
    profilePhotoUploadCtrl
 }
const express = require("express");
const { 
  getAllUsersCtrl,
  getOneUserCtrl,
  updateUserCtrl,
  deleteUserCtrl,
  profilePhotoUploadCtrl,
  getUsersCountCtrl
} = require("../controllers/userController");
const {verifyToken,verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyTokenAndAuthorization} = require("../middlewares/verifyToken")
const validateObjectId = require("../middlewares/validateObjectId");
const photoUpload = require("../middlewares/photoUpload");
const router = express.Router();


// /api/users/profile/ 
router.route("/profile").get(verifyTokenAndAdmin,getAllUsersCtrl);


// /api/users/count/ 
router.route("/count").get(verifyTokenAndAdmin,getUsersCountCtrl);
// /api/users/profile/profile-photo-upload
// /api/users/profile/profile-photo-upload
router
  .route("/profile/profile-photo-upload")
  .post(verifyToken, photoUpload.single("image"),profilePhotoUploadCtrl);

// /api/users/profile/:id
router
  .route("/profile/:id")
  .get(validateObjectId,getOneUserCtrl)
  .put(validateObjectId,verifyTokenAndOnlyUser,updateUserCtrl)
  .delete(validateObjectId, verifyTokenAndAuthorization,deleteUserCtrl);


module.exports = router;

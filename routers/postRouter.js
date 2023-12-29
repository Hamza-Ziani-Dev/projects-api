const express = require("express");
const {verifyToken} = require("../middlewares/verifyToken")
const validateObjectId = require("../middlewares/validateObjectId");
const photoUpload = require("../middlewares/photoUpload");
const {
    createPostCtrl,
    getAllPostsCtrl,
    getOnePostsCtrl,
    getCountPostsCtrl,
    deletePostsCtrl,
    updatePostsCtrl,
    updatePostImageCtrl,
    toggleLikeCtrl} = require("../controllers/postController");
const router = express.Router();


// /api/posts :
router.route("/")
.get(getAllPostsCtrl)
.post(verifyToken,photoUpload.single("image"),createPostCtrl);


// /api/posts/count
router.route("/count").get(getCountPostsCtrl)

// /api/posts/:id
router.route("/:id")
.get(validateObjectId,getOnePostsCtrl)
.put(validateObjectId,verifyToken,updatePostsCtrl)
.delete(validateObjectId,verifyToken,deletePostsCtrl);

// /api/posts/update-image/:id
router.route("/update-image/:id").put(validateObjectId, verifyToken, photoUpload.single("image"), updatePostImageCtrl);


// /api/posts/like/:id
router.route("/like/:id").put(validateObjectId,verifyToken,toggleLikeCtrl);

module.exports = router;

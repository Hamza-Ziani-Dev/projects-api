const express = require("express");
const {verifyToken} = require("../middlewares/verifyToken")
const validateObjectId = require("../middlewares/validateObjectId");
const photoUpload = require("../middlewares/photoUpload");
const {
    createTaskCtrl,
    getAllTasksCtrl
    // getAllPostsCtrl,
    // getOnePostsCtrl,
    // getCountPostsCtrl,
    // deletePostsCtrl,
    // updatePostsCtrl,
    // updatePostImageCtrl,
    // toggleLikeCtrl
} = require("../controllers/tasksController");
const router = express.Router();


// /api/tasks :
router.route("/")
.get(verifyToken,getAllTasksCtrl)
.post(verifyToken,photoUpload.single("image"),createTaskCtrl);






module.exports = router;

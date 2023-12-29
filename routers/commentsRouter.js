const express = require("express");
const {verifyToken, verifyTokenAndAdmin} = require("../middlewares/verifyToken");
const {validateObjectId} = require("../middlewares/validateObjectId");
const { createCommentCtrl ,getAllCommentsCtrl, deleteCommentCtrl, updateCommentCtrl} = require("../controllers/commentsController");
const router = express.Router();



// /api/comments:
router.route("/")
.get(verifyTokenAndAdmin,getAllCommentsCtrl)
.post(verifyToken,createCommentCtrl)

// /api/comments/:id
router.route("/:id")
.delete(verifyToken,deleteCommentCtrl)
.put(verifyToken,updateCommentCtrl);

module.exports = router;

const express = require("express");
const {verifyToken} = require("../middlewares/verifyToken")
const validateObjectId = require("../middlewares/validateObjectId");
const photoUpload = require("../middlewares/photoUpload");
const {
    createTaskCtrl,
    getAllTasksCtrl,
    deleteTasksCtrl,
    updateTasksCtrl,
    getOneTasksCtrl,
} = require("../controllers/tasksController");
const router = express.Router();


// /api/tasks :
router.route("/")
.get(getAllTasksCtrl)
.post(verifyToken,photoUpload.single("image"),createTaskCtrl);




// /api/tasks/:id
router.route("/:id")
.get(validateObjectId,getOneTasksCtrl)
.put(validateObjectId,updateTasksCtrl)
.delete(validateObjectId,deleteTasksCtrl);




module.exports = router;

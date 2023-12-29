const express = require("express");
const { verifyTokenAndAdmin} = require("../middlewares/verifyToken");
const {validateObjectId} = require("../middlewares/validateObjectId");
const { createCategoryCtrl,getAllCategoryCtrl,deleteCategoryCtrl} = require("../controllers/categoriesController");
const router = express.Router();



// /api/categories
router.route("/")
.get(getAllCategoryCtrl)
.post(verifyTokenAndAdmin,createCategoryCtrl)

// /api/categories/:id
router.route("/:id")
.delete(verifyTokenAndAdmin,deleteCategoryCtrl)

module.exports = router;

const asyncHandler = require("express-async-handler");
const {
  Category,
  validateCreateCategory,
} = require("../models/Category");
const { User } = require("../models/User");

/**-----------------------------------------------
 * @desc    Create New Category
 * @route   /api/categories
 * @method  POST
 * @access  private (only Admin)
 ------------------------------------------------*/
const createCategoryCtrl = asyncHandler(async (req, res) => {
  const { error } = validateCreateCategory(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

//   const category = await Category.findById(req.user.id);

  const category = await Category.create({
    title: req.body.title,
    user : req.user.id
  });

  res.status(201).json(category);
});

/**-----------------------------------------------
 * @desc    Get All Categories
 * @route   /api/categories
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
const getAllCategoryCtrl = asyncHandler(async (req, res) => {
    jsjjfrfrf
  const category = await Category.find();
  res.status(200).json(category);
});

/**-----------------------------------------------
 * @desc    Delete Categogy
 * @route   /api/categories/:id
 * @method  DELETE
 * @access  private (only admin)
 ------------------------------------------------*/
const deleteCategoryCtrl = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Categorie Not Found" });
  }

  if (req.user.isAdmin) {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Categorie Has Been Deleted" });
  } else {
    res.status(403).json({ message: "Access Denied, Not Allowed" });
  }
});

// /**-----------------------------------------------
//  * @desc    Update Comment
//  * @route   /api/comments/:id
//  * @method  PUT
//  * @access  private (only owner of the comment)
//  ------------------------------------------------*/
// const updateCommentCtrl = asyncHandler(async (req, res) => {
//   const { error } = validateUpdateComment(req.body);
//   if (error) {
//     return res.status(400).json({ message: error.details[0].message });
//   }

//   const comment = await Comment.findById(req.params.id);
//   if(!comment) {
//     return res.status(404).json({ message: "comment not found" });
//   }
  
//   if(req.user.id !== comment.user.toString()) {
//     return res.status(403)
//       .json({ message: "access denied, only user himself can edit his comment" });
//   }

//   const updatedComment = await Comment.findByIdAndUpdate(req.params.id, {
//     $set: {
//       text: req.body.text,
//     }
//   }, { new : true });
  
//   res.status(200).json(updatedComment);
// });

module.exports = {
    createCategoryCtrl,
    getAllCategoryCtrl,
    deleteCategoryCtrl
}
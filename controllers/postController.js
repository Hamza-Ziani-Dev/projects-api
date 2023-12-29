const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const {Post,validateCreatePost, validateUpdatePost} = require("../models/Post");
const {User} = require('../models/User');
const {cloudinaryUploadImage, cloudinaryRemoveImage,} = require("../utils/cloudinary");
const {Comment} = require('../models/Comment');


  /**-----------------------------------------------
   * @desc    Create New Post
   * @route   /api/posts
   * @method  POST
   * @access  private (only logged in user)
   ------------------------------------------------*/
  const createPostCtrl = asyncHandler(async (req, res) => {
    // 1. Validation for image
    if (!req.file) {
      return res.status(400).json({ message: "No Image Provided" });
    }
  
    // 2. Validation for data
    const { error } = validateCreatePost(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
  
    // 3. Upload photo
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);

  
    // 4. Create new post and save it to DB
    const user = await User.findOne({id:req.params.id});
    console.log(user);
    const post = await Post.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      user: user,
      image: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  
    // 5. Send response to the client
    res.status(201).json(post);
  
    // 6. Remove image from the server
    fs.unlinkSync(imagePath);
  });


/**-----------------------------------------------
 * @desc    Get All Posts
 * @route   /api/posts
 * @method  GET
 * @access  public
 ------------------------------------------------*/
const getAllPostsCtrl = asyncHandler(async (req, res) => {
  const POST_PER_PAGE = 3;
  const { pageNumber, category } = req.query;
  let posts;

  if (pageNumber) {
    posts = await Post.find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else if (category) {
    posts = await Post.find({ category })
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else {
    posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  }
  res.status(200).json(posts);
});



/**-----------------------------------------------
 * @desc    Get One Posts
 * @route   /api/posts/:id
 * @method  GET
 * @access  public
 ------------------------------------------------*/
 const getOnePostsCtrl = asyncHandler(async (req, res) => {
  const posts = await Post.findById(req.params.id).populate("user", ["-password"]).populate('comments');
  if(!posts){
    res.status(404).json({ message: "Post Not Found!"})
  }
  res.status(200).json(posts);
});


/**-----------------------------------------------
 * @desc    Get Count All Posts
 * @route   /api/posts/count
 * @method  GET
 * @access  public
 ------------------------------------------------*/
 const getCountPostsCtrl = asyncHandler(async (req, res) => {

  const countPosts = await Post.count();
  res.status(200).json(countPosts);
});

/**-----------------------------------------------
 * @desc    Delete Posts
 * @route   /api/posts/:id
 * @method  DELETE
 * @access  private (Only Admin Or Owner User)
 ------------------------------------------------*/
 const deletePostsCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if(!post){
    res.status(404).json({ message: "Post Not Found!"})
  }
  if(req.user.isAdmin || req.user.id === post.user.toString){
    await Post.findByIdAndDelete(req.params.id);
    await cloudinaryRemoveImage(post.image.publicId);

    // delete All Comments:
    await Comment.deleteMany({postId : post._id});

  res.status(200).json({
    postId:post._id,
    message: "Posts Has Been Deleted Success!"
  });
  }else{
    res.status(403).json({
      message: " Access Denied Forbidden!"
    })
  }

  
});


/**-----------------------------------------------
 * @desc    Update Posts
 * @route   /api/posts/:id
 * @method  PUT
 * @access  private (Only Owner )
 ------------------------------------------------*/
 const updatePostsCtrl = asyncHandler(async (req, res) => {
  // Validation :
  const {errors} = validateUpdatePost(req.body);
  if(errors){
    res.status(400).json({message: errors.details[0].message})
  }

  //Get Post In DB:
  const post = await Post.findById(req.params.id);
  if(!post){
    res.status(400).json({message: "Post Not Found!"})
  }

  // Check User Is Loggin 
  if(req.user.id !== post.user.toString()){
    res.status(403).json({message:"Denied Access!"});
  }
  // Update Post:
  const updatePost = await Post.findByIdAndUpdate(req.params.id,
    {
      $set:{
        title: req.body.title,
        description : req.body.description,
        category : req.body.category
      }
    },{new :true});

  // Send Mresponse To client:
  res.status(200).json({
    updatePost,
    message:"Post Update Success!"
  });
});

/**-----------------------------------------------
 * @desc    Update Post Image
 * @route   /api/posts/upload-image/:id
 * @method  PUT
 * @access  private (only owner of the post)
 ------------------------------------------------*/
const updatePostImageCtrl = asyncHandler(async (req, res) => {
  // 1. Validation
  if (!req.file) {
    return res.status(400).json({ message: "no image provided" });
  }

  // 2. Get the post from DB and check if post exist
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  // 3. Check if this post belong to logged in user
  if (req.user.id !== post.user.toString()) {
    return res
      .status(403)
      .json({ message: "access denied, you are not allowed" });
  }

  // 4. Delete the old image
  await cloudinaryRemoveImage(post.image.publicId);

  // 5. Upload new photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  // 6. Update the image field in the db
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  );

  // 7. Send response to client
  res.status(200).json(updatedPost);

  // 8. Remvoe image from the server
  fs.unlinkSync(imagePath);
});

/**-----------------------------------------------
 * @desc    Toggle Like
 * @route   /api/posts/like/:id
 * @method  PUT
 * @access  private (only logged in user)
 ------------------------------------------------*/
const toggleLikeCtrl = asyncHandler(async (req, res) => {
  const loggedInUser = req.user.id;
  const { id: postId } = req.params;

  let post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "Post Not Found" });
  }

  const isPostAlreadyLiked = post.likes.find(
    (user) => user.toString() === loggedInUser
  );

  if (isPostAlreadyLiked) {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: loggedInUser },
      },
      { new: true }
    );
  } else {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: loggedInUser },
      },
      { new: true }
    );
  }

  res.status(200).json(post);
});


  module.exports = {
    createPostCtrl,
    getAllPostsCtrl,
    getOnePostsCtrl,
    getCountPostsCtrl,
    deletePostsCtrl,
    updatePostsCtrl,
    updatePostImageCtrl,
    toggleLikeCtrl
  }
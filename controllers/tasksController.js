const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const {Task,validateCreateTask,validateUpdateTask} = require("../models/Task");
const {User} = require('../models/User');
const {cloudinaryUploadImage, cloudinaryRemoveImage,} = require("../utils/cloudinary");
// const {Comment} = require('../models/Comment');


  /**-----------------------------------------------
   * @desc    Create New Task
   * @route   /api/task
   * @method  POST
   * @access  private (only logged in user)
   ------------------------------------------------*/
  const createTaskCtrl = asyncHandler(async (req, res) => {
    // 1. Validation for image
    if (!req.file) {
      return res.status(400).json({ message: "No Image Provided" });
    }
    // 2. Validation for data
    const { error } = validateCreateTask(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // 3. Upload photo
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);

    // // 4. Create new task and save it to DB
    const user = await User.findOne({id:req.params.id});
    console.log(user);
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline,
      status: req.body.status,
      user: req.user.id,
      image: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  
    // 5. Send response to the client
    res.status(201).json(task);
  
    // 6. Remove image from the server
    fs.unlinkSync(imagePath);
  });
  
  

/**-----------------------------------------------
 * @desc    Get All Tasks
 * @route   /api/tasks
 * @method  GET
 * @access  public
 ------------------------------------------------*/
const getAllTasksCtrl = asyncHandler(async (req, res) => {
  const itemsPerPage = 10;
  const {page,title, status ,deadline, userId } = req.query;
  let tasks;
  const filters = {};

  if (userId) {
    filters.user = userId;
  }
  if (title) {
    filters.title = title;
  }
  if (status) {
    filters.status = status;
  }
  if (deadline) {
    filters.deadline = { $lte: new Date(deadline) };
  }
  if (page) {
    tasks = await Task.find(filters)
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .sort({ createdAt: -1 })
      .populate("user");
  } else {
    tasks = await Task.find(filters)
      .sort({ createdAt: -1 })
      .populate("user");
  }
  res.status(200).json(tasks);
});

/**-----------------------------------------------
 * @desc    Get One Tasks
 * @route   /api/tasks
 * @method  GET
 * @access  public
 ------------------------------------------------*/
 const getOneTasksCtrl = asyncHandler(async (req, res) => {
  let tasks;
    tasks = await Task.findOne()
      .sort({ createdAt: -1 })
      .populate("user");

  res.status(200).json(tasks);
});


/**-----------------------------------------------
 * @desc    Delete Taks
 * @route   /api/tasks/:id
 * @method  DELETE
 * @access  private (Only Admin Or Owner User)
 ------------------------------------------------*/
 const deleteTasksCtrl = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if(!task){
    res.status(404).json({ message: "Task Not Found!"})
  }
    await Task.findByIdAndDelete(req.params.id);
    // await cloudinaryRemoveImage(task.photo.publicId);

  res.status(200).json({
    message: "Task Has Been Deleted Success!"
  });

  
});


/**-----------------------------------------------
 * @desc    Update Tasks
 * @route   /api/tasks/:id
 * @method  PUT
 * @access  private (Only Owner )
 ------------------------------------------------*/
 const updateTasksCtrl = asyncHandler(async (req, res) => {
  // Validation :
  const {errors} = validateUpdateTask(req.body);
  if(errors){
    res.status(400).json({message: errors.details[0].message})
  }

  //Get Task In DB:
  const task = await Task.findById(req.params.id);
  if(!task){
    res.status(400).json({message: "Task Not Found!"})
  }

  // Check User Is Loggin 
  // if(req.user.id !== task.user.toString()){
  //   res.status(403).json({message:"Denied Access!"});
  // }
  // Update Task:
  const updateTask = await Task.findByIdAndUpdate(req.params.id,
    {
      $set:{
        title: req.body.title,
        deadline : req.body.deadline,
        description : req.body.description,
        status : req.body.status,
      }
    },{new :true});

  // Send Mresponse To client:
  res.status(200).json({
    updateTask,
    message:"Task Update Success!"
  });
});






  module.exports = {
    createTaskCtrl,
    getAllTasksCtrl,
    deleteTasksCtrl,
    updateTasksCtrl,
    getOneTasksCtrl,
  }
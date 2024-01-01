const mongoose = require("mongoose");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const jwt = require("jsonwebtoken");

// Task Schema
const TaskSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    photo: {
    type: Object,
     default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__480.png",
        publicId: null,
    }
    },
   deadline: {
      type: Date,
      trim: true,
      minlength: 5,
      maxlength: 100,
   },
   description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 300,
   },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Populate Posts That Belongs To This Task When he/she Get his/her Profile
// TaskSchema.virtual("posts", {
//   ref: "Post",
//   foreignField: "Task",
//   localField: "_id",
// });


// Task Model
const Task = mongoose.model("Task", TaskSchema);

// Validate Register Task
function validateCreateTask(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().min(5).max(100).required(),
    deadline:Joi.string().trim().min(6).max(100).required(),
    description: Joi.string().trim().min(10).max(300).required(),
  });
  return schema.validate(obj);
}

function validateUpdateTask(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().min(5).max(100),
    deadline:Joi.string().trim().min(6).max(100),
    description: Joi.string().trim().min(10).max(300),
  });
  return schema.validate(obj);
}


module.exports = {
  Task,
  validateCreateTask,
  validateUpdateTask
};
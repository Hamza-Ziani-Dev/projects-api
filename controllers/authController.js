const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const {User, validateRegisterUser,validateLoginUser} = require('../models/User');


/**------------------Register New User -----------------------------
 * @desc    Register New User
 * @route   /api/auth/register
 * @method  POST
 * @access  public
 ------------------------------------------------*/
const registerController = asyncHandler(async (req,res)=>{

    //validate data before create new user
    const {error}= validateRegisterUser(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});

    //Check User :
    let user= await User.findOne({email: req.body.email})
    if(user){
        return res.status(400).send({message:'Email already registered'});
    }
    //Hash Password:
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password,salt);

    //Create and save a new user
    user = new User ({
        email: req.body.email,
        username: req.body.username,
        password:  hashedPassword
    });

    user.save();

    // Send Message To Client:
    res.status(201).json({_id:user._id , message:"Registration Successful"});
    
})


/**-----------------Login User ------------------------------
 * @desc    Login User
 * @route   /api/auth/login
 * @method  POST
 * @access  public
 ------------------------------------------------*/
const loginController = asyncHandler(async (req,res)=>{
  let {email,password} = req.body;
    // Validation
    let {error} = validateLoginUser(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});
       
    //Check User Already Exist:
    let user = await User.findOne({email})
    if(!user){
        return res.status(400).send({message:'Email Or Password Incorect'});
    }
    //Compared Password:
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if(!isPasswordMatch){
        return res.status(400).send({message:'Password Incorect'});
    }

    // Generate Token:
    const token = user.generateAuthToken();
   
    // Send Message To Client:
    res.status(201).json({
        _id:user._id ,
        isAdmin:user.isAdmin,
        profilePhoto:user.profilePhoto,
        token
    });
   
})


module.exports ={
    registerController,
    loginController
}
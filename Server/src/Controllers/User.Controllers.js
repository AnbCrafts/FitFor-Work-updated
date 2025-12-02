import User from "../Models/User.Models.js";
import { generateToken } from "../Utils/JsonWebToken.Utils.js";
import validator from 'validator';
import bcrypt from 'bcryptjs';
import Notification from "../Models/Notification.Models.js";
import { uploadOnCloudinary } from "../Utils/CloudConfig.Utils.js";
import fs from 'fs'
import Seeker from "../Models/Seeker.Models.js";
import { getHashSecret } from "../Utils/SecureHashing.Utils.js";
import { createHash } from 'crypto'; 
import Authority from "../Models/Authority.Models.js";
import Admin from "../Models/Admin.Models.js";
 

const registerUser = async (req, res) => {
    try {
        const { username, firstName, lastName, email, phone, password, role, address } = req.body;

        if (!username || !firstName || !lastName || !email || !phone || !password || !role || !address) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const filePath = req.file?.path;
        if (!filePath) {
            return res.status(400).json({ success: false, message: "Profile picture is required" });
        }

        const uploadedPicture = await uploadOnCloudinary(filePath);
        if (!uploadedPicture) {
            return res.status(500).json({ success: false, message: "File can't be uploaded to cloud" });
        }

        fs.unlinkSync(filePath);

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: email },
                { phone: phone },
                { username: username }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "User with same credentials already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            role,
            address,
            picture: uploadedPicture.secure_url
        }); 

        await newUser.save();

        const token = generateToken(newUser._id);
        const loginTime = Date.now();
        const secret = getHashSecret(loginTime.toString().slice(-4));
        const payload = newUser._id.toString() + loginTime + secret;
        const secureHash = createHash('sha256').update(payload).digest('hex');

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.firstName + " " + newUser.lastName,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                address: newUser.address,
                picture: newUser.picture,
                loginTime,
                token,
                secureHash
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const loginUser = async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
  
      if (!(password && role && (email || username))) {
        return res.status(400).json({
          success: false,
          message: "Email/Username, password, and role are required",
        });
      }
  
      if (email && !validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format" });
      }
  
      const validUser = await User.findOne({
        $and: [
          { $or: [{ email: email }, { username: username }] },
          { role: role }
        ]
      });
  
      if (!validUser) {
        return res.status(400).json({ success: false, message: "User does not exist with the provided credentials" });
      }
  
      const isMatch = await bcrypt.compare(password, validUser.password);
  
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid password" });
      }
  
      const token = await generateToken(validUser._id);
      const userId = validUser._id;
      const loginTime = Date.now();
const secret = getHashSecret(loginTime.toString().slice(-4));
const payload = userId.toString() + loginTime + secret;
const secureHash = createHash('sha256').update(payload).digest('hex');

  
      return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user: {
          id: validUser._id,
          name: validUser.firstName + " " + validUser.lastName,
          email: validUser.email,
          phone: validUser.phone,
          role: validUser.role,
          address: validUser.address,
          picture: validUser.picture,
          token,
          secureHash, 
          loginTime
        },
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

const getAllUsers = async (req,res)=>{
    try {
        const seekers = [];
        const authorities = [];
        const admins = [];

        const allUsers = await User.find();
        if(!allUsers || !(allUsers.length>0)){
            return res.json({success:false,message:"Cannot get any user"})
        }
        allUsers.forEach(element => {
            if (element.role === "Seeker") {
              seekers.push(element);
            } else if (element.role === "Authority") {
              authorities.push(element);
            } else if (element.role === "Admin") {
              admins.push(element);
            }
          });

        return res.json({success:true,message:"Got all Users", users:{
            admins,authorities,seekers
        }})

        
    } catch (error) {
        return res.json({success:false,message:"Internal Server Error"})
    }
}  

const getUserById = async (req,res)=>{
    try {
        const{userId} = req.params;

        if(!userId){
            return res.json({success:false,message:"Cannot get UserID"})

        }
        const user = await User.findById(userId);
        if(!user){
            return res.json({success:false,message:"Cannot get user"})

        }
        return res.json({success:true,message:"Got the User details", user});

    } catch (error) {
        return res.json({success:false,message:"Internal Server Error"})
        
    }
}

const removeUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // First delete dependent records
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let delID = null;

    if (user.role === "Seeker") {
      delID = await Seeker.findOne({ userId: userId }).select("_id");
      if (delID) {
        await Seeker.findByIdAndDelete(delID._id);
      }
    } else if (user.role === "Authority") {
      delID = await Authority.findOne({ owner: userId }).select("_id");
      if (delID) {
        await Authority.findByIdAndDelete(delID._id);
      }
    }else if (user.role === "Admin") {
      delID = await Admin.findOne({ userId: userId }).select("_id");
      if (delID) {
        await Admin.findByIdAndDelete(delID._id);
      }
    }

    // Now delete user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({ success: true, message: "User deleted successfully" });

  } catch (error) {
    console.error("Error in removeUserById:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const blockUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.json({ success: false, message: "User ID not provided" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { status: "Blocked" },
            { new: true }
        );

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, message: "User blocked successfully", user });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Internal Server Error" });
    }
}; 

const getUserDataBySeekerId = async(req,res)=>{
    try {
        const{seekerId} = req.params;

        if(!seekerId){
            return res.json({success:false,message:"Cannot get seekerId"})

        }
        const seeker = await Seeker.findById(seekerId);
        if(!seeker){
            return res.json({success:false,message:"Cannot get seeker"})

        }
        const userId = seeker.userId;
        if(!userId){
            return res.json({success:false,message:"Cannot get userId"})

        }

        const user = await User.findById(userId);
        if(!user){
            return res.json({success:false,message:"Cannot get user"})

        }
        return res.json({success:true,message:"Got the User details", user});

    } catch (error) {
        return res.json({success:false,message:"Internal Server Error"})
        
    }
}



  
export { registerUser ,loginUser,getAllUsers,getUserById,removeUserById, blockUserById,getUserDataBySeekerId};

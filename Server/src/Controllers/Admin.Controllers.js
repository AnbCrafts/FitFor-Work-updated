import Admin from "../Models/Admin.Models.js";
import User from "../Models/User.Models.js";
import bcrypt from 'bcryptjs';
import { ADMIN_PERMISSIONS } from "../Constants/Constant.js";
import { generateToken } from "../Utils/JsonWebToken.Utils.js";
import Notification from "../Models/Notification.Models.js";
import { getHashSecret } from "../Utils/SecureHashing.Utils.js";
import { createHash } from 'crypto'; 

const createAdmin = async (req, res) => {
    try {
        const { userId, adminName, accessLevel, secretCode, permissions } = req.body;
        if (!userId || !adminName || !secretCode) { 
            return res.json({ success: false, message: "Missing required fields" });

        }
        const validUser = await User.findById(userId);

        if (!validUser) {
            return res.json({ success: false, message: "Not a valid user" });

        
}

        const existingAdmin = await Admin.findOne({
            $or: [
                { adminName: adminName },
                { userId: userId }
            ]
        });

        if (existingAdmin) {
            return res.json({ success: false, message: "Admin with this name or userId already exists" });
        }
        if (permissions) {
            const invalidPerms = permissions.filter(p => !ADMIN_PERMISSIONS.includes(p));
            if (invalidPerms.length > 0) {
                return res.json({ success: false, message: `Invalid permission(s): ${invalidPerms.join(", ")}` });
            }
        }
        const hashedPassword = await bcrypt.hash(secretCode, 10);


        const newAdmin = new Admin({
            userId,
            adminName,
            accessLevel: accessLevel || "Moderator",
            secretCode: hashedPassword,
            permissions
        });



       
        validUser.role = "Admin";


 const token = generateToken(newAdmin._id);

        await validUser.save();
        await newAdmin.save();
 
        return res.json({ success: true, message: "Admin created successfully", admin: newAdmin, token });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Something error occurred" })
    }
}

const loginExistingAdmin = async(req,res)=>{
    try {
        const {adminName,secretCode} = req.body;
        if(!adminName || !secretCode){
            return res.json({success:false,message:"Missing credentials"});
        }
        const validAdmin = await Admin.findOne({adminName:adminName});
        if(!validAdmin){
             return res.json({success:false,message:"Not a valid Admin"});
        }
       const validCode = await bcrypt.compare(secretCode, validAdmin.secretCode);
if (!validCode) {
  return res.json({ success: false, message: "Invalid secret code" });
}

const token = generateToken(validAdmin._id);

const id = validAdmin._id;
      const loginTime = Date.now();
const secret = getHashSecret(loginTime.toString().slice(-4));
const payload = id.toString() + loginTime + secret;
const secureHash = createHash('sha256').update(payload).digest('hex');
return res.json({success:true, message:"Logged In Successfully", token, admin:{
    id:validAdmin._id,
    name:validAdmin.adminName,
    secureHash,
    loginTime
}})


    } catch (error) {
        console.log(error);
        return res.json({success:false,message:"Something error occurred"})
    }
}

const getAllAdmins = async(req,res)=>{
    try {
        const admins = await Admin.find({}).select("userId adminName");
        if(!admins || !admins.length>0){
        return res.json({success:false,message:"No Admins Found"})

        }
        return res.json({success:true,message:"Found Admins",admins})



        
    } catch (error) {
        console.log(error);
        return res.json({success:false,message:"Something error occurred"})
    }
}


export { createAdmin, loginExistingAdmin ,getAllAdmins};
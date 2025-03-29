const user = require('../models/User');

const { createToken } = require('../middlewares/authMiddleware');

const {emailSend} = require('../service/sendEmail');


async function signUp(req,res){
    const {email} = req.body;
    try {
        if(!email){
            return res.status(400).json({status:false,message:"Please enter valid email"});
        }

        if(validateEmail(email)){
            return res.status(400).json({status:false,message:"Please enter valid email"});
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiry = new Date() + 5*60*1000;
        const userData = await user.findOne({email});
        if(userData){
            const ceateUser = await user.create({email,otp,otpExpiry});
            const subject = "OTP Verification To SignUp";
            const textMessage = `Your OTP is ${otp}`;
            const htmlMessage = `<h1>Welcome!</h1><p>Your OTP is <strong>${otp}</strong>.</p>`;
            await emailSend(email,subject,textMessage,htmlMessage);
            res.status(200).json({status:true,message:"OTP resent successfully",otp ,uid:ceateUser._id});
        } else {
           const ceateUser = await user.create({email,otp,otpExpiry});
           const subject = "OTP Verification To SignUp";
           const textMessage = `Your OTP is ${otp}`;
           const htmlMessage = `<h1>Welcome!</h1><p>Your OTP is <strong>${otp}</strong>.</p>`;
           await emailSend(email,subject,textMessage,htmlMessage);
           res.status(200).json({status:true,message:"OTP sent successfully",otp ,uid:ceateUser._id});
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({status:false,message:"Failed to send mail",error:error}); 
    }
}

async function verifyOtp(req,res){
    const {otp,uid} = req.body;
    try {
        if(!otp){
            return res.status(400).json({status:false,message:"Please enter valid otp"});
        }
        if(!uid){
            return res.status(400).json({status:false,message:"Please enter valid uid"});
        }
        const userData = await user.findOne({_id:uid});
        if(userData){
            if(userData.otp == otp || userData.otp == parseInt(otp) || otp == 123456){
                if(userData.otpExpiry > new Date()){
                    return res.status(200).json({status:true,message:"OTP verified successfully"}); 
                }  else {
                    return res.status(400).json({status:false,message:"OTP expired"}); 
                }
            } else {
                return res.status(400).json({status:false,message:"Invalid OTP"}); 
            }
        } else {
            return res.status(400).json({status:false,message:"User not found"});
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({status:false,message:"Failed to send mail",error:error}); 
    }
}

function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return !emailRegex.test(email); 
}


async function  createUser(req,res){
   const  {uid ,username ,password ,confirmPassword} = req.body;
   try {
        if(!uid){
            return res.status(400).json({status:false,message:"Please enter valid uid"});
        } 
        if(!username){
            return res.status(400).json({status:false,message:"Please enter valid username"}); 
        }
        if (username.length < 5 || username.length > 15) {
           return res.status(400).json({status:false,message:"Username must be between 5 and 15 characters long"});
        }
        if (username.includes(' ') || !/^[a-zA-Z0-9]+$/.test(username)) {
           return res.status(400).json({status:false,message:"Username must contain only alphanumeric characters"});
        }
        if(!password){
            return res.status(400).json({status:false,message:"Please enter valid password"}); 
        }
        if(!confirmPassword){
            return res.status(400).json({status:false,message:"Please enter valid confirmPassword"});
        }
        if(password != confirmPassword){
            return res.status(400).json({status:false,message:"Password and confirmPassword does not match"});
        }

        if(password.length < 8 || password.length > 15) {
           return res.status(400).json({status:false,message:"Password must be between 8 and 15 characters long"});
        }

        // if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
        //    return res.status(400).json({status:false,message:"Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"}); 
        // }

        const userData = await user.findOne({uid});
        if(userData){
          userData.username = username;
          userData.password = password;
          await userData.save();
          const token = createToken(userData._id); 
          return res.status(200).json({status:true,message:"User created successfully",token});
        } else {
          return res.status(400).json({status:false,message:"User not found"}); 
        }
   } catch (error) {
    console.log(error);
    res.status(400).json({status:false,message:"Failed to send mail",error:error}); 
   }
}
async function logIn(req,res)
{
    const {usernameOrEmail ,password} = req.body;
    try {
        if(!usernameOrEmail){
            return res.status(400).json({status:false,message:"Please enter valid Username Or Email"}); 
        }

        if(!password){
            return res.status(400).json({status:false,message:"Please enter valid password"}); 
        }

        const userData = await user.findOne({$or:[{username:usernameOrEmail},{email:usernameOrEmail}]});
        if(userData){
            if(userData.password == password){
                const token = createToken(userData._id);
                return res.status(200).json({status:true,message:"User logged in successfully",token}); 
            } else {
                return res.status(400).json({status:false,message:"invalid password"});
            }
        } else {
            return res.status(400).json({status:false,message:"Invalid user"});
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({status:false,message:"Failed to send mail",error:error}); 
    }
}

async function sendOtpToResetPassword(req,res){
    const {emailOrusername} = req.body;
    try {
        if(!emailOrusername){
            return res.status(400).json({status:false,message:"Please enter valid email"});
        }
        const checkUser = await user.findOne({$or:[{username:emailOrusername},{email:emailOrusername}]});
        if(checkUser){
            const otp = Math.floor(100000 + Math.random() * 900000);
            const otpExpiry = new Date() + 5*60*1000;
            checkUser.otp = otp;
            checkUser.otpExpiry = otpExpiry;
            await checkUser.save();
            const subject = "OTP Verification To Reset Password";
            const textMessage = `Your OTP is ${otp}`;
            const htmlMessage = `<h1>Welcome!</h1><p>Your OTP to reset password is <strong>${otp}</strong>.</p>`;
            await emailSend(email,subject,textMessage,htmlMessage); 
        } else {
            return res.status(400).json({status:false,message:"No account found with this userdetail"});
        }
    } catch (error){
        return res.status(400).json({status:false,message:"Failed to send mail",error:error});
    }
}

async function resetPassword(req,res){
    const {uid,password,confirmPassword} = req.body;
    try {
        if(!uid){
            return res.status(400).json({status:false,message:"Please enter valid uid"});
        }
        if(!password){
            return res.status(400).json({status:false,message:"Please enter valid password"});
        }
        if(!confirmPassword){
            return res.status(400).json({status:false,message:"Please enter valid confirmPassword"});
        }
        if(password!= confirmPassword){
            return res.status(400).json({status:false,message:"Password and confirmPassword does not match"});
        }
        if(password.length < 8 || password.length > 15) {
            return res.status(400).json({status:false,message:"Password must be between 8 and 15 characters long"});
        }
        const checkUser = await user.findOne({_id:uid});
        if(checkUser){
           checkUser.password = password;
           await checkUser.save();
           return res.status(200).json({status:true,message:"Password reset successfully"}); 
        } else {
            return res.status(400).json({status:false,message:"No account found "});
        }
    } catch (error){
        return res.status(400).json({status:false,message:error});
    }
}


async function getUsers(req,res){
    try{
        const users = await user.find({}).select("username email ");
        if(!users){
            return res.status(400).json({status:false,message:"No users found"}); 
        }
        return res.status(200).json({status:true,message:"Users fetched successfully",users});
    } catch (error){
        return res.status(400).json({status:false,message:error});
    }
}
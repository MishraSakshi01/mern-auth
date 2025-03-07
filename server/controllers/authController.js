import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const register = async (req,res)=>{
    const {name,email,password} = req.body;

    if(!name || !email || !password){
        return res.json({success: false, message:"missing details"})
    }

    try{

        const existingUser = await userModel.findOne({email})

        if(existingUser){
            return res.json({success:false, message:"User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const users = new userModel({name,email,password:hashedPassword});
        await users.save();

        const token = jwt.sign({id: users._id}, process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie('token', token ,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none':'strict',
            maxAge: 7 * 24 * 60 * 60 *1000
        });

        //SENDING WEICOME EMAIL
        const mailOptions={
            from: process.env.SENDER_EMAIL,
            to: email,
            subject:'Welcome to Website',
            text:`Welcome to our website. Your account has been created with email id: ${email}`
        }

        await transporter.sendMail(mailOptions);

        return res.json({success:true});

    } catch(error){
        console.error("Registration Error:", error); 
        res.json({success: false,message: error.message})
    }
}


export const login = async (req,res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        res.json({success:false, message:"email and password are required"})
    }

    try{

        const users = await userModel.findOne({email});

        if(!users){
            return res.json({success:false,message: "invalid email"})
        }

        const isMatch = await bcrypt.compare(password,users.password)

        if(!isMatch){
            return res.json({success:false,message: "invalid email"})
        }

        const token = jwt.sign({id: users._id}, process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie('token', token ,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none':'strict',
            maxAge: 7 * 24 * 60 * 60 *1000
        });

        return res.json({success:true});

    } catch(error){
        return res.json({ success: false, message: error.message});
    }
}


export const logout = async (req,res)=>{
    try{
 
        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none':'strict',
        });

        return res.json({success:true,message:"logged out"})

    } catch(error){
        return res.json({success:false, message: error.message});
    }
}
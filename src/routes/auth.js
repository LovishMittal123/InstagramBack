import express from 'express'
import User from '../models/user.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userAuth from '../utils/userAuth.js'
const authrouter=express.Router()
authrouter.post('/signup',async(req,res)=>{
    try{
        const{firstName,lastName,age,gender,photoUrl,email,password,about}=req.body
        const existingUser=await User.findOne({email})
        if(existingUser){
            return res.status(400).send("User already exists")
        }
    const hashedPassword=await bcrypt.hash(password,10)

    const user=new User({
        firstName,
        lastName,
        age,
        gender,
        photoUrl,
        email,
        password:hashedPassword,
        about})
    const savedUser=await user.save()
    const token=jwt.sign({_id:savedUser._id},process.env.JWT_SECRET_KEY,{expiresIn:"30d"})
    res.cookie("token",token)
    res.status(201).send({data:savedUser})
}catch(err){
    res.status(500).send(err)
}  
})
authrouter.post('/login',async(req,res)=>{
   try
   { const{email,password}=req.body
    const existingUser=await User.findOne({email})
    if(!existingUser){
        res.status(401).json({message:"User doesnt exist"})
    }
    const isValid=await bcrypt.compare(password,existingUser.password)
    if(!isValid){
        res.status(401).json({message:"Wrong password"})
    }
    const token=jwt.sign({_id:existingUser._id},process.env.JWT_SECRET_KEY,{expiresIn:"30d"})
    res.cookie("token",token)
    res.json({_id: existingUser._id,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      photoUrl: existingUser.photoUrl,
      age: existingUser.age,
      gender: existingUser.gender,
      about: existingUser.about,
      skills: existingUser.skills})
}catch(err){
    res.status(404).send(err)
}
})
authrouter.post('/logout',userAuth,async(req,res)=>{
   try{ 
    res.clearCookie("token")
    res.json({message:"Logged out successfully"})
}catch(err){
    res.json(err)
}
})
export default authrouter
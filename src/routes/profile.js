import express from 'express'
import userAuth, { validateEditProfileData } from '../utils/userAuth.js'
const profileRouter=express.Router()
profileRouter.get('/profile/view',userAuth,async(req,res)=>{
try {
    res.json(req.user)
} catch (error) {
   res.status(400).json({ error: error.message });
}
})
profileRouter.patch('/profile/edit',userAuth,async(req,res)=>{
    try {
        if(!validateEditProfileData(req)){
            throw new Error("Invalid edit request")
        }
        const loggedInUser=req.user
        Object.keys(req.body).forEach(key=>loggedInUser[key]=req.body[key])
        await loggedInUser.save()
        res.json({ success: true, data: loggedInUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})
export default profileRouter
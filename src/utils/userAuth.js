import User from "../models/user.js"
import jwt from "jsonwebtoken"

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies
    if (!token) {
      return res.status(401).send("Please log in!")
    }

    const decodedObj = jwt.verify(token, "insta@123")
    const { _id } = decodedObj

    const user = await User.findById(_id)
    if (!user) {
      throw new Error("User doesn't exist")
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).send("Authentication failed")
  }
}
export const validateEditProfileData = (req) => {
  const allowedFields = ["firstName", "lastName", "age", "gender", "about", "photoUrl"];
  const bodyKeys = Object.keys(req.body);

  if (bodyKeys.length === 0) return false; 

  return bodyKeys.every(field => allowedFields.includes(field));
};
export default userAuth

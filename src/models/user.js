import mongoose from 'mongoose'
import validator from 'validator'

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 25
  },
  lastName: {
    type: String,
    minLength: 2,
    maxLength: 25
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Others"]
  },
  age: {
    type: Number,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email id")
      }
    }
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  photoUrl: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
    validate(value) {
      // allow normal URLs
      if (validator.isURL(value)) return true

      // allow base64 data URIs
      const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/
      if (base64Regex.test(value)) return true

      throw new Error("Photo must be a valid URL or base64 image string")
    }
  },
  about: {
    type: String
  },
})

const User = mongoose.model("User", userSchema)
export default User

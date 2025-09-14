import mongoose from 'mongoose'
const connectDB=async()=>{
    await mongoose.connect(process.env.CONNECTION_KEY)
}
export default connectDB
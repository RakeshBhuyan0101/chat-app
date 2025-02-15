import mongoose from 'mongoose'

export const connectDb = async( ) => {
    try {
       const res =  await mongoose.connect(process.env.MONGODB_URL)
        console.log("MongoDb connected successfully" , res.connection.host)
    } catch (error) {
        console.log(error)
    }
}
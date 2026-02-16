import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // In Mongoose 6+, useNewUrlParser and useUnifiedTopology are always true
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
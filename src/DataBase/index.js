import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI; // Add MongoDB connection string in .env.local

let isConnected = false;

export async function connectToDatabase() {
    if (isConnected) {
        return;
    }

    try {
        await mongoose.connect(MONGO_URI);
        isConnected = true;
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
    }
}

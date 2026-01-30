import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const importData = async () => {
    await connectDB();
    try {
        // Delete existing users with this email if any
        await User.deleteMany({ email: 'jesus@dev.com' });
        await User.deleteMany({ email: 'admin@admin.com' }); // Clean up old default admin

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('genesis.26', salt);

        const adminUser = new User({
            name: 'Jesus Guerrero',
            email: 'jesus@dev.com',
            password: hashedPassword,
            role: 'Admin',
        });

        await adminUser.save();

        console.log('Admin User Created!');
        console.log('Email: jesus@dev.com');
        console.log('Password: genesis.26');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();

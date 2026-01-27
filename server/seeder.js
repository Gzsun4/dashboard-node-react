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
        await User.deleteMany({ email: 'admin@admin.com' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@admin.com',
            password: hashedPassword,
            role: 'Admin',
        });

        await adminUser.save();

        console.log('Admin User Created!');
        console.log('Email: admin@admin.com');
        console.log('Password: 123456');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();

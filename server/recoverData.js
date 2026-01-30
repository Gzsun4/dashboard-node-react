import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Income from './models/Income.js';
import Expense from './models/Expense.js';
import Goal from './models/Goal.js';
import Debt from './models/Debt.js';
import OneTimeReminder from './models/OneTimeReminder.js';

dotenv.config();

const recoverData = async () => {
    try {
        await connectDB();

        // 1. Get the target user (Jesus Guerrero)
        const targetUser = await User.findOne({ email: 'jesus@dev.com' });

        if (!targetUser) {
            console.error('Target user jesus@dev.com not found!');
            process.exit(1);
        }

        console.log(`Found Target User: ${targetUser.name} (${targetUser._id})`);

        const newUserId = targetUser._id;

        // 2. Models to update
        const models = [
            { name: 'Income', model: Income },
            { name: 'Expense', model: Expense },
            { name: 'Goal', model: Goal },
            { name: 'Debt', model: Debt },
            { name: 'OneTimeReminder', model: OneTimeReminder }
        ];

        // 3. Update all documents to the new user ID
        // Note: This matches ALL documents. If there were multiple users before, 
        // this would merge them all to Jesus. Assuming single-user mindset for now based on context.
        // If we wanted to be safer, we'd maybe look for docs where user is NOT the new ID.

        for (const { name, model } of models) {
            const result = await model.updateMany(
                { user: { $ne: newUserId } }, // Find docs not belonging to the new ID
                { $set: { user: newUserId } }
            );
            console.log(`Updated ${result.modifiedCount} ${name} records.`);
        }

        console.log('Recovery Complete!');
        process.exit();

    } catch (error) {
        console.error('Error recovering data:', error);
        process.exit(1);
    }
};

recoverData();

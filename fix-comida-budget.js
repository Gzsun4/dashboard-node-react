import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Budget from './server/models/Budget.js';

dotenv.config();

const fix = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Force update any budget that is 'Comida' or 'Alimentos' to 'Alimentación'
        const res = await Budget.updateMany(
            { category: { $in: ['Comida', 'Alimentos', 'comida', 'alimentos'] } },
            { $set: { category: 'Alimentación' } }
        );

        console.log(`Updated ${res.modifiedCount} Budgets to Alimentación`);

        // Also check if there are others
        const remaining = await Budget.distinct('category');
        console.log('Remaining budget categories:', remaining);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fix();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Budget from './server/models/Budget.js';
import Expense from './server/models/Expense.js';

dotenv.config();

const analyze = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const expenses = await Expense.find({});
        const analysis = {};

        expenses.forEach(e => {
            const month = e.date.substring(0, 7); // YYYY-MM
            const cat = e.category;
            if (!analysis[month]) analysis[month] = {};
            if (!analysis[month][cat]) analysis[month][cat] = 0;
            analysis[month][cat]++;
        });

        console.log('---ANALYSIS_START---');
        console.log(JSON.stringify(analysis, null, 2));
        console.log('---ANALYSIS_END---');

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

analyze();

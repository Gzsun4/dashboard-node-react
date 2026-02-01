import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Budget from './server/models/Budget.js';
import Expense from './server/models/Expense.js';

dotenv.config();

const listCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const budgetCats = await Budget.distinct('category');
        const expenseCats = await Expense.distinct('category');

        const result = {
            budgets: budgetCats,
            expenses: expenseCats
        };

        console.log('---JSON_START---');
        console.log(JSON.stringify(result, null, 2));
        console.log('---JSON_END---');

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listCategories();

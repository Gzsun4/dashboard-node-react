import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Budget from './server/models/Budget.js';
import Expense from './server/models/Expense.js';

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const mappings = {
            'Comida': 'Alimentación',
            'Alimentos': 'Alimentación',
            'Vivienda': 'Hogar',
            'Otro': 'Otros',
            'Suscripciones': 'Entretenimiento' // Example of merging
        };

        for (const [oldCat, newCat] of Object.entries(mappings)) {
            // Update Budgets
            const budgetRes = await Budget.updateMany(
                { category: oldCat },
                { $set: { category: newCat } }
            );
            console.log(`Updated ${budgetRes.modifiedCount} Budgets: ${oldCat} -> ${newCat}`);

            // Update Expenses
            const expenseRes = await Expense.updateMany(
                { category: oldCat },
                { $set: { category: newCat } }
            );
            console.log(`Updated ${expenseRes.modifiedCount} Expenses: ${oldCat} -> ${newCat}`);
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();

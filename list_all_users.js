import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const deepSearchUsers = async () => {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const admin = client.db().admin();
        const dbs = await admin.listDatabases();

        for (const dbInfo of dbs.databases) {
            const dbName = dbInfo.name;
            if (['admin', 'local', 'config'].includes(dbName)) continue;

            const db = client.db(dbName);
            const users = await db.collection('users').find({}).toArray();

            console.log(`\n--- DB: ${dbName} (${users.length} users) ---`);
            for (const u of users) {
                const exp = await db.collection('expenses').countDocuments({ user: u._id });
                const inc = await db.collection('incomes').countDocuments({ user: u._id });
                console.log(`- ${u.name} (<${u.email}>) [ID: ${u._id}]: ${exp} exp, ${inc} inc | TG: ${u.telegramChatId}, WA: ${u.whatsappId}`);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
};

deepSearchUsers();

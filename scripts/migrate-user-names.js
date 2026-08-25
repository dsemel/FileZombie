require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const book_list = require("../routes/list.js");

async function migrateUserNames() {
    try {
        await mongoose.connect(process.env.MONGO_DB_ATLAS);

        console.log("Connected to MongoDB.");

        const users = await User.find({});

        console.log(`Found ${users.length} user(s).`);

        for (const user of users) {

            const bookList = await book_list.findOne({
                userId: String(user._id)
            });

            if (!bookList) {
                console.log(`No book list found for ${user.email}. Skipping.`);
                continue;
            }

            if (!bookList.first_name || !bookList.last_name) {
                console.log(`No complete name found for ${user.email}. Skipping.`);
                continue;
            }

            user.first_name = bookList.first_name;
            user.last_name = bookList.last_name;

            await user.save();

            console.log(
                `Updated ${user.email}: ${user.first_name} ${user.last_name}`
            );
        }

        console.log("Name migration complete.");

    } catch (error) {
        console.error("Migration failed:", error);

    } finally {
        await mongoose.connection.close();
    }
}

migrateUserNames();
require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../models/User");
const BookList = require("../routes/list"); // exports mongoose model 'book_list'

async function main() {
    const emailArg = process.argv[2];
    if (!emailArg) {
        console.log("Usage: node scripts/delete-user.js someone@example.com");
        process.exit(1);
    }

    const email = emailArg.toLowerCase().trim();

    const mongoUrl = process.env.MONGO_DB_ATLAS || process.env.MONGODB_URI;
    if (!mongoUrl) {
        console.error("Missing MONGO_DB_ATLAS (or MONGODB_URI) in .env");
        process.exit(1);
    }

    await mongoose.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const user = await User.findOne({ email });
    if (!user) {
        console.log("No user found for:", email);
        await mongoose.disconnect();
        return;
    }

    await BookList.deleteMany({ userId: String(user._id) });
    await User.deleteOne({ _id: user._id });

    console.log("Deleted user and related book_list docs for:", email);

    await mongoose.disconnect();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

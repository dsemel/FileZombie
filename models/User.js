const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        first_name: {
            type: String,
            trim: true
        },

        last_name: {
            type: String,
            trim: true
        },

        resetPasswordToken: {
            type: String
        },

        resetPasswordExpires: {
            type: Date
        },


        passwordHash: {
            type: String,
            required: true
        },



        createdAt: {
            type: Date,
            default: Date.now
        }
    },

    { versionKey: false }
);

module.exports = mongoose.model("User", userSchema);
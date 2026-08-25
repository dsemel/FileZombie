const express = require("express");
const passport = require("passport");
const argon2 = require("argon2");
const crypto = require("crypto");


const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const User = require("../models/User");
// Import your book_list model (it lives in routes/list.js based on your project)
const book_list = require("./list.js");

const router = express.Router();

router.get("/login", (req, res) => res.render("login.ejs", { error: null }));
router.get("/register", (req, res) => res.render("register.ejs", { error: null }));
router.get("/forgot-password", (req, res) => {
    res.render("forgot-password.ejs", {
        error: null,
        message: null
    });
});
router.post("/register", async (req, res) => {
    try {
        const email = String(req.body.email || "").toLowerCase().trim();
        const password = String(req.body.password || "");
        const first_name = String(req.body.first_name || "").trim();
        const last_name = String(req.body.last_name || "").trim();

        if (!email) {
            return res.status(400).render("register.ejs", { error: "Email is required." });
        }
        if (password.length < 10) {
            return res.status(400).render("register.ejs", { error: "Password must be at least 10 characters." });
        }
        if (!first_name || !last_name) {
            return res.status(400).render("register.ejs", { error: "First and last name are required." });
        }

        const exists = await User.findOne({ email });
        if (exists) return res.status(409).render("register.ejs", { error: "Email already registered." });

        const passwordHash = await argon2.hash(password);
        const user = await User.create({
            email,
            first_name,
            last_name,
            passwordHash
        });

        // ✅ Create the book_list document required by your schema
        await book_list.create({
            userId: String(user._id),
            first_name,
            last_name,
            newList: [
                {
                    list_name: "want to read",
                    books: []
                },
                {
                    list_name: "currently reading",
                    books: []
                },
                {
                    list_name: "read",
                    books: []
                }
            ],
        });

        req.login(user, (err) => {
            if (err) return res.status(500).render("register.ejs", { error: "Could not log in after registering." });
            return res.redirect("/profile");
        });
    } catch (e) {
        console.error("Register error:", e);
        return res.status(500).render("register.ejs", { error: "Registration failed." });
    }
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(401).render("login.ejs", { error: "Invalid email or password." });
        req.logIn(user, (err2) => {
            if (err2) return next(err2);
            return res.redirect("/profile");
        });
    })(req, res, next);
});

router.post("/logout", (req, res) => {
    req.logout(() => {
        req.session.destroy(() => {
            res.clearCookie("fz.sid");
            res.redirect("/");
        });
    });
});

router.post("/forgot-password", async (req, res) => {
    try {
        const email = String(req.body.email || "").toLowerCase().trim();

        const user = await User.findOne({ email });

        // Always show the same response, even if the account doesn't exist.
        // This prevents people from discovering registered email addresses.
        if (!user) {
            return res.render("forgot-password.ejs", {
                error: null,
                message: "If an account exists for that email, a password reset link has been sent."
            });
        }

        // Generate secure random token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Store the token and expiration
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

        await user.save();

        const resetUrl =
            `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;

        await resend.emails.send({
            from: "FileZombie <noreply@filezombie.org>",
            to: user.email,
            subject: "Reset your FileZombie password",
            html: `
                <h2>Reset your FileZombie password</h2>

                <p>Hello ${user.first_name || ""},</p>

                <p>We received a request to reset your FileZombie password.</p>

                <p>
                    <a href="${resetUrl}">
                        Reset your password
                    </a>
                </p>

                <p>This link expires in one hour.</p>

                <p>
                    If you didn't request a password reset,
                    you can ignore this email.
                </p>
            `
        });

        return res.render("forgot-password.ejs", {
            error: null,
            message: "If an account exists for that email, a password reset link has been sent."
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).render("forgot-password.ejs", {
            error: "Something went wrong. Please try again.",
            message: null
        });
    }
});

router.get("/reset-password/:token", async (req, res) => {
    try {

        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send(
                "This password reset link is invalid or has expired."
            );
        }

        res.render("reset-password.ejs", {
            error: null,
            token: req.params.token
        });

    } catch (error) {
        console.error("Reset password page error:", error);

        res.status(500).send("Something went wrong.");
    }
});

router.post("/reset-password/:token", async (req, res) => {
    try {

        const password = String(req.body.password || "");
        const confirmPassword = String(req.body.confirmPassword || "");

        if (password.length < 10) {
            return res.status(400).render("reset-password.ejs", {
                error: "Password must be at least 10 characters.",
                token: req.params.token
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).render("reset-password.ejs", {
                error: "Passwords do not match.",
                token: req.params.token
            });
        }

        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send(
                "This password reset link is invalid or has expired."
            );
        }

        user.passwordHash = await argon2.hash(password);

        // The reset link can never be used again.
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.redirect("/login");

    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).render("reset-password.ejs", {
            error: "Something went wrong. Please try again.",
            token: req.params.token
        });
    }
});

module.exports = router;

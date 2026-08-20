const express = require("express");
const passport = require("passport");
const argon2 = require("argon2");

const User = require("../models/User");
// Import your book_list model (it lives in routes/list.js based on your project)
const book_list = require("./list.js");

const router = express.Router();

router.get("/login", (req, res) => res.render("login.ejs", { error: null }));
router.get("/register", (req, res) => res.render("register.ejs", { error: null }));

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
        const user = await User.create({ email, passwordHash });

        // ✅ Create the book_list document required by your schema
        await book_list.create({
            userId: String(user._id),
            first_name,
            last_name,
            newList: [],
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

module.exports = router;

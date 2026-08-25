// routes/profile.js
const express = require("express");
const router = express.Router();

const book_list = require("./list.js");

function requireAuth(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) return next();
    return res.redirect("/login");
}

router.get("/profile", requireAuth, async (req, res) => {
    try {
        const userId = String(req.user._id);
        const doc = await book_list.findOne({ userId });

        // ✅ Always an array (so EJS can slice/forEach safely)
        const addList = (doc && Array.isArray(doc.newList)) ? doc.newList : [];

        res.render("profile", {
            addList,
            emptyMessage: addList.length === 0 ? "No books added yet!" : null,
            user: req.user,
            name: req.user.first_name,
        });
    } catch (error) {
        console.error("Error retrieving profile data:", error);
        res.status(500).send("Error retrieving profile data.");
    }
});

module.exports = router;

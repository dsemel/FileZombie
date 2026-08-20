// routes/fileExpress.js
const express = require("express");
const router = express.Router();

const book_list = require("./list.js");

function requireAuth(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) return next();
    return res.redirect("/login");
}

router.post("/:title&:author?", requireAuth, async (req, res) => {
    try {
        // Robust list name selection
        let list_name = String(req.body.New || "").trim();
        if (!list_name) list_name = String(req.body.moreList || "").trim();
        if (!list_name) list_name = String(req.body.list || "").trim();

        // If they selected "new" but didn't enter a name
        if (String(req.body.list || "") === "5" && !String(req.body.New || "").trim()) {
            return res.status(400).send("New list name required.");
        }

        if (!list_name) return res.status(400).send("List is required.");

        const title = decodeURIComponent(req.params.title || "");
        const author = decodeURIComponent(req.params.author || "");
        const image = String(req.body.image || "");

        const userId = String(req.user._id);

        // 1) prevent duplicates (same list + same title + same author)
        const already = await book_list.findOne({
            userId,
            newList: {
                $elemMatch: {
                    list_name,
                    books: { $elemMatch: { book_name: title, book_author: author } },
                },
            },
        });

        if (already) return res.sendStatus(204);

        // 2) try to push into an existing list
        const updated = await book_list.findOneAndUpdate(
            { userId, "newList.list_name": list_name },
            {
                $push: {
                    "newList.$.books": {
                        list_name,
                        book_name: title,
                        book_author: author,
                        date_added: new Date(),
                        book_image: image,
                    },
                },
            },
            { new: true }
        );

        if (updated) return res.sendStatus(204);

        // 3) list doesn't exist yet → create it
        await book_list.findOneAndUpdate(
            { userId },
            {
                $push: {
                    newList: {
                        list_name,
                        books: [
                            {
                                list_name,
                                book_name: title,
                                book_author: author,
                                date_added: new Date(),
                                book_image: image,
                            },
                        ],
                    },
                },
            },
            { new: true }
        );

        return res.sendStatus(204);
    } catch (err) {
        console.error("fileExpress error:", err);
        return res.status(500).send("Error saving book.");
    }
});

module.exports = router;
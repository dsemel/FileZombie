const express = require("express");
const router = express.Router();

const book_list = require("./list.js");

function requireAuth(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }

    return res.redirect("/login");
}

router.post("/moveBook/:list&:title&:author", requireAuth, async (req, res, next) => {

    console.log("MOVE ROUTE HIT");
    console.log("Source list:", req.params.list);
    console.log("Target list:", req.body.targetList);
    console.log("New list name:", req.body.newListName);

    try {
        const userId = String(req.user._id);

        const sourceListName = decodeURIComponent(req.params.list);
        const bookTitle = decodeURIComponent(req.params.title);
        const author = decodeURIComponent(req.params.author);

        let targetListName = String(req.body.targetList || "").trim();
        const newListName = String(req.body.newListName || "").trim();

        // If "New list..." was selected, use the name entered by the user.
        // If the user typed a new list name, use it as the destination.
        if (newListName) {
            targetListName = newListName;
        } else if (targetListName === "__new__") {
            return res.status(400).send("Please enter a name for the new list.");
        }

        if (!targetListName) {
            return res.status(400).send("Please select a destination list.");
        }

        const userBookList = await book_list.findOne({ userId });

        if (!userBookList) {
            return res.status(404).send("Book list not found.");
        }

        // Find the list the book is currently in.
        const sourceList = userBookList.newList.find(
            list => list.list_name === sourceListName
        );

        if (!sourceList) {
            return res.status(404).send("Source list not found.");
        }

        // Find the actual book.
        const bookIndex = sourceList.books.findIndex(
            book =>
                book.book_name === bookTitle &&
                book.book_author === author
        );

        if (bookIndex === -1) {
            return res.status(404).send("Book not found.");
        }

        // Keep the complete existing book object.
        const bookToMove = sourceList.books[bookIndex];

        // Find the destination list.
        let destinationList = userBookList.newList.find(
            list => list.list_name === targetListName
        );

        // Create it if it doesn't exist.
        if (!destinationList) {
            userBookList.newList.push({
                list_name: targetListName,
                books: []
            });

            destinationList =
                userBookList.newList[userBookList.newList.length - 1];
        }

        // Don't create a duplicate in the destination list.
        const alreadyExists = destinationList.books.some(
            book =>
                book.book_name === bookTitle &&
                book.book_author === author
        );

        if (!alreadyExists) {
            destinationList.books.push({
                list_name: targetListName,
                book_name: bookToMove.book_name,
                book_author: bookToMove.book_author,
                date_added: bookToMove.date_added,
                date_finished: bookToMove.date_finished,
                book_image: bookToMove.book_image
            });
        }

        // Remove it from its old list.
        sourceList.books.splice(bookIndex, 1);

        await userBookList.save();

        return res.redirect(
            "/display_list/" +
            encodeURIComponent(sourceListName) +
            "?moved=" +
            encodeURIComponent(bookTitle) +
            "&destination=" +
            encodeURIComponent(targetListName)
        );

    } catch (error) {
        next(error);
    }
});

module.exports = router;
// routes/bookProfile.js
const express = require("express");
const router = express.Router();

const request = require("request");
const book_list = require("./list.js");

const googleBooksKey = process.env.GOOGLE_BOOKS_API_KEY;

function requireAuthOptional(req, res, next) {
    // We allow viewing book profile without login,
    // but logged-in users will see their lists.
    next();
}

router.get("/", (req, res) => {
    res.render("book_profile", {
        book_description: "",
        book_image: "",
        smallBook_image: "",
        book_title: "",
        book_author: "",
        book_isbnTen: "",
        book_isbnThirteen: "",
        book_pageCount: "",
        book_printType: "",
        read: "read",
        currentlyReading: "currently reading",
        wantToRead: "want to read",
        addList: [], // ✅ always array
    });
});

// GET /book_profile/:title&:author?
router.get("/:title&:author?", requireAuthOptional, async (req, res) => {
    try {
        const title = req.params.title || "";
        const author = req.params.author || "";

        // If logged in, fetch lists (so your dropdown can populate)
        let addList = [];
        const isAuthed = req.isAuthenticated && req.isAuthenticated();
        if (isAuthed) {
            const userId = String(req.user._id);
            const doc = await book_list.findOne({ userId }).lean();
            addList = doc?.newList && Array.isArray(doc.newList) ? doc.newList : [];
        }

        // Build a correct Google Books query
        // Example: q=intitle:"Dune"+inauthor:"Frank Herbert"
        const qParts = [];
        if (title.trim()) qParts.push(`intitle:"${title}"`);
        if (author.trim()) qParts.push(`inauthor:"${author}"`);
        const q = qParts.length ? qParts.join("+") : title || author || "";

        const url =
            "https://www.googleapis.com/books/v1/volumes?q=" +
            encodeURIComponent(q) +
            "&printType=books&maxResults=1" +
            "&key=" + googleBooksKey;

        request(url, (error, apiResp, data) => {
            if (error) {
                console.error("Google Books request error:", error);
                return res.status(500).send("Error fetching book data.");
            }

            let gb_data;
            try {
                gb_data = JSON.parse(data);
            } catch (e) {
                console.error("Google Books JSON parse error:", e);
                return res.status(500).send("Error parsing book data.");
            }

            const items = gb_data?.items || [];

            const bestMatch =
                items.find(b =>
                    b.volumeInfo &&
                    b.volumeInfo.description &&
                    b.volumeInfo.imageLinks &&
                    b.volumeInfo.imageLinks.thumbnail
                ) || items[0];

            const item = bestMatch?.volumeInfo;

            if (!item) {
                return res.render("book_profile", {
                    book_description: "",
                    book_image: "",
                    smallBook_image: "",
                    book_title: title,
                    book_author: author,
                    book_isbnTen: "",
                    book_isbnThirteen: "",
                    book_pageCount: "",
                    book_printType: "",
                    read: "read",
                    currentlyReading: "currently reading",
                    wantToRead: "want to read",
                    addList,
                });
            }

            const identifiers = item.industryIdentifiers || [];
            const isbn13 = identifiers.find((x) => x.type === "ISBN_13")?.identifier || "";
            const isbn10 = identifiers.find((x) => x.type === "ISBN_10")?.identifier || "";

            let cleanTitle = item.title || title;

            if (author && cleanTitle.includes(author)) {
                cleanTitle = cleanTitle.replace(author, "").replace(/:\s*$/, "").trim();
            }
            return res.render("book_profile", {
                book_description: item.description || "",
                book_image: item.imageLinks?.thumbnail || "/images/no-cover.png",
                smallBook_image: item.imageLinks?.smallThumbnail || "",
                book_title: cleanTitle,
                book_author: Array.isArray(item.authors) ? item.authors.join(", ") : (item.authors || author || ""),
                book_isbnTen: isbn10,
                book_isbnThirteen: isbn13,
                book_pageCount: item.pageCount || "",
                book_printType: item.printType || "",
                read: "read",
                currentlyReading: "currently reading",
                wantToRead: "want to read",
                addList,
            });
        });
    } catch (err) {
        console.error("bookProfile error:", err);
        return res.status(500).send("Error loading book profile.");
    }
});

module.exports = router;
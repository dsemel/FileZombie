// routes/homePage.js
const express = require("express");
const router = express.Router();

const request = require("request");
const async = require("async");

const book_list = require("./list.js");

const apiKey = process.env.NYTapi_key;

console.log("NYT api_key present?", !!apiKey);

// Redirect root to /home
router.get("/", (req, res) => {
    return res.redirect("/home");
});

router.get("/home", (req, res) => {
    async.parallel(
        [
            function (next) {
                const url =
                    "https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=" +
                    apiKey;

                request(url, function (error, apiResp, body) {
                    if (apiResp && apiResp.statusCode !== 200) {
                        console.error(
                            "NYT fiction status:",
                            apiResp.statusCode,
                            "body:",
                            typeof body === "string" ? body.slice(0, 200) : body
                        );
                    }

                    if (error) return next(error);

                    try {
                        const info = JSON.parse(body);
                        const books = info?.results?.books;
                        if (!books) return next(null, []); // tolerate NYT errors
                        return next(null, books);
                    } catch (e) {
                        return next(e);
                    }
                });
            },

            function (next) {
                const url =
                    "https://api.nytimes.com/svc/books/v3/lists/current/hardcover-nonfiction.json?api-key=" +
                    apiKey;

                request(url, function (error, apiResp, body) {
                    if (apiResp && apiResp.statusCode !== 200) {
                        console.error(
                            "NYT nonfiction status:",
                            apiResp.statusCode,
                            "body:",
                            typeof body === "string" ? body.slice(0, 200) : body
                        );
                    }

                    if (error) return next(error);

                    try {
                        const nf_info = JSON.parse(body);
                        const nf_books = nf_info?.results?.books;
                        if (!nf_books) return next(null, []); // tolerate NYT errors
                        return next(null, nf_books);
                    } catch (e) {
                        return next(e);
                    }
                });
            },
        ],
        async function (err, results) {
            if (err) {
                console.error("Error fetching NYT book data:", err);
                return res.status(500).send("Error fetching book data.");
            }

            const books = results[0] || [];
            const nf_books = results[1] || [];

            // Optional safety net: ensure book_list exists for logged-in user
            const isAuthed = req.isAuthenticated && req.isAuthenticated();
            if (isAuthed) {
                const userId = String(req.user._id);
                const doc = await book_list.findOne({ userId }).select("_id");
                if (!doc) {
                    await book_list.create({
                        userId,
                        first_name: "First",
                        last_name: "Last",
                        newList: [
                            { list_name: "read", books: [] },
                            { list_name: "currently reading", books: [] },
                            { list_name: "want to read", books: [] },
                        ],
                    });
                }
            }

            return res.render("home", { books, nf_books });
        }
    );
});

module.exports = router;
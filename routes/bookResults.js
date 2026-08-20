// routes/bookResults.js
const express = require("express");
const router = express.Router();
const request = require("request");

const googleBooksKey = process.env.GOOGLE_BOOKS_API_KEY;

router.get("/:encoded_id", (req, res) => {
    const term = decodeURIComponent(String(req.params.encoded_id || "")).trim();

    const perPage = 10;
    const currentPage = Math.max(parseInt(req.query.page || "1", 10), 1);
    const startIndex = (currentPage - 1) * perPage;

    const url =
        "https://www.googleapis.com/books/v1/volumes?q=" +
        encodeURIComponent(term) +
        "&startIndex=" +
        startIndex +
        "&maxResults=" +
        perPage +
        "&printType=books" +
        "&key=" + googleBooksKey;

    console.log("Google Books search:", term);

    request(url, (error, apiResp, body) => {
        console.log("Google Books status:", apiResp && apiResp.statusCode);
        console.log("Google Books body sample:", body && body.slice(0, 300));

        if (error) {
            console.error("Google Books error:", error);
            return res.status(500).send("Error fetching data from Google Books API");
        }

        let data;
        try {
            data = JSON.parse(body);
        } catch (e) {
            console.error("Google Books JSON parse error:", e);
            return res.status(500).send("Error parsing Google Books response");
        }

        const books = Array.isArray(data.items) ? data.items : [];
        const totalItems = typeof data.totalItems === "number" ? data.totalItems : 0;
        const pageCount = Math.max(1, Math.ceil(totalItems / perPage));

        console.log("Google Books totalItems:", totalItems);
        console.log("Google Books items length:", books.length);
        console.log(
            "First item title:",
            books[0] && books[0].volumeInfo && books[0].volumeInfo.title
        );

        return res.render("book_results", {
            books,
            bookSearchTerm: term,
            pageCount,
            currentPage,
        });
    });
});

module.exports = router;
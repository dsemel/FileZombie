const express = require("express");
const router = express.Router();
const request = require("request");

const googleBooksKey = process.env.GOOGLE_BOOKS_API_KEY;

router.get("/search", (req, res) => {
    const term = (req.query.q || "").trim();

    if (!term) {
        return res.json({ items: [] });
    }

    const url =
        "https://www.googleapis.com/books/v1/volumes?q=" +
        encodeURIComponent(term) +
        "&printType=books" +
        "&maxResults=10" +
        "&key=" + googleBooksKey;

    request(url, (error, apiResp, body) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ items: [] });
        }

        try {
            const data = JSON.parse(body);
            return res.json(data);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ items: [] });
        }
    });
});

module.exports = router;
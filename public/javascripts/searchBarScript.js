console.log("searchBarScript.js loaded");

$(document).ready(function () {
    $("#nav").load("/javascripts/searchBr.html", function () {
        // Prevent double-init if nav is loaded multiple times



        const $input = $("#findBook");
        if ($input.data("fz-autocomplete")) return;
        $input.data("fz-autocomplete", true);

        $input.autocomplete({
            minLength: 2,
            delay: 200,
            classes: {
                "ui-autocomplete": "fz-search-autocomplete"
            },
            source: function (request, response) {
                const term = (request.term || "").trim();
                if (!term) return response([]);

                $.ajax({
                    method: "GET",
                    dataType: "json",
                    url: "/api/books/search",
                    data: {
                        q: term

                    },
                    success: function (data) {
                        const items = Array.isArray(data.items) ? data.items : [];

                        const transformed = items
                            .filter(b => b && b.volumeInfo && b.volumeInfo.title && Array.isArray(b.volumeInfo.authors))
                            .map(b => ({
                                label: b.volumeInfo.title + " — " + b.volumeInfo.authors.join(", "),
                                title: b.volumeInfo.title,
                                author: b.volumeInfo.authors.join(", "),
                                image: (b.volumeInfo.imageLinks && b.volumeInfo.imageLinks.thumbnail) ? b.volumeInfo.imageLinks.thumbnail : ""
                            }))
                            .slice(0, 5);

                        response(transformed);
                    },
                    error: function (xhr) {
                        console.error("Google Books error:", xhr.status, xhr.responseText);
                        response([]); // IMPORTANT: always call response
                    }
                });
            },
            select: function (event, ui) {
                event.preventDefault();
                // Navigate via GET (no post() helper needed)
                window.location.href =
                    "/book_profile/" +
                    encodeURIComponent(ui.item.title) +
                    "&" +
                    encodeURIComponent(ui.item.author);
            }
        }).autocomplete("instance")._renderItem = function (ul, item) {
            const $li = $("<li>");
            const $wrap = $("<div>").addClass("item-wrapper");

            if (item.image) {
                $wrap.append($("<img>").addClass("imageClass").attr("src", item.image));
            }
            $wrap.append(
                $("<div>").addClass("info-wrapper").append(
                    $("<div>").addClass("title").text(item.title),
                    $("<div>").addClass("author").text("by " + item.author)
                )
            );

            return $li.append($wrap).appendTo(ul);
        };

        // Search button → book results
        $("#searchBtn").on("click", function () {
            const term = ($("#findBook").val() || "").trim();
            if (!term) return;
            window.location.href = "/book_results/" + encodeURIComponent(term);
        });

        // Enter key acts like Search
        $("#findBook").on("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                $("#searchBtn").click();
            }
        });
    });
});


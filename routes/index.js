const express = require("express");
const router = express.Router();

// Index route
router.get("/", async (req, res) => {
  try {
    // Abfrage der neuesten Blogposts sortiert nach created_at
    const blogs = await req.pool.query(
        "SELECT id, title, short_text, preview_image, create_date FROM blog ORDER BY create_date DESC LIMIT 5"
    );

    // Optional: Logge die Ergebnisse für Debugging
    console.log("Blogs fetched for index page:", blogs.rows);

    // Übergabe der Blogposts an die View
    res.render("index", { blogs: blogs.rows });
  } catch (err) {
    console.error("Error fetching blogs for index page:", err);
    res.status(500).render("error", { message: "Internal Server Error" });
  }
});

module.exports = router;
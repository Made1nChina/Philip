const express = require("express");
const router = express.Router(); // Initialize the router

// Middleware to check if the user is logged in
function isAuthenticated(req, res, next) {
    if (!req.session || !req.session.userid) {
        return res.redirect("/login"); // Redirect to login if not authenticated
    }
    next();
}

// Dashboard page
router.get("/", isAuthenticated, async (req, res) => {
    try {
        console.log("Dashboard route hit");
        console.log("Session UserID:", req.session.userid);

        const userId = req.session.userid;

        // Fetch blog associated with the logged-in user
        const blog = await req.pool.query(
            "SELECT * FROM blog WHERE user_id = $1",
            [userId]
        );

        console.log("blog fetched from the database:", blog.rows);

        res.render("dashboard", {
            userId,
            blog: blog.rows,
        });
    } catch (err) {
        console.error("Error in dashboard route:", err);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
});
router.post("/blog", isAuthenticated, async (req, res) => {
    try {
        console.log("Request body received:", req.body);

        const { title, short_text, preview_image, create_date } = req.body;
        const userId = req.session.userid;

        // Validate input
        if (!title || !short_text) {
            console.error("Missing required fields: title or short_text");
            return res.status(400).send("Title and short text are required.");
        }

        // Log the incoming data
        console.log("Creating a new blog with data:", {
            userId,
            title,
            short_text,
            preview_image,
            create_date,
        });

        // Insert blog into the database
        await req.pool.query(
            "INSERT INTO blog (user_id, title, short_text, preview_image, create_date) VALUES ($1, $2, $3, $4, $5)",
            [userId, title, short_text, preview_image, create_date]
        );

        // Redirect back to the dashboard
        console.log("Blog created successfully for user_id:", userId);
        res.redirect("/dashboard");
    } catch (err) {
        console.error("Error creating blog:", err);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
});

// Logout route
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login"); // Redirect to login after logout
    });
});

// Add a new blog
router.post("/", isAuthenticated, async (req, res) => {
    const { title, short_text, preview_image } = req.body;
    const userId = req.session.userid;

    if (!title) {
        return res.status(400).send("Title and content are required");
    }

    try {
        await req.pool.query(
            "INSERT INTO blog (user_id, title, short_text, preview_image) VALUES ($1, $2, $3, $4)",
            [userId, title, short_text, preview_image]
        );
        res.redirect("/dashboard");
    } catch (err) {
        console.error("Error creating blog:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Edit a blog
router.post("/blog/:id/edit", isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { title, short_text, preview_image } = req.body;

    if (!title || !short_text) {
        return res.status(400).send("Title and content are required");
    }

    try {
        await req.pool.query(
            "UPDATE blog SET title = $1, short_text = $2, preview_image = $3 WHERE id = $4 AND user_id = $5",
            [title, short_text, preview_image, id, req.session.userid]
        );
        res.redirect("/dashboard");
    } catch (err) {
        console.error("Error updating blog:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Delete a blog
router.post("/blog/:id/delete", isAuthenticated, async (req, res) => {
    const { id } = req.params;

    try {
        await req.pool.query(
            "DELETE FROM blog WHERE id = $1 AND user_id = $2",
            [id, req.session.userid]
        );
        res.redirect("/dashboard");
    } catch (err) {
        console.error("Error deleting blog:", err);
        res.status(500).send("Internal Server Error");
    }
});

// View detailed blog page
router.get("/blog/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await req.pool.query(
            "SELECT * FROM blog WHERE id = $1",
            [id]
        );

        if (result.rows.length < 1) {
            return res.status(404).send("Blog not found");
        }

        const blog = result.rows[0];
        res.render("blog_detail", { blog });
    } catch (err) {
        console.error("Error fetching blog:", err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
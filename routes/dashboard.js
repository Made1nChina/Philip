const express = require("express");
const router = express.Router(); // Initialize the router
const path = require("path");
const multer = require("multer");

// Middleware
function isAuthenticated(req, res, next) {
    if (!req.session || !req.session.userid) {
        return res.redirect("/login"); // Redirect to login if not authenticated
    }
    next();
}

// Dashboard page
router.get("/", isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userid;

        const blogs = await req.pool.query(
            "SELECT id, title, short_text, preview_image, create_date FROM blog WHERE user_id = $1 ORDER BY create_date DESC",
            [userId]
        );

        res.render("dashboard", {blogs: blogs.rows});
    } catch (err) {
        console.error("Error fetching blogs:", err);
        res.status(500).render("error", {message: "Internal Server Error"});
    }
});
router.get("/new", isAuthenticated, (req, res) => {
    res.render("new_blog"); // Render a form to create a new blog
});
router.get("/edit/:id", async (req, res) => {
    const blogId = req.params.id;

    try {
        const query = `SELECT *
                       FROM blog
                       WHERE id = $1`;
        const result = await req.pool.query(query, [blogId]);

        if (result.rows.length === 0) {
            console.log("Blog not found:", blogId);
            return res.status(404).send("Blog not found");
        }

        const blog = result.rows[0];
        console.log("Fetched blog:", blog); // Debug log
        res.render("edit_blog", {blog});
    } catch (err) {
        console.error("Error fetching blog:", err);
        res.status(500).send("Internal Server Error");
    }
});
router.post("/blog", isAuthenticated, async (req, res) => {
    try {
        console.log("Request body received:", req.body);

        const {title, short_text, preview_image, create_date, imagepath} = req.body;
        const userId = req.session.userid;

        // Validate input
        if (!title || !short_text) {
            console.error("Missing required fields: title or short_text");
            return res.status(400).send("Title and short text are required.");
        }

        // Log
        console.log("Creating a new blog with data:", {
            userId,
            title,
            short_text,
            preview_image,
            create_date,
            imagepath,
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
        res.status(500).render("error", {message: "Internal Server Error"});
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
    const {title, short_text, preview_image} = req.body;
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
    const {id} = req.params;
    const {title, short_text, preview_image} = req.body;

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
    const {id} = req.params;

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
    const {id} = req.params;

    try {
        const result = await req.pool.query(
            "SELECT * FROM blog WHERE id = $1",
            [id]
        );

        if (result.rows.length < 1) {
            return res.status(404).send("Blog not found");
        }

        const blog = result.rows[0];
        res.render("blog_detail", {blog});
    } catch (err) {
        console.error("Error fetching blog:", err);
        res.status(500).send("Internal Server Error");
    }
});
// Route for rendering the new blog form
router.get("/new", isAuthenticated, (req, res) => {
    res.render("new_blog"); // Renders the `new_blog.mustache` template
});

// Route for handling blog creation
router.post("/new", isAuthenticated, async (req, res) => {
    try {
        const {title, short_text, preview_image} = req.body;
        const userId = req.session.userid;

        // Insert blog into the database
        await req.pool.query(
            "INSERT INTO blog (user_id, title, short_text, preview_image, create_date) VALUES ($1, $2, $3, $4, NOW())",
            [userId, title, short_text, preview_image]
        );

        res.redirect("/dashboard"); // Redirect back to the dashboard
    } catch (err) {
        console.error("Error creating blog:", err);
        res.status(500).render("error", {message: "Internal Server Error"});
    }
});
// Route for rendering the blog edit form
router.get("/edit/:id", isAuthenticated, async (req, res) => {
    try {
        const blogId = req.params.id;

        // Fetch the blog data from the database
        const result = await req.pool.query(
            "SELECT id, title, short_text, preview_image FROM blog WHERE id = $1 AND user_id = $2",
            [blogId, req.session.userid]
        );

        if (result.rows.length === 0) {
            return res.status(404).render("error", {message: "Blog not found"});
        }

        res.render("edit_blog", {blog: result.rows[0]}); // Pass the blog data to the template
    } catch (err) {
        console.error("Error fetching blog for editing:", err);
        res.status(500).render("error", {message: "Internal Server Error"});
    }
});

// Route for handling blog updates
router.post("/edit/:id", isAuthenticated, async (req, res) => {
    try {
        const blogId = req.params.id;
        const {title, short_text, preview_image} = req.body;

        // Update the blog in the database
        await req.pool.query(
            "UPDATE blog SET title = $1, short_text = $2, preview_image = $3 WHERE id = $4 AND user_id = $5",
            [title, short_text, preview_image, blogId, req.session.userid]
        );

        res.redirect("/dashboard"); // Redirect back to the dashboard
    } catch (err) {
        console.error("Error updating blog:", err);
        res.status(500).render("error", {message: "Internal Server Error"});
    }
});
// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({storage});

// Image upload route
router.post("/upload-image", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({error: "No file uploaded"});
    }
    res.json({
        message: "Image uploaded successfully",
        filePath: `/uploads/${req.file.filename}`,
    });
});
// save Blog
router.post("/save-blog/:id?", upload.single("image"), async (req, res) => {
    const blogId = req.params.id; // Optional: If `id` is provided, edit; otherwise, create
    const {title, shortText, longText} = req.body;
    const previewImage = req.file ? req.file.filename : null; // Uploaded image filename
    const userId = req.session.userid; // Get user_id from session

    if (!userId) {
        return res.status(403).send("You must be logged in to perform this action.");
    }

    try {
        if (blogId) {
            // Update existing blog
            const query = `
                UPDATE blog
                SET title         = $1,
                    short_text    = $2,
                    long_text     = $3,
                    preview_image = COALESCE($4, preview_image)
                WHERE id = $5
                  AND user_id = $6
            `;
            await req.pool.query(query, [title, shortText, longText || null, previewImage, blogId, userId]);
        } else {
            // Create new blog
            const query = `
                INSERT INTO blog (title, short_text, long_text, preview_image, user_id, create_date)
                VALUES ($1, $2, $3, $4, $5, NOW())
            `;
            await req.pool.query(query, [title, shortText, longText || null, previewImage, userId]);
        }

        // Redirect to the dashboard
        res.redirect("/dashboard");
    } catch (err) {
        console.error("Error saving blog:", err);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router;
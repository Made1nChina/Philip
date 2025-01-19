var express = require('express');
var router = express.Router();

// Route to get all blog posts
router.get('/', function (req, res, next) {
    db.query('SELECT * FROM blog ORDER BY create_date DESC', function (err, results) {
        if (err) {
            return next(err);
        }
        res.render('profile', {blogs: results.rows}); // Render profile page with blog data
    });
});

// Route to create a new blog post
router.post('/new', function (req, res, next) {
    const {title, short_text, autor, long_text} = req.body;
    db.query(
        'INSERT INTO blog (title, short_text, autor, long_text) VALUES ($1, $2, $3, $4)',
        [title, short_text, autor, long_text],
        function (err) {
            if (err) {
                return next(err);
            }
            res.redirect('/blog'); // Redirect to blog list after creation
        }
    );
});

// Route to edit an existing blog post
router.post('/edit/:id', function (req, res, next) {
    const {id} = req.params;
    const {title, short_text, autor, long_text} = req.body;
    db.query(
        'UPDATE blog SET title = $1, short_text = $2, autor = $3, long_text = $4 WHERE id = $5',
        [title, short_text, autor, long_text, id],
        function (err) {
            if (err) {
                return next(err);
            }
            res.redirect('/blog'); // Redirect to blog list after editing
        }
    );
});
router.get('/blogs/:id', async (req, res) => {
    const id = req.params.id;
    const blog = await getBlogById(id); // Datenbankabfrage
    res.render('blog_detail', {blog});
});
module.exports = router;

const express = require('express');
const blogsController = require('../../controllers/blogs.controller');

const router = express.Router();

router.route("/")
.get(blogsController.getBlogs)
.post(blogsController.postBlog);

router.route("/:id").delete(blogsController.deleteBlog);

module.exports = router;
const express = require('express');
const blogsController = require('../../controllers/blogs.controller');

const router = express.Router();

router.route("/")
.get(blogsController.getBlogs)
.post(blogsController.postBlog)
.put(blogsController.updateBlog);

router.route("/:id")
.get(blogsController.getBlogDetails)
.delete(blogsController.deleteBlog);

module.exports = router;
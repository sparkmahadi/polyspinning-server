const express = require('express');
const blogsController = require('../../controllers/blogs.controller');

const router = express.Router();

router.route("/").get(blogsController.getBlogs);

module.exports = router;
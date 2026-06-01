const express = require('express');
const router = express.Router();

const blogController = require('../controllers/blog');

const { verify, verifyAdmin } = require("../auth");

// GET /blogs/getAllBlogs
router.get("/getAllBlogs", blogController.getAllBlogs);

// GET /blogs/getMyBlogs
router.get("/getMyBlogs", verify, blogController.getMyBlogs);

// POST /blogs/createBlog
router.post("/createBlog", verify, blogController.createBlog);

// PATCH /blogs/updateMyBlog/:blogId
router.patch("/updateMyBlog/:blogId", verify, blogController.updateMyBlog);

// DELETE /blogs/deleteMyBlog/:blogId
router.delete("/deleteMyBlog/:blogId", verify, blogController.deleteMyBlog);

// DELETE /blogs/deleteBlog/:blogId
router.delete("/deleteBlog/:blogId", verify, verifyAdmin, blogController.deleteBlog);

// PATCH /blogs/:blogId/addComment
router.patch("/:blogId/addComment", verify, blogController.addComment);

// GET /blogs/getMyComments
router.get("/:blogId/getMyComments", verify, blogController.getMyComments);

// PATCH /blogs/:blogId/updateComment/:commentId
router.patch("/:blogId/updateComment/:commentId", verify, blogController.updateComment);

// DELETE /blogs/:blogId/deleteComment/:commentId
router.delete("/:blogId/deleteComment/:commentId", verify, blogController.deleteComment);

module.exports = router;
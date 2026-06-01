const Blog = require('../models/Blog');
const User = require('../models/User');
const mongoose = require("mongoose");
const { errorHandler } = require("../auth");



// User: createBlog by authenticated users

module.exports.createBlog = (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).send({ error: "All fields are required" });
  }

  Blog.create({
    author: {
      id: req.user.id,
      userName: req.user.userName,
      fullName: `${req.user.firstName} ${req.user.lastName}`
    },
    title,
    content
  })
    .then((newBlog) => {
      res.status(201).send(newBlog);
    })
    .catch((error) => errorHandler(error, req, res));
};

// View specific Blog
module.exports.getBlog = (req, res) => {
    return Blog.findById(req.params.blogId)
    .then(blog => {
        if(blog) {
            return res.status(200).send(blog);
        } else {
            return res.status(404).send({ error: "Blog not found" });
        }
    })
    .catch(err => res.status(500).send({ error: err.message }));
};


// User: getMyBlogs retrieve author's blog

module.exports.getMyBlogs = (req, res) => {
    Blog.find({ 'author.id': req.user.id })
    .then(blogs => {
        if (blogs.length > 0) {
            return res.status(200).send(blogs);
        } else {
            return res.status(404).send({ message: 'No blogs found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

// User: anyone who has access to the website

module.exports.getAllBlogs = (req, res) => {

    return Blog.find({})
    .then(result => {
        
        if(result.length > 0) {

            return res.status(200).send(result);

        } else {

            return res.status(404).send({ message: 'No blogs found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

// User: updateMyBlog add update by blog author

module.exports.updateMyBlog = (req, res) => {
    Blog.findById(req.params.blogId)
    .then(blog => {
        if (!blog) {
            return res.status(404).send({ message: 'Blog not found' });
        }

        // Check if the requester is the owner
        if (blog.author.id.toString() !== req.user.id) {
            return res.status(403).send({ message: 'Unauthorized: You can only update your own blogs' });
        }

        // Only update fields that are provided
        if (req.body.title) blog.title = req.body.title;
        if (req.body.content) blog.content = req.body.content;

        return blog.save();
    })
    .then(updatedBlog => {
        if (updatedBlog) {
            res.status(200).send({ success: true, message: 'Blog updated successfully' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

// User: deleteMyBlog author delete specific blog posted

module.exports.deleteMyBlog = (req, res) => {
    Blog.findById(req.params.blogId)
    .then(blog => {
        if (!blog) {
            return res.status(404).send({ message: 'Blog not found' });
        }

        // Check if the requester is the owner
        if (blog.author.id.toString() !== req.user.id) {
            return res.status(403).send({ message: 'Unauthorized: You can only delete your own blogs' });
        }

        return Blog.findByIdAndDelete(req.params.blogId);
    })
    .then(deletedBlog => {
        if (deletedBlog) {
            res.status(200).send({ success: true, message: 'Blog deleted successfully' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

// Admin deleteBlog admin can delete any specific blog


module.exports.deleteBlog = (req, res) => {
    Blog.findById(req.params.blogId)
    .then(blog => {
        if (!blog) {
            return res.status(404).send({ message: 'Blog not found' });
        }

        // Check if the requester is an admin
        if (!req.user.isAdmin) {
            return res.status(403).send({ message: 'Unauthorized: Admin access required' });
        }

        return Blog.findByIdAndDelete(req.params.blogId);
    })
    .then(deletedBlog => {
        if (deletedBlog) {
            res.status(200).send({ success: true, message: 'Blog deleted successfully' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};


module.exports.getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).send({ message: 'Invalid blog ID' });
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).send({ message: 'Blog not found' });
    }

    return res.status(200).send({ blog });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// Authenticated user can addComment to a blog

module.exports.addComment = (req, res) => {
    if (!req.body.comment) {
        return res.status(400).send({ error: "Comment is required" });
    }

    const newComment = {
        userId: req.user.id,
        userName: req.user.userName,
        comment: req.body.comment
    };

    return Blog.findByIdAndUpdate(
        req.params.blogId,
        { $push: { comments: newComment } }, // push to comments array
        { new: true }                         // return updated document
    )
    .then(blog => {
        if (blog) {
            res.status(200).send({ message: 'Comment added successfully', updatedBlog: blog });
        } else {
            res.status(404).send({ message: 'Blog not found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

// GET /blogs/getMyComments
module.exports.getMyComments = (req, res) => {
  Blog.find({ 'comments.userId': req.user.id })
    .then((blogs) => {
      const myComments = blogs.flatMap((blog) =>
        blog.comments
          .filter((comment) => {
            return comment.userId && comment.userId.toString() === req.user.id;
          })
          .map((comment) => ({
            blogId: blog._id,
            blogTitle: blog.title,
            commentId: comment._id,
            comment: comment.comment,
            userName: comment.userName,
          }))
      );

      return res.status(200).send(myComments);
    })
    .catch((error) => errorHandler(error, req, res));
};

// Authenticated user can update their comment to a blog

module.exports.updateComment = (req, res) => {
    if (!req.body.comment) {
        return res.status(400).send({ error: "Comment is required" });
    }

    Blog.findById(req.params.blogId)
    .then(blog => {
        if (!blog) {
            return res.status(404).send({ message: 'Blog not found' });
        }

        const comment = blog.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).send({ message: 'Comment not found' });
        }

        // Check if the requester is the comment owner
        if (comment.userId.toString() !== req.user.id) {
            return res.status(403).send({ message: 'Unauthorized: You can only update your own comments' });
        }

        comment.comment = req.body.comment;

        return blog.save();
    })
    .then(updatedBlog => {
        if (updatedBlog) {
            res.status(200).send({ success: true, message: 'Comment updated successfully' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};


// Authenticated user can delete their comment to a blog

module.exports.deleteComment = (req, res) => {
    Blog.findById(req.params.blogId)
    .then(blog => {
        if (!blog) {
            return res.status(404).send({ message: 'Blog not found' });
        }

        const comment = blog.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).send({ message: 'Comment not found' });
        }

        // Check if the requester is the comment owner
        if (comment.userId.toString() !== req.user.id) {
            return res.status(403).send({ message: 'Unauthorized: You can only delete your own comments' });
        }

        comment.deleteOne();

        return blog.save();
    })
    .then(updatedBlog => {
        if (updatedBlog) {
            res.status(200).send({ success: true, message: 'Comment deleted successfully' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};
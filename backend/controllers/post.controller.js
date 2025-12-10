import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";


// ------------------------------
// CREATE POST
// ------------------------------
export const createpost = async (req, res) => {
  try {
    const user = req.user;
    console.log("USER:", user);
    const profile = await Profile.findOne({ userid: user.id });

    if (!profile) return res.status(400).json({ message: "Profile not found" });

    const post = await Post.create({
      userid: user.id,
      body: req.body.body,
      author: profile.name,
      media: req.file ? `http://localhost:5000/public/images/posts/${req.file.filename}`: "",
      filetype: req.file ? req.file.mimetype.split("/")[1] : "",
      likes: 0,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return res.status(200).json({ message: "Post created", post });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// ------------------------------
// GET ALL POSTS (PUBLIC FEED)
// ------------------------------
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userid", "name username email profilepicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({ posts });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// ------------------------------
// DELETE POST (OWNER ONLY)
// ------------------------------
export const deletepost = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(400).json({ message: "Post not found" });

    if (post.userid.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await post.deleteOne();
    return res.status(200).json({ message: "Post deleted" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// ------------------------------
// COMMENT ON POST (Anyone Allowed)
// ------------------------------
export const commentpost = async (req, res) => {
  try {
    const user = req.user;
    const { postId, commentBody } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(400).json({ message: "Post not found" });

    const comment = await Comment.create({
      postid: postId,
      author: user.name,
      userid: user._id,
      content: commentBody,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(200).json({ message: "Comment created", comment });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// ------------------------------
// GET ALL COMMENTS OF A POST
// ------------------------------
export const getAllComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postid: postId })
      .sort({ createdAt: -1 });

    return res.status(200).json({ comments });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// ------------------------------
// DELETE COMMENT (Only your own comment)
// ------------------------------
export const deleteComment = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.body;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(400).json({ message: "Comment not found" });

    if (comment.userid.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await comment.deleteOne();
    return res.status(200).json({ message: "Comment deleted" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// ------------------------------
// INCREMENT LIKES (Anyone can like)
// ------------------------------
export const incrementLikes = async (req, res) => {
  try {
    const { id } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(400).json({ message: "Post not found" });

    post.likes++;
    await post.save();

    return res.status(200).json({ message: "Likes incremented",post });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// ------------------------------
// DECREMENT LIKES
// ------------------------------
export const decrementLikes = async (req, res) => {
  try {
    const { id } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(400).json({ message: "Post not found" });

    if (post.likes > 0) post.likes--;
    await post.save();

    return res.status(200).json({ message: "Likes decremented" ,post});

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

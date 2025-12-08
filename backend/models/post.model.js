// models/Post.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const postSchema = new Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  media: { type: String },
  filetype: { type: String },
});

const Post = mongoose.model('Post', postSchema);
export default Post;

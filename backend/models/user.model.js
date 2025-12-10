import mongoose from "mongoose";
const { Schema } = mongoose;
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new Schema({
    name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  active :{ type:Boolean,default:true},
  profilepicture: { type: String ,default:"http://localhost:5000/uploads/av.png"},
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.methods.generateHash = async function (password) {
  return await bcrypt.hash(password, 10);
};

// Compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const User = mongoose.model('User', userSchema);
export default User;

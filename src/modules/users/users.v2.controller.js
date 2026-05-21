import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "./user.model.js";
const userResponse = (doc) => {
  const user = doc.toObject();
  delete user.password;
  return user;
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    console.log(users);
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const createUsers = async (req, res, next) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    const err = new Error("username, email, and password are required");

    err.name = "ValidationError";
    err.status = 400;
    // return res.status(400).json({ success: false, error: err.message });
    next(err);
  }

  try {
    const doc = await User.create({ username, email, password, role });

    return res.status(201).json({ success: true, data: userResponse(doc) });
  } catch (err) {
    // console.error("error createing users", err);
    // return res.status(500).json({ success: false, error: err });
    next(err);
  }
};
// Update user
export const updateUsers = async (req, res, next) => {
  const { username, email, password, role } = req.body || {};
  const updates = {};

  if (username !== undefined) updates.username = username;
  if (email !== undefined) updates.email = email;
  if (password !== undefined) updates.password = password;
  if (role !== undefined) updates.role = role;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: "At least one field is required to update",
    });
  }

  try {
    const doc = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, data: doc });
  } catch (err) {
    // return res.status(400).json({ success: false, error: err });
    err.status = 400;
    next(err);
  }
};
// Delete user
export const deleteUser = async (req, res, next) => {
  const { id } = req.params || {};
  try {
    const response = await User.findByIdAndDelete(id);
    console.log(`delete:${id}`);
    return res.status(200).json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error(`some thing wrong⛔:${err}`);
    // return res.status(400).json({ success: false, error: error });
    next(err);
  }
};
// Login user
export const usersLogin = async (req, res, next) => {
  const { email, username, password } = req.body || {};

  try {
    const user = await User.findOne({ email }).select("+password");
    console.log(user);

    const isMatched = await bcrypt.compare(password, user.password);
    if (isMatched) {
      res
        .status(200)
        .json({ success: true, message: "Identity verification successful ✔" });
    } else {
      res.status(404).json({
        success: false,
        error: err,
        message: "email or password isn't correct",
      });
    }
  } catch (err) {
    next(err);
  }
};
// Login with JWT
export const usersLoginJWT = async (req, res, next) => {
  const { email, username, password } = req.body || {};

  try {
    const user = await User.findOne({ email }).select("+password");
    console.log(user);

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      res
        .status(400)
        .json({ success: false, message: "verification not successful ⛔" });
    }

    const token = jwt.sign({ userId: user._id }, process.JWT_SECRET, {
      expiresIn: "1h", //1 hours expiration
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd, // only send over HTTPS in production
      sameSite: isProd ? "none" : "lax",
      parh: "/",
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    return res
      .status(200)
      .json({
        success: true,
        message: "Login successful !",
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
  } catch (err) {
    next(err);
  }
};
// Check user section
export const CheckUser = async (req, res, next) => {
  try {
    const iserId = req.user.user_id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found !",
      });
      return res.statys(200).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          role: user.role,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};
// Logout user
export const usersLogout = async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd, // only send over HTTPS in production
    sameSite: isProd ? "none" : "lax",
    parh: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logout success !",
  });
};

export const createUsersHash = async (req, res, next) => {
  const { password, email, username, role } = req.body || {};

  if (!email || !password) {
    console.error(`email andd password requied : ${err}`);
    next(err);
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "email alard use.", success: false });
    }
    // const newUser = new User({
    //   username,
    //   email,
    //   password,
    //   role,
    // });

    // const doc = await newUser.save();

    const doc = await User.create({ email, username, password, role });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// export const updateUser = async(req,res)=>{
// try{
//   const doc=await User.findByIdAndUpdate(req.params.id,{ $set: req.body },{runValidators:true,returnDocument:'after'})
// if(!doc){return res.status(404).json({error:"user not found"})}
//   return res.status(200).json({success:true,data:userResponse(doc)});
// }catch(err){
// return res.status(400).json({error:err.message})
// }}

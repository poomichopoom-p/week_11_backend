import { Router } from "express";
import { User } from "../../modules/users/user.model.js";

export const router = Router();

const userResponse = (doc) => {
  const user = doc.toObject();
  delete user.password;
  return user;
};

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
});
router.post("/", async (req, res) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    const err = new Error("username, email, and password are required");

    err.name = "ValidationError";
    err.status = 400;
    return res.status(400).json({ success: false, error: err.message });
  }

  try {
    const doc = await User.create({ username, email, password, role });

    return res.status(201).json({ success: true, data: userResponse(doc) });
  } catch (err) {
    console.error("error createing users", err);
    return res.status(500).json({ success: false, error: err });
  }

  const nextId = String(
    (users.reduce((max, u) => Math.max(max, Number(u.id)), 0) || 0) + 1,
  );

  const newUser = { id: nextId, username, email };

  users.push(newUser);

  return res.status(201).json(newUser);
});

router.put("/:id", async (req, res) => {
  const user = users.find((u) => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found!" });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "username email and password not found!" });
  }

  user.username = username;
  user.email = email;
  user.password = password;

  res.status(200).json(user);
});

router.delete("/:id", async (req, res) => {});

// app.post("/createAccount", (req, res) => {
//   const newUser = {
//     id : DataTransfer.now().toString(),
//     username : req.body.username,
//     email : req.body.email,
//     password :req.body.password,
//   };
//   users.push(newUser);

//   res.status(201).json({
//     message:"User created",
//     data: newUser,
//   });
// });
// app.delete("/deleteAccount", (req, res) => {});

import { Router } from "express";
import { users } from "../../fakeData/fakeUsers.js";

export const router = Router();

router.get("/", (req, res) => {
  res.json(users);
});
router.post("/", (req, res) => {
  const { username, email } = req.body || {};
  if (!username || !email) {
    return res.status(400).json({ error: "username and email are required" });
  }

  const nextId = String(
    (users.reduce((max, u) => Math.max(max, Number(u.id)), 0) || 0) + 1,
  );

  const newUser = { id: nextId, username, email };

  users.push(newUser);

  return res.status(201).json(newUser);
});

router.put("/users/:id", (req, res) => {
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

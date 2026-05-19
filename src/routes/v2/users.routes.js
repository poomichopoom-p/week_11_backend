import { Router } from "express";
import { User } from "../../modules/users/user.model.js";
import { supabase } from "../../config/supabase.js";
import { deleteUser, getUsers, updateUsers, createUsers } from "../../modules/users/users.controller.js";


export const router = Router();

// MongoDB routes {/api/v2/users}


router.get("/", getUsers );
router.post("/", createUsers );

router.put("/:id",updateUsers );
router.delete("/:id",deleteUser );

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

//Supabase /PostgreSQL routes

const PG_SELECT = "id, username, email, role, created_at, updated_at";

router.get("/pg", async (req, res) => {
  try {
    const users = await supabase.from("users").select(PG_SELECT);
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, error: error });
  }
});

router.post("/pg", async (req, res) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "username, email, and password are required",
    });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .insert({ username, email, password, role: role || "user" })
      .select(PG_SELECT)
      .single();
    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  const nextId = String(
    (users.reduce((max, u) => Math.max(max, Number(u.id)), 0) || 0) + 1,
  );

  const newUser = { id: nextId, username, email };

  users.push(newUser);

  return res.status(201).json(newUser);
});

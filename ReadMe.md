# รายงานการพัฒนา Backend Application (Express.js)

ไฟล์นี้สรุปสิ่งที่ได้ทำลงไปในโปรเจกต์นี้ โดยมีการอธิบายเป็นภาษาไทยแบบบรรทัดต่อบรรทัด พร้อมทั้งเหตุผลที่เลือกใช้แนวทางต่างๆ

---

## 1. สิ่งที่ทำในโปรเจกต์นี้ (What I do)
- ตั้งค่าเซิร์ฟเวอร์ด้วย Express.js
- จัดการระบบ Routing แบบ Versioning (V1 และ V2) เพื่อรองรับการพัฒนาที่เปลี่ยนผ่าน
- เชื่อมต่อฐานข้อมูล 2 รูปแบบ: MongoDB (ผ่าน Mongoose) และ Supabase (PostgreSQL)
- สร้างระบบจัดการผู้ใช้ (Users) ที่รองรับทั้งการใช้ข้อมูลจำลอง (Fake Data) ใน V1 และข้อมูลจริงใน V2
- ออกแบบ Model สำหรับข้อมูลผู้ใช้ใน MongoDB
- พัฒนา API endpoints สำหรับ GET, POST, PUT โดยแยกตามเวอร์ชัน

## 2. ทำไมถึงทำแบบนี้ (Why I do this)
- **Express.js:** เป็น Framework ที่เบาและยืดหยุ่นสูง เหมาะสำหรับการเรียนรู้และการสร้าง API อย่างรวดเร็ว
- **Versioning (V1/V2):** เพื่อแยกการทำงานระหว่างช่วงทดสอบ (V1 - Fake Data) กับช่วงใช้งานจริง (V2 - DB) ทำให้โค้ดไม่ปนกันและรองรับการเปลี่ยนแปลงในอนาคตได้ดี
- **Dual Databases (MongoDB & Supabase):** เพื่อเปรียบเทียบการใช้งานระหว่าง NoSQL (MongoDB) และ SQL (Supabase/Postgres) รวมถึงการใช้งาน Cloud Database
- **ES Modules (`import/export`):** ใช้มาตรฐานสมัยใหม่ของ JavaScript เพื่อความสะดวกในการจัดการ module
- **Separation of Concerns:** แยกส่วน Config, Routes, และ Models ออกจากกันเพื่อให้โค้ดอ่านง่ายและบำรุงรักษาได้สะดวก

---

## 3. อธิบายโค้ดทีละบรรทัด (Line-by-line Explanation)

### `package.json` (การตั้งค่าโปรเจกต์)
```json
{
  "name": "backend", // ชื่อโปรเจกต์
  "version": "1.0.0", // เวอร์ชันของโปรเจกต์
  "type": "module", // กำหนดให้ใช้ ES Modules (import/export)
  "scripts": {
    "dev": "node --env-file=.env --watch src/server.js" // คำสั่งรันในโหมดพัฒนา พร้อมโหลดไฟล์ .env และรีสตาร์ทอัตโนมัติเมื่อมีการแก้ไข
  },
  "dependencies": {
    "cors": "^2.8.6", // สำหรับจัดการการเข้าถึงจากโดเมนอื่น
    "express": "^5.2.1", // Framework หลัก
    "mongoose": "^9.6.2", // Library สำหรับเชื่อมต่อ MongoDB
    "@supabase/supabase-js": "^2.105.4" // SDK สำหรับเชื่อมต่อ Supabase
  }
}
```

### `src/server.js` (จุดเริ่มต้นของระบบ)
```javascript
import express from "express"; // นำเข้า Express Framework
import cors from "cors"; // นำเข้า CORS ป้องกันปัญหาการเรียกข้ามโดเมน
import { router as apiRoutes } from "./routes/index.js"; // นำเข้า routes ทั้งหมด
import { connectDB } from "./config/mongodb.js"; // ฟังก์ชันเชื่อมต่อ MongoDB
import { connectSupabase } from "./config/supabase.js"; // ฟังก์ชันเชื่อมต่อ Supabase

const app = express(); // สร้าง instance ของแอป Express
app.use(cors()); // เปิดใช้งาน CORS
app.use(express.json()); // อนุญาตให้เซิร์ฟเวอร์อ่านข้อมูล JSON จาก Body ได้

const port = 3000; // กำหนด Port ที่เซิร์ฟเวอร์จะทำงาน

app.get("/", (req, res) => { // Route หลักสำหรับหน้าแรก
  res.send(`...`); // ส่งหน้า HTML กลับไปแสดงผล (พร้อม Tailwind CSS)
});

app.use("/api", apiRoutes); // ใช้งาน routes ทั้งหมดภายใต้ path /api

await connectDB(); // เชื่อมต่อ MongoDB
await connectSupabase(); // เชื่อมต่อ Supabase

app.listen(port, () => { // เริ่มการทำงานของเซิร์ฟเวอร์
  console.log(`Server running on port : ${port}🌎✔`);
});
```

### `src/config/mongodb.js` (เชื่อมต่อ MongoDB)
```javascript
import mongoose from "mongoose"; // นำเข้า Mongoose

export async function connectDB() {
  const uri = process.env.MONGODB_URI; // อ่าน URI จากไฟล์ .env

  try {
    await mongoose.connect(uri, { dbName: "jsd12-express-app" }); // เชื่อมต่อกับ MongoDB
    console.log("MongoDB connected 🌎");
  } catch (err) {
    console.error("MongoDB connection error ⛔", err); // แสดง error หากเชื่อมต่อไม่สำเร็จ
    throw err;
  }
}
```

### `src/modules/users/user.model.js` (โครงสร้างข้อมูลผู้ใช้ MongoDB)
```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username:{type: String, required: true, trim: true}, // ชื่อผู้ใช้ (ห้ามว่าง, ตัดช่องว่าง)
        role:{type: String, enum: ["user","admin"], default: "user"}, // สิทธิ์ (user หรือ admin)
        email:{ type: String, required: true, unique: true, lowercase: true }, // อีเมล (ห้ามซ้ำ)
        password: { type: String, required: true, minlength: 8, select: false }, // รหัสผ่าน (ขั้นต่ำ 8 ตัว, ไม่ส่งกลับไปในผลลัพธ์ปกติ)
    },
    { timestamps: true }, // สร้าง createdAt และ updatedAt อัตโนมัติ
);
export const User = mongoose.model("User", userSchema); // สร้าง Model ชื่อ User
```

### `src/routes/v1/users.routes.js` (V1 - ใช้ข้อมูลสมมติ)
```javascript
router.get("/", (req, res) => {
  res.json(users); // ส่งข้อมูลผู้ใช้จากไฟล์ fakeUsers.js
});
router.post("/", (req, res) => {
  // รับข้อมูล -> ตรวจสอบ -> สร้าง ID ใหม่ -> เพิ่มลงใน Array (Fake Data)
});
```

### `src/routes/v2/users.routes.js` (V2 - ใช้ฐานข้อมูลจริง)
- ส่วนแรกจัดการข้อมูลผ่าน **MongoDB** โดยใช้ `User.find()` และ `User.create()`.
- ส่วนที่สองจัดการข้อมูลผ่าน **Supabase** โดยใช้ `supabase.from("users").select()` และ `.insert()`.
- **เหตุผล:** เพื่อรองรับการทำงานกับฐานข้อมูลระดับ Production ทั้ง SQL และ NoSQL

### `src/config/supabase.js` (เชื่อมต่อ Supabase)
```javascript
import { createClient } from "@supabase/supabase-js"; // นำเข้า Client ของ Supabase

const supabaseUrl = process.env.SUPABASE_URL; // URL ของโปรเจกต์ Supabase
const supabaseKey = process.env.SUPABASE_SECRET_KEY; // API Key (Service Role)

export const supabase = createClient(supabaseUrl, supabaseKey); // สร้าง Instance เพื่อใช้งานในส่วนอื่น

export async function connectSupabase() {
    try{
        const { error } = await supabase.from("users").select("id").limit(1); // ทดสอบดึงข้อมูล 1 ตัว
        if(error) throw error;
        console.log("Supabase connected ✔");
    } catch(err){
        console.error("Supabase connection error ⛔", err);
        throw err;
    }
}
```

### `src/routes/index.js` (ศูนย์รวม Route)
```javascript
import { Router } from "express";
import {router as v1Routes} from "./v1/index.js" // นำเข้า V1
import {router as v2Routes} from "./v2/index.js" // นำเข้า V2

export const router = Router();

router.use("/v1", v1Routes); // กำหนด prefix /v1
router.use("/v2", v2Routes); // กำหนด prefix /v2
```

### `src/routes/v1/index.js` (โครงสร้าง V1)
```javascript
import { Router } from "express";
import { router as usersRoutes } from "./users.routes.js";
import { productsRoutes} from "./products.routes.js";

export const router = Router();

router.use("/users", usersRoutes); // /api/v1/users
router.use("/product", productsRoutes); // /api/v1/product
```

### `src/routes/v2/index.js` (โครงสร้าง V2)
```javascript
import { Router } from "express";
import { router as usersRoutes } from "./users.routes.js";

export const router = Router();

router.use("/users", usersRoutes); // /api/v2/users
```

---

## 4. สรุปผลการทำงาน
โปรเจกต์นี้มีโครงสร้างที่ชัดเจน แบ่งแยกเวอร์ชันของ API และประเภทของฐานข้อมูล ทำให้ง่ายต่อการเรียนรู้การเขียน Backend ที่มีทั้งระบบ Memory (V1) และระบบ Database จริง (V2) ซึ่งเป็นพื้นฐานสำคัญของการเป็น Full-stack Developer

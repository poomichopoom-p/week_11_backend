import { Router } from "express";
import { router as usersRoutes } from "./users.routes.js";
import { productsRoutes} from "./products.routes.js";

export const router = Router();

router.use("/users", usersRoutes);
router.use("/product",productsRoutes);


// router.use("/products", productssRoutes);
// router.use("/notes", notesRoutes);
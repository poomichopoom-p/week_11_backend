import { Router } from "express";
import { products } from "../../fakeData/fakeProduct.js";


export const productsRoutes = Router();

productsRoutes.get("/",(req,res) => {
    res.json(products);
});
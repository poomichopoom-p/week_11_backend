import mongoose from "mongoose";


const productSchema = new mongoose.Schema(
    {
        name:{type:String, required: true, trim: true},
        price:{type: String, required: true},
        brand:{type: String, required:true},
    }
)
import mongoose from "mongoose";

interface RestaurantInterface {
    restaurantName: string;
    city: string;
    country: string;
    deliveryTime: string;
    cuisines: string[];
    RestaurantBanner: string;
    user: mongoose.Schema.Types.ObjectId[]; // This indicates it's an array
    menus: mongoose.Schema.Types.ObjectId[]; // This indicates it's an array
}

const RestaurantSchema: mongoose.Schema<RestaurantInterface> = new mongoose.Schema({
    restaurantName: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    deliveryTime: {
        type: String,
        required: true,
    },
    cuisines: {
        type: [String],
        required: true,
    },
    RestaurantBanner: { // Fixed the spelling error here
        type: String,
        required: true,
    },
    user: [{ // Changed to an array
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
        required: true,
    }],
    menus: [{ // Changed to an array
        type: mongoose.Schema.Types.ObjectId,
        ref: "meun", // Make sure the ref matches your actual Menu model name        
    }]
}, { timestamps: true });

export default mongoose.model<RestaurantInterface>("Restaurant", RestaurantSchema); // Exporting with singular model name

import express, { Request, Response } from "express"
import Restaurant from "../Models/Restaurant";

interface CustomRequest extends Request {
    user?: {
        id: string;  // Define the specific type you expect for 'user.id'
        // Add other properties if needed
    };
}

export const RestaurantCreate = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const { restaurantName, city, country, deliveryTime, cuisines } = req.body;
        const userId = req.user?.id; // Assuming req.user is populated with user info after authentication

        // Check if the user has already created a restaurant
        const existingRestaurant = await Restaurant.findOne({ user: userId });
        if (existingRestaurant) {
            return res.status(400).json({ message: "You have already created a restaurant." });
        }

        // Create the new restaurant with the userId as a reference
        const newRestaurant = new Restaurant({
            restaurantName,
            city,
            country,
            deliveryTime,
            cuisines,
            user: userId, // user is now set as a single ObjectId
            imageUrl: "pp"
        });

        await newRestaurant.save();

        return res.status(200).json({
            message: "Restaurant created successfully",
            restaurant: newRestaurant,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }

}

//get Restaurant data 
export const GetRestaurantData = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user?.id
        const existingRestaurant = await Restaurant.findOne({ user: userId });
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error..." })
    }
}
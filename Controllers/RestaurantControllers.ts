import express, { Request, Response } from "express"
import Restaurant from "../Models/Restaurant";
import Order from "../Models/Order";

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

        if (!restaurantName || !city || !country || !deliveryTime || !cuisines) {
            return res.status(400).json({
                message: "Oops! It looks like some details are missing.😊"
            });
        }

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
            cuisines: JSON.parse(cuisines),
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
        if (!existingRestaurant) {
            return res.status(400).json({ message: "Restaurant Not Created..." })
        }
        return res.status(200).json(existingRestaurant)
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error..." })
    }
}

// Get All Restaurant Data
export const GetAllRestaurantData = async (req: Request, res: Response): Promise<any> => {
    try {
        const RestaurantData = await Restaurant.find()
        if (!RestaurantData) {
            return res.status(400).json({ message: "Restaurant Not Fount...." })
        }
        return res.status(200).json(RestaurantData)
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error..." })
    }
}

// Restaurant Updated Admin Or User 
export const RestaurantUpdate = async (req: Request, res: Response): Promise<any> => {
    try {
        const RestaurantId = req.params?.id
        const { restaurantName, city, country, deliveryTime, cuisines } = req.body;
        const RestaurantReq = { restaurantName, city, country, deliveryTime, cuisines }
        const RestaurantFind = await Restaurant.findById(RestaurantId)
        if (!RestaurantFind) {
            return res.status(400).json({ message: "Restaurant Not Found..." })
        }

        // if(!req.files){
        //     RestaurantFind.imageUrl = req.files
        // }
        RestaurantReq

        if (!restaurantName) RestaurantReq.restaurantName = RestaurantFind.restaurantName
        if (!deliveryTime) RestaurantReq.deliveryTime = RestaurantFind.deliveryTime
        if (!cuisines) RestaurantReq.cuisines = RestaurantFind.cuisines
        if (!country) RestaurantReq.country = RestaurantFind.country
        if (!city) RestaurantReq.city = RestaurantFind.city

        const RestaurantData = await Restaurant.findByIdAndUpdate(RestaurantId, RestaurantReq, { new: true });
        return res.status(200).json({ message: "Restaurant Updated Successfully...", RestaurantData })

    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error..." })
    }
}

// Get Order Data
export const GetRestaurantOrder = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const Restaurantdata = await Restaurant.findOne({ user: req.user?.id });
        if (!Restaurantdata) {
            return res.status(400).json({ message: "Restaurant Not Found..." })
        }
        const order = await Order.find({ restaurant: Restaurantdata._id }).populate("restaurant").populate("UserModel")
        if (!order) {
            return res.status(400).json({ message: "Order Not Found..." })
        }
        return res.status(200).json(order)
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error..." })
    }
}

//Status Update
export const statusUpdate = async (req: Request, res: Response): Promise<any> => {
    try {
        const OrderId = req.params.id
        const { status } = req.body
        const order = await Order.findById(OrderId)
        if (!order) {
            return res.status(400).json({ message: "Order Not Found..." })
        }
        order.status = status
        await order.save()
        return res.status(200).json({ message: "Order Status Update..." })
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error..." })
    }
}
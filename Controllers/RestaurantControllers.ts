import express, { Request, Response } from "express"
import Restaurant from "../Models/Restaurant";
import Order from "../Models/Order";
import UserModels from "../Models/UserModels";
import Menus from "../Models/Menus";

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

        if (!req.file) {
            return res.status(400).json({ message: "Restaurant Banner are missing.😊" })
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
            cuisines: cuisines.split(" "),
            user: userId, // user is now set as a single ObjectId
            RestaurantBanner: req.file?.originalname
        });

        await newRestaurant.save();

        return res.status(200).json({
            message: "Restaurant created successfully"
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
        const RestaurantData = await Restaurant.find().populate([
            { path: 'menus' },
        ]);

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
        const { restaurantName, city, country, deliveryTime, cuisines, RestaurantBanner } = req.body;
        const RestaurantReq = { restaurantName, city, country, deliveryTime, cuisines, RestaurantBanner }
        const RestaurantFind = await Restaurant.findById(RestaurantId)

        if (!RestaurantFind) {
            return res.status(400).json({ message: "Restaurant Not Found..." })
        }

        if (req.file) {
            RestaurantReq.RestaurantBanner = req.file?.originalname;
        } else {
            RestaurantReq.RestaurantBanner = RestaurantFind?.RestaurantBanner;
        }

        RestaurantReq.cuisines = RestaurantReq.cuisines.split(" ")

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

// Add to cart or increase quantity
export const AddToCartIncreaseQuantity = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const { productId } = req.body;
        const userId = req.user?.id
        // Find user cart
        let user = await UserModels.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const menuId = await Menus.findById(productId)
        if (!menuId) {
            return res.status(404).json({ error: "Menu not found" });
        }

        // Check if the product is already in the cart
        const itemIndex = user.items.findIndex(
            (item) => item.Menu.toString() === productId
        );

        if (itemIndex > -1) {
            // Product exists, increase quantity
            user.items[itemIndex].quantity += 1;
        } else {
            // Add new product to cart
            user.items.push({ Menu: productId, quantity: 1 });
        }

        await user.save();
        return res.status(200).json({ message: "Item added to cart", cart: user.items });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
};

// Decrease quantity or remove item
export const AddToCartDecreaseQuantity = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId, productId } = req.body;
        // Find user's cart
        const user = await UserModels.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the item in the cart
        const itemIndex = user.items.findIndex(
            (item) => item.Menu.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        // Decrease quantity or remove the item
        if (user.items[itemIndex].quantity > 1) {
            user.items[itemIndex].quantity -= 1;
        } else {
            user.items.splice(itemIndex, 1); // Remove item if quantity is 1
        }
        // Save the updated cart
        await user.save();

        return res.status(200).json({ message: 'Item quantity updated', cart: user.items });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
};

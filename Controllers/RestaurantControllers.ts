import express, { Request, Response } from "express"
import Restaurant from "../Models/Restaurant";
import Order from "../Models/Order";
import UserModels from "../Models/UserModels";
import Menus from "../Models/Menus";
import nodemailer from "nodemailer"
import { v2 as cloudinary } from 'cloudinary';

interface CustomRequest extends Request {
    user?: {
        id: string;  // Define the specific type you expect for 'user.id'
        // Add other properties if needed
    };
}

interface MulterFile {
    originalname: string;
    path: string;
    filename: string;
    mimetype: string;
    size: number;
    // Add other properties from Multer's File type if necessary
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

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
        const result = await cloudinary.uploader.upload(req.file!.path);
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
            RestaurantBanner: result.secure_url,
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
            { path: 'menus' }, { path: 'user' }
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
export const RestaurantUpdate = async (req: Request, res: Response): Promise<void> => {
    try {
        const RestaurantId = req.params?.id
        const { restaurantName, city, country, deliveryTime, cuisines, RestaurantBanner } = req.body;
        const RestaurantReq = { restaurantName, city, country, deliveryTime, cuisines, RestaurantBanner }
        const RestaurantFind = await Restaurant.findById(RestaurantId)

        if (!RestaurantFind) {
            res.status(400).json({ message: "Restaurant Not Found..." })
            return
        }

        type Files = {
            [fieldname: string]: MulterFile[];
        }

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file!.path);
            RestaurantReq.RestaurantBanner = result.secure_url
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
        res.status(200).json({ message: "Restaurant Updated Successfully...", RestaurantData })
        return

    } catch (error) {
        console.log(error);
        res.status(501).json({ message: "Internal Server Error..." })
        return
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
export const statusUpdate = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const OrderId = req.params.id
        const user = await UserModels.findById(req?.user?.id)
        const { status, menuID } = req.body
        const order = await Order.findById(OrderId)

        if (!order) {
            res.status(400).json({ message: "Order Not Found..." })
            return
        }
        order.MenuItemsList.forEach((val) => {
            if (val.menuId == menuID) {
                val.status = status;
            }
        });

        // Set up the email transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            secure: true,
            port: Number(process.env.NODEMAILER_PORT) || 465,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        const info = await transporter.sendMail({
            from: process.env.FROM,
            to: user?.email || "pradipjedhe69@gmail.com", // Send the email to the user's email
            subject: "Menu Details and User Information from CraveCourier!", // Subject line
            text: `Hello ${user?.name}, 
            
        Here are the details:
        
        Menu Status: ${status}
        Menu ID: ${menuID}
        
        User Information:
        Name: ${user?.name}
        Email: ${user?.email}
        
        Thank you for choosing CraveCourier. We're here to provide the best service!`, // Fallback text
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: black; text-align: center;">Menu Details and User Information from CraveCourier!</h2>
                    <p>Hi ${user?.name},</p>
                    <p>Thank you for choosing CraveCourier. We're excited to share the details with you:</p>
                    
                    <h3 style="margin-top: 30px; color: #333;">Menu Information:</h3>
                    <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px;">
                        <p><strong>Menu Status:</strong> ${status}</p>
                        <p><strong>Menu ID:</strong> ${menuID}</p>
                    </div>
                    
                    <h3 style="margin-top: 30px; color: #333;">User Information:</h3>
                    <div style="background-color: #f4f4f4; padding: 10px; border-radius: 5px;">
                        <p><strong>Name:</strong> ${user?.name}</p>
                        <p><strong>Email:</strong> ${user?.email}</p>
                     
                    </div>
                    
                    <p style="margin-top: 30px;">Feel free to explore the menu and place your first order!</p>
                    
                    <p>Best regards,<br/> The CraveCourier Team</p>
                    
                    <p style="font-size: 12px; color: #888; margin-top: 20px;">If you have any questions, please contact us at support@yourcompany.com.</p>
                </div>
            `,
        });

        await order.save();
        res.status(200).json({ message: "Order Status Update..." })
        return
    } catch (error) {
        console.log(error);
        res.status(501).json({ message: "Internal Server Error..." })
        return
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
            return res.status(404).json({ message: "User not found" });
        }

        const menuId = await Menus.findById(productId)
        if (!menuId) {
            return res.status(404).json({ message: "Menu not found" });
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
        return res.status(500).json({ message: "Server error" });
    }
};

// Decrease quantity or remove item
export const AddToCartDecreaseQuantity = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const { productId } = req.body;
        const userId = req.user?.id
        // Find user's cart
        const user = await UserModels.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the item in the cart
        const itemIndex = user.items.findIndex(
            (item) => item.Menu.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (user.items[itemIndex].quantity > 1) {
            user.items[itemIndex].quantity -= 1;
        } else {
            user.items.splice(itemIndex, 1);
        }
        // Save the updated cart
        await user.save();

        return res.status(200).json({ message: 'Item quantity updated', cart: user.items });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const RemoveToaddToCart = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const menuId = req.params.id;
        const userId = req.user?.id;

        const menu = await Menus.findById(menuId);
        if (!menu) {
            return res.status(400).json({ message: "Menu not found" });
        }

        const userdata = await UserModels.findById(userId);
        if (!userdata) {
            return res.status(400).json({ message: "User not found" });
        }

        userdata.items = userdata.items.filter((val) => val.Menu.toString() !== menuId)
        await userdata.save();
        return res.status(200).json({ message: "Item removed from cart successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const ClearAllAddToCart = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const UserId = req.user?.id;

        const user = await UserModels.findById(UserId);
        if (!user) {
            return res.status(400).json({ message: "User Not Found..." });
        }

        // Clear the user's items
        user.items = [];

        await user.save();

        return res.status(200).json({ message: "All items cleared successfully." });
    } catch (error) {
        console.error(error);
        return res.status(501).json({ message: "Internal Server Error." });
    }
};


export const AdminDeleteTheRestaurant = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const RestaurantID = req.params.ID;
        // Find the Restaurant by ID
        const RestaurantFind = await Restaurant.findById(RestaurantID);
        if (!RestaurantFind) {
            return res.status(400).json({ message: "Restaurant not found." });
        }

        // Delete the Restaurant
        await Restaurant.findByIdAndDelete(RestaurantID);
        return res.status(200).json({ message: "Restaurant deleted successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
};
import { Request, Response } from "express";
import MenusModels from "../Models/Menus";
import Restaurant from "../Models/Restaurant";
import mongoose from "mongoose";
import { error } from "console";
import path from "path";

interface CustomRequest extends Request {
    user?: {
        id: string;  // Define the specific type you expect for 'user.id'
        // Add other properties if needed
    };
}

export const MenuCreated = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const { name, description, price } = req.body;
        const userId = req.user?.id
        console.log(userId);
        const Restaurantdata = await Restaurant.findOne({ user: userId });
        console.log(Restaurantdata);

        if (!Restaurantdata) {
            return res.status(400).json({
                message: "Something went wrong, and we couldn’t create your any restaurant!"
            });

        }
        if (!name || !description || !price) {
            return res.status(400).json({
                message: "Oops! It looks like some details are missing.😊"
            });
        }

        const MenuData = new MenusModels({
            name,
            description,
            price,
            menuPictuer: "URL",
            restaurantId: Restaurantdata?._id
        })

        await MenuData.save()

        if (Restaurantdata) {
            Restaurantdata.menus.push(MenuData.id)
            await Restaurantdata.save();
        }

        return res.status(200).json({ message: "Mune Created Successfully..." })
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error..." })
    }
}

//User Clicked the view Menu button to show the menu data 
export const GetMenuData = async (req: Request, res: Response): Promise<any> => {
    try {
        const RestaurantId = req.params.id
        const menu = await Restaurant.findById(RestaurantId).populate({ path: "menus" })
        console.log("menu :", menu);
        if (!menu) {
            return res.status(400).json({ message: "Menu not fount..." })
        }

        return res.status(200).json(menu)

    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error..." })
    }
}
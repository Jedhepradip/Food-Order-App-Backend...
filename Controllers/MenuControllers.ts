import { Request, Response } from "express";
import MenusModels from "../Models/Menus";
import Restaurant from "../Models/Restaurant";
import mongoose from "mongoose";

interface CustomRequest extends Request {
    user?: {
        id: string;  // Define the specific type you expect for 'user.id'
        // Add other properties if needed
    };
}

export const MenuCreated = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const { name, description, price, menuPictuer } = req.body;
        const userId = req.user?.id
        const Restaurantdata = await Restaurant.findOne({ user: userId });
        if (!Restaurantdata) {
            return res.status(400).json({
                message: "Something went wrong, and we couldn’t create your any restaurant!"
            });

        }
        if (!name || !description || !price || !menuPictuer) {
            return res.status(400).json({
                message: "Oops! It looks like some details are missing.😊"
            });
        }

        const MenuData = new MenusModels({
            name,
            description,
            price,
            menuPictuer,
            restaurantId: Restaurantdata?._id
        })
        await MenuData.save()
        if (Restaurantdata) {
            Restaurantdata.menus.push(new mongoose.Schema.Types.ObjectId(String(MenuData._id)));
            await Restaurantdata.save()
        }

        return res.status(200).json({ message: "Mune Created Successfully..." })
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error..." })
    }
}
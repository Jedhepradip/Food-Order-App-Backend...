import { Request, Response } from "express";
import MenusModels from "../Models/Menus";
import Restaurant from "../Models/Restaurant";

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
        const Restaurantdata = await Restaurant.findOne({ user: userId });

        if (!Restaurantdata) {
            return res.status(400).json({
                message: "Something went wrong, and we couldn’t create your any restaurant!"
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Menu Pictuer are missing.😊" })
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
            menuPictuer: req.file?.originalname,
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
        if (!menu) {
            return res.status(400).json({ message: "Menu not fount..." })
        }
        return res.status(200).json(menu)
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error..." })
    }
}

//Get the data to create the login user menu to show the frontend
export const GetLoginUser = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const UserId = req.user?.id
        const Restaurantdata = await Restaurant.findOne({ user: UserId })
            .populate({ path: "menus" })

        // .populate({
        //     path: "menus", // Populate the `menus` field
        //     populate: {
        //         path: "restaurantId", // Populate `restaurantId` within the populated `menus`
        //     },
        // })

        if (!Restaurantdata) {
            return res.status(400).json({ message: "Not Created the Any Restaurant Menus..." })
        }
        return res.status(200).json(Restaurantdata)
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error..." })
    }
}

//User or Admin All Edit this menu 
export const MenuUpdate = async (req: Request, res: Response): Promise<any> => {
    try {
        const menuId = req.params.id
        const { name, description, price, menuPictuer } = req.body
        const menubody = { name, description, price, menuPictuer }
        const menu = await MenusModels.findById(menuId)

        if (!menu) {
            return res.status(400).json({ message: "Menu Is Not Found..." })
        }

        if (req.file) {
            menubody.menuPictuer = req.file?.originalname
        }
        else {
            menubody.menuPictuer = menu.menuPictuer
        }

        if (!name) menubody.name = menu.name
        if (!description) menubody.description = menu.description
        if (!price) menubody.price = menu.price
        const MenuData = await MenusModels.findByIdAndUpdate(menuId, menubody, { new: true });

        return res.status(200).json({ message: "Menu Updated Successfully...", MenuData })

    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error..." })
    }
}
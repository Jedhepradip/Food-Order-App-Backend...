import { Request, Response } from "express";
import Stripe from "stripe";
import nodemailer from "nodemailer"
import UserModels from "../Models/UserModels";
import Menus from "../Models/Menus";
import Order from "../Models/Order";
import { log } from "console";

interface CustomRequest extends Request {
    user?: {
        id: string;
    };
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: '2024-09-30.acacia',
});

export const OrderToMenuPayment = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const { email, name, country, address, expiry, cvc, MenuItem, restaurantId, MenuID } = req.body;

        if (!email || !name || !country || !address || !expiry || !cvc || !MenuItem) {
            return res.status(400).json({ message: "Invalid MenuItem data" });
        }

        const calculateItemTotal = (price: number, quantity: number) => price * quantity;
        const calculateTotal = (): number => {
            const total = MenuItem?.reduce(
                (sum: number, item: { Menu: { price: number }; quantity: number }) =>
                    sum + calculateItemTotal(item.Menu.price, item.quantity),
                0
            );
            return total;
        };

        const totalAmountInPaise = Math.round(calculateTotal() * 100);
        if (totalAmountInPaise < 5000) {
            return res.status(400).json({
                message: "Order total is too low to process payment.",
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmountInPaise,
            currency: "inr",
            payment_method_types: ["card"],
            metadata: {
                menuItems: MenuID,
            },
        });
        const user = await UserModels.findById(req.user?.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const MenuItemsdata = await Menus.findById(MenuID)
        if (!MenuItemsdata) {
            return res.status(404).json({ message: "Menu items not found" });
        }

        const OrderPayment = new Order({
            user: req.user?.id,
            totalAmount: totalAmountInPaise / 100,
            restaurant: restaurantId,
            deliveryDetails: {
                email,
                name: user?.name,
                address,
                country: user?.country,
                expiry,
                cvc,
            },
            MenuItemsList: MenuItem?.map((val: any) => ({
                menuId: val?.Menu?._id,
                name: val?.Menu?.name,
                price: val?.Menu?.price,
                Quantity: val?.quantity,
                image: val?.Menu?.menuPictuer,
                description: val?.Menu?.description,
                status: "Pending",
            })),
        });

        await OrderPayment.save();
        return res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        return res.status(500).json({ message: "Internal Server Error..." });
    }
};

export const UserOrderMenuItmesGetData = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const UserID = req.user?.id;
        if (!UserID) {
            return res.status(401).json({ message: "Unauthorized: User ID not found" });
        }

        const user = await UserModels.findById(UserID);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const OrderMenuData = await Order.find({ user: UserID })
            .populate({ path: "user", model: "UserModel", select: "name email" })
            .populate({ path: "restaurant", model: "Restaurant", select: "name address" });

        console.log("Order Data for User:", OrderMenuData);
        return res.status(200).json(OrderMenuData);
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const AllOrderDataShow = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const OrderAll = await Order.find()
        if (!OrderAll) {
            return res.status(400).json({ message: "Order is Not Find..." })
        }
        return res.status(200).json(OrderAll)
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
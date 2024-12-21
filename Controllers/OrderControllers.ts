import { Request, Response } from "express";
import Stripe from "stripe";
import nodemailer from "nodemailer"
import UserModels from "../Models/UserModels";
import Menus from "../Models/Menus";
import Order from "../Models/Order";
import Restaurant from "../Models/Restaurant";
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
        console.log("Menu Data :", req.body);
        const { name, description, price, menuPicture, restaurantId, MenuId, quantity } = req.body;

        if (!description || !name || !price || !menuPicture || !restaurantId || !MenuId || quantity) {
            return res.status(400).json({ message: "Invalid MenuItem data" });
        }       

        console.log("pradip ");
        
        const lineItems = ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: name,
                    description: description,
                },
                unit_amount: price * 100, // Stripe requires price in the smallest currency unit (e.g., paise for INR)
            },
            quantity: quantity, // Set the quantity for each product
            menuPicture: menuPicture, // Not part of Stripe's line items but retained for custom handling if needed
        })

        console.log("Pradip  Jedhe :", lineItems);



        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: "http://localhost:5173/OrderPage",
            cancel_url: "http://localhost:5173/CancelPaymentPage"
        })

        // const calculateItemTotal = (price: number, quantity: number) => price * quantity;
        // const calculateTotal = (): number => {
        //     const total = MenuItem?.reduce(
        //         (sum: number, item: { Menu: { price: number }; quantity: number }) =>
        //             sum + calculateItemTotal(item.Menu.price, item.quantity),
        //         0
        //     );
        //     return total;

        // };

        // const totalAmountInPaise = Math.round(calculateTotal() * 100);
        // if (totalAmountInPaise < 5000) {
        //     return res.status(400).json({
        //         message: "Order total is too low to process payment.",
        //     });
        // }

        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: totalAmountInPaise,
        //     currency: "inr",
        //     payment_method_types: ["card"],
        //     metadata: {
        //         menuItems: MenuID,
        //     },
        // });
        // const user = await UserModels.findById(req.user?.id);
        // if (!user) {
        //     return res.status(404).json({ message: "User not found" });
        // }
        // const MenuItemsdata = await Menus.findById(MenuID)
        // if (!MenuItemsdata) {
        //     return res.status(404).json({ message: "Menu items not found" });
        // }

        // const restaurantData = await Restaurant.findById(restaurantId)
        // if (!restaurantData) {
        //     return res.status(400).json({ message: "Restaurant Not Found..." })
        // }

        // const OrderPayment = new Order({
        //     user: req.user?.id,
        //     totalAmount: totalAmountInPaise / 100,
        //     restaurant: restaurantId,
        //     deliveryDetails: {
        //         email,
        //         name: user?.name,
        //         address,
        //         country: user?.country,
        //         expiry,
        //         cvc,
        //     },
        //     MenuItemsList: MenuItem?.map((val: any) => ({
        //         menuId: val?.Menu?._id,
        //         name: val?.Menu?.name,
        //         price: val?.Menu?.price,
        //         Quantity: val?.quantity,
        //         image: val?.Menu?.menuPictuer,
        //         description: val?.Menu?.description,
        //         status: "Pending",
        //     })),
        // });

        // const transporter = nodemailer.createTransport({
        //     host: 'smtp.gmail.com',
        //     secure: true,
        //     port: Number(process.env.NODEMAILER_PORT) || 465,
        //     auth: {
        //         user: process.env.USER,
        //         pass: process.env.PASS,
        //     },
        // });

        // const orderId = OrderPayment._id;
        // const orderDate = new Date();
        // const menuName = MenuItem[0]?.Menu?.name;
        // const menuPrice = MenuItem[0]?.Menu?.price;
        // const restaurantName = restaurantData.restaurantName;
        // const totalPrice = totalAmountInPaise / 100;
        // const companyName = "CraveCourier";
        // const orderStatus = "Pending";
        // const userLocation = user.address
        // const deliveryTimeToRestaurant: number = parseFloat(restaurantData.deliveryTime);
        // const estimatedDeliveryDate = new Date(orderDate.getTime() + deliveryTimeToRestaurant * 60000);
        // const estimatedDeliveryTime = estimatedDeliveryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // const info = await transporter.sendMail({
        //     from: process.env.FROM,
        //     to: user.email, // Send the email to the user
        //     subject: `Order Confirmation - ${companyName}`, // Subject line
        //     text: `Thank you for your order at ${companyName}!\n\n
        //            Order ID: ${orderId}\n
        //            Menu: ${menuName}\n
        //            Price: $${menuPrice.toFixed(2)}\n
        //            Restaurant: ${restaurantName}\n
        //            Total: $${totalPrice.toFixed(2)}\n
        //            Order Date: ${orderDate.toLocaleDateString()} ${orderDate.toLocaleTimeString()}\n
        //            Order Status: ${orderStatus}\n
        //            Delivery Location: ${userLocation}\n
        //            Restaurant to Delivery Location: ${deliveryTimeToRestaurant}\n
        //            Estimated Delivery Time: ${estimatedDeliveryTime}\n\n
        //            We're excited to prepare your meal!`,
        //     html: `
        //         <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        //             <h2 style="color: black; text-align:center;">Thank You For Your Order At ${companyName}!</h2>
        //             <p>Hi ${name},</p>
        //             <p>Your order has been successfully placed. Below are the details of your order:</p>

        //             <h3 style="margin-top: 20px; color: #333;">Order Summary:</h3>
        //             <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px;">
        //                 <p><strong>Order ID:</strong> ${orderId}</p>
        //                 <p><strong>Menu:</strong> ${menuName}</p>
        //                 <p><strong>Price:</strong> $${menuPrice.toFixed(2)}</p>
        //                 <p><strong>Restaurant:</strong> ${restaurantName}</p>
        //                 <p><strong>Total:</strong> $${totalPrice.toFixed(2)}</p>
        //                 <p><strong>Order Date:</strong> ${orderDate.toLocaleDateString()} ${orderDate.toLocaleTimeString()}</p>
        //                 <p><strong>Order Status:</strong> <span style="color: #007BFF;">${orderStatus}</span></p>
        //                 <p><strong>Delivery Location:</strong> ${userLocation}</p>
        //                 <p><strong>Restaurant to Delivery Location:</strong> ${deliveryTimeToRestaurant}</p>
        //                 <p><strong>Estimated Delivery Time:</strong> <span style="color: green;">${estimatedDeliveryTime}</span></p>
        //             </div>

        //             <p style="margin-top: 30px;">We’re excited to prepare your meal and deliver it to you soon. If you have any questions or special requests, feel free to contact us!</p>

        //             <p>Best regards,<br/> The ${companyName} Team</p>

        //             <p style="font-size: 12px; color: #888; margin-top: 20px;">If you have any questions, please contact us at support@yourcompany.com.</p>
        //         </div>
        //     `,
        // });

        // await OrderPayment.save();
        // return res.status(200).json({ clientSecret: paymentIntent.client_secret });
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
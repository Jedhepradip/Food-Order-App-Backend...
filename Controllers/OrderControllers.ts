import { Request, Response } from "express";
import Stripe from "stripe";
import nodemailer from "nodemailer"
import UserModels from "../Models/UserModels";
import Menus from "../Models/Menus";
import Order from "../Models/Order";

interface CustomRequest extends Request {
    user?: {
        id: string;  // Define the specific type you expect for 'user.id'
        // Add other properties if needed
    };
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: '2024-09-30.acacia',
});


export const OrderToMenuPayment = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        console.log("Order Payments :", req.body);
        const { email, name, country, address, expiry, cvc, MenuItem } = req.body

        const calculateItemTotal = (price: number, quantity: number) => price * quantity;
        const calculateTotal = () => {
            return MenuItem?.items?.reduce((total: number, item: { Menu: { price: number; }; quantity: number; }) =>
                total + calculateItemTotal(item.Menu.price, item.quantity), 0);
        };

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(calculateTotal()), // Amount in smallest currency unit (e.g., paise)
            currency: 'inr',
            payment_method_types: ['card'],
            metadata: MenuItem.items.map((val: any) => val.Menu._id), // Attach metadata to track which course the payment is for
        });

        const user = await UserModels.findById(req.user?.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const MenuItems = await Menus.find({
            '_id': { $in: MenuItem.items.map((val: any) => val.Menu._id) }
        });

        if (!MenuItems) {
            return res.status(404).json({ message: 'MenuItmen not found' });
        }
console.log("MenuItems MenuItems",MenuItems);

        const OrderPayment = new Order({          
            status: "Pending",
            userId: req.user?.id,
            totalAmount: calculateTotal(),
            restaurant: MenuItem.items.map((val: any) => val.Menu.restaurantId),
            deliveryDetails: {
                email,
                name,
                address,
                country,
                expiry,
                cvc,
            },
            MenuItemsList: [
                menuId,
                name,
                Image,
                price,
                Quantity,
            ]

        })

        await OrderPayment.save()

        // const transporter = nodemailer.createTransport({
        //     host: 'smtp.gmail.com',
        //     secure: true,
        //     port: Number(process.env.NODEMAILER_PORT) || 465,
        //     auth: {
        //         user: process.env.USER,
        //         pass: process.env.PASS,
        //     },
        // });

        // Send OTP email
        // const info = await transporter.sendMail({
        //     from: process.env.FROM,
        //     to: "pradipjedhe69@gmail.com", // Send the email to the user
        //     subject: "Payment Confirmation", // Update the subject to reflect payment success
        //     text: `Your payment for ${Rooms.title} was successful. The total amount paid is $${Rooms.discountPrice}.`, // Fallback text
        //     html: `
        //        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        //             <h2 style="color: black; text-align: center;">Payment Confirmation</h2>

        //             <p>We are happy to confirm that your payment for the product <strong>${Rooms.title}</strong> was successful!</p>

        //             <div style="background-color: #f4f4f4; padding: 10px 20px; border-radius: 8px; font-size: 18px; font-weight: bold; text-align: center; max-width: 300px; margin: auto;">
        //                 Total Paid: $${Rooms.discountPrice}
        //             </div>

        //             <h3 style="margin-top: 30px; color: #333;">Payment Details:</h3>
        //             <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px;">
        //                 <p><strong>Product Title:</strong> ${Rooms.title}</p>
        //                 <p><strong>Total Paid:</strong> $${Rooms.discountPrice}</p>
        //                 <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        //                 <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
        //             </div>

        //             <p style="margin-top: 30px;">Thank you for your payment and for using our service. If you have any questions or concerns, feel free to contact our support team.</p>

        //             <p>Best regards, <br/> The Support Team</p>

        //             <p style="font-size: 12px; color: #888; margin-top: 20px;">If you did not make this payment, please contact us immediately at support@yourcompany.com.</p>
        //         </div>
        //     `,
        // });
        return res.status(200).json("");
        // res.status(200).json({ clientSecret: paymentIntent.client_secret });

    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: 'Unable to create payment intent' });
    }
}
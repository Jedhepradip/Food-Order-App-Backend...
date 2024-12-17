import { Response, Request } from "express";
import PaymentRestaurantModel from "../Models/PaymentRestaurant";
import nodemailer from "nodemailer";
import Stripe from "stripe";

// Fix CustomRequest interface
interface CustomRequest extends Request {
    user?: {
        id: string;
    };
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    // apiVersion: "2024-09-30",
    apiVersion: '2024-09-30.acacia',
});

export const PaymentRestaurant = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const userID = req.user?.id;
        const { totaleAmount } = req.body

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totaleAmount, // Example amount: $50.00 in the smallest unit (cents)
            currency: "inr",
            payment_method_types: ["card"],
            metadata: {
                userID: userID || "unknown", // Use "unknown" as a fallback value
            },
        });

        // Nodemailer Transporter
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            secure: true,
            port: Number(process.env.NODEMAILER_PORT) || 465,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        // Example Email Send (optional)
        await transporter.sendMail({
            from: process.env.FROM,
            to: "user@example.com", // Replace with user email
            subject: "Order Confirmation",
            text: `Your payment of INR 5000 was successful.`,
        });

        res.status(200).json({
            message: "Payment processed successfully", clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const PaymentGetAllData = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const userID = req.user?.id;        
        const userPayments = await PaymentRestaurantModel.find({ user: userID })
            .populate({ path: "user", select: "name email" });
            console.log("userPayments :",userPayments);
            
        res.status(200).json(userPayments);
        return
    } catch (error) {
        console.error("Error fetching payment data:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

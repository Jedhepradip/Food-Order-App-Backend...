import { Response, Request } from "express";
import PaymentRestaurantModel from "../Models/PaymentRestaurant";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import UserModels from "../Models/UserModels";

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
        const userdata = await UserModels.findById(userID)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totaleAmount, // Example amount: $50.00 in the smallest unit (cents)
            currency: "inr",
            payment_method_types: ["card"],
            metadata: {
                userID: userID || "unknown", // Use "unknown" as a fallback value
            },
        });

        const paymenttorestaurent = new PaymentRestaurantModel({
            totaleAmount,
            user: req.user?.id
        })

        await paymenttorestaurent.save()
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
            to: userdata?.email, // Replace with user email
            subject: "Payment Confirmation To CraveCouries.com",
            text: `
            Dear ${userdata?.name},
        
            We are pleased to inform you that your payment of INR 50000 has been successfully processed. Thank you for choosing CraveCouries!
        
            Here are your order details:
            --------------------------------
            Name: ${userdata?.name}
            Email: ${userdata?.email}
            Address: ${userdata?.address}  // Add address if available
            Total Amount: INR 50000
            Payment ID: ${paymenttorestaurent._id}  // Assuming you have the payment ID
            Date of Payment: ${new Date().toLocaleString()}  // Payment date and time
        
            Your order will be processed immediately, and you can expect delivery within the next few hours. Please keep your order details handy for reference.
        
            We are excited to serve you the finest meals from our restaurant, CraveCouries. Our chefs are preparing your order with the highest quality ingredients, ensuring an unforgettable dining experience. Here are a few things to know:
            
            - Our operating hours are from 9:00 AM to 10:00 PM, seven days a week.
            - You can view our full menu and more details on our website at www.cravecouries.com.
            - For any queries or further assistance, you can contact us directly at support@cravecouries.com or call our customer service at +91 1234567890.
        
            We hope to make your meal experience memorable, and we truly appreciate your support. Thank you once again for choosing CraveCouries.
        
            Warm regards,
            The CraveCouries Team
        
            PS: Don't forget to follow us on social media for special offers and updates! You can find us on Instagram, Facebook, and Twitter at @CraveCouries.
            `
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
        if (!userID) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const userPayments = await PaymentRestaurantModel.find({ user: userID })
            .populate({ path: "user", select: "name email" });

        res.status(200).json(userPayments);
    } catch (error) {
        console.error("Error fetching payment data:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


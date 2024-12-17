import mongoose, { Schema, Document } from "mongoose";

// Interface for TypeScript
export interface IPaymentRestaurant extends Document {
    user: mongoose.Types.ObjectId[]; // Array of referenced User IDs
    totaleAmount: number;            // Total payment amount
}

const PaymentRestaurantSchema: mongoose.Schema<IPaymentRestaurant> = new mongoose.Schema(
    {
        user: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "UserModel",
                required: true,
            },
        ],
        totaleAmount: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

export default mongoose.model<IPaymentRestaurant>(
    "PaymentRestaurant",
    PaymentRestaurantSchema
);

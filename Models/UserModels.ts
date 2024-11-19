import mongoose from "mongoose";

interface CartItem {
    Menu: mongoose.Schema.Types.ObjectId[],
    quantity: number
}

interface UserModelInterfase extends Document {
    items: CartItem[],
    city: string,
    name: string,
    email: string,
    contact: string,
    address: string,
    country: string,
    password: string,
    resetToken: string,
    profilePictuer: string,
    resetTokenExpiration: number
}
const UserData: mongoose.Schema<UserModelInterfase> = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    contact: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    country: {
        type: String,
    },
    profilePictuer: {
        type: String,
    },
    resetToken: {
        type: String
    },
    resetTokenExpiration: {
        type: Number
    },
    items: [
        {
            Menu: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "meun",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
        },
    ],
}, { timestamps: true })

export default mongoose.model("UserModel", UserData)
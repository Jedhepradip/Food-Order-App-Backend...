import mongoose from "mongoose";

interface menu {
    restaurantId: mongoose.Schema.Types.ObjectId[],
    name: string,
    description: string,
    price: number,
    menuPictuer: string
}
const MenuSchema: mongoose.Schema<menu> = new mongoose.Schema({
    restaurantId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    }],
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    menuPictuer: {
        type: String,
        required: true,
    }
}, { timestamps: true })

export default mongoose.model<menu>("meun", MenuSchema)
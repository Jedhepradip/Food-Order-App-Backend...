import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import UserRouter from "./Router/UserRouter";
import Restaurant from "./Router/RestaurantRouter"
import { connectDB } from "./Database/db";

dotenv.config();
const app = express();

connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");
});

app.use("/api-user", UserRouter);
app.use("/api-restaurant", Restaurant)

app.listen(process.env.PORT, (): void => {
    console.log(`Server Running On http://localhost:${process.env.PORT}`);
});

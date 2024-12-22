import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import Meun from "./Router/MenuRouter"
import Order from "./Router/OrderRouter"
import UserRouter from "./Router/UserRouter";
import Restaurant from "./Router/RestaurantRouter"
import RestaurantPayment from "./Router/RestaurantRouter"

import { connectDB } from "./Database/db";

const app = express();

connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"))

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");
});

app.use("/api-Meun", Meun)
app.use("/api-Order", Order)
app.use("/api-user", UserRouter);
app.use("/api-restaurant", Restaurant)
app.use("/api-Payment/restaurant", RestaurantPayment);

app.listen(process.env.PORT, (): void => {
    console.log(`Server Running On http://localhost:${process.env.PORT}`);
});

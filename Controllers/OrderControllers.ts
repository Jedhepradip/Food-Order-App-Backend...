import { Request, Response } from "express";

export const OrderToMenu = async (req: Request, res: Response): Promise<any> => {
    try {
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
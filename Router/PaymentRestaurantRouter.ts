import express from "express"
import { jwtMiddleware } from "../Middewares/jwtAuthMiddleware"
import { PaymentRestaurant, PaymentGetAllData } from "../Controllers/PaymentRestaurantControllers"
const router = express.Router()

router.post("/Payment/Restaurant/User", jwtMiddleware, PaymentRestaurant)
router.get("/Payment/Get/Info", jwtMiddleware, PaymentGetAllData)

export default router;
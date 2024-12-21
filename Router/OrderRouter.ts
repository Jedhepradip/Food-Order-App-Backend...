import express from "express"
import { jwtMiddleware } from "../Middewares/jwtAuthMiddleware"
import { upload } from "../Middewares/Multer middleware"
import { OrderToMenuPayment, UserOrderMenuItmesGetData, AllOrderDataShow, Paymentheck } from "../Controllers/OrderControllers"
const router = express.Router()

router.post("/OrderTo/Menu/Payment", jwtMiddleware, OrderToMenuPayment)
router.get("/Order/data/get", jwtMiddleware, UserOrderMenuItmesGetData)
router.get("/All/Order/Data", jwtMiddleware, AllOrderDataShow)
router.get("/api/payment-status/:sessionId",jwtMiddleware,Paymentheck)

export default router;
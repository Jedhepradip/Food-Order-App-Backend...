import express from "express"
import { jwtMiddleware } from "../Middewares/jwtAuthMiddleware"
import { upload } from "../Middewares/Multer middleware"
import { OrderToMenuPayment } from "../Controllers/OrderControllers"
const router = express.Router()

router.post("/OrderTo/Menu/Payment", jwtMiddleware, OrderToMenuPayment)

export default router;
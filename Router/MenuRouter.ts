import express from "express"
import { jwtMiddleware } from "../Middewares/jwtAuthMiddleware"
import { MenuCreated } from "../Controllers/MenuControllers"
const router = express.Router()

router.post("/Meun/Created/User", jwtMiddleware, MenuCreated)

export default router;
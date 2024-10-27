import express from "express"
import { jwtMiddleware } from "../Middewares/jwtAuthMiddleware"
import { GetMenuData, MenuCreated } from "../Controllers/MenuControllers"
const router = express.Router()

router.post("/Created/Meun", jwtMiddleware, MenuCreated)
router.get("/Get/Menu/Data/:id", jwtMiddleware, GetMenuData)

export default router;
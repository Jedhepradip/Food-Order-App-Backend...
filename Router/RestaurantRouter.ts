import express from "express"
const router = express.Router()
import { RestaurantCreate } from "../Controllers/RestaurantControllers"
import { jwtMiddleware } from "../Middewares/jwtAuthMiddleware"

router.post("/Create/Restaurant/User", jwtMiddleware, RestaurantCreate)

export default router
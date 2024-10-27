import express from "express"
const router = express.Router()
import { RestaurantCreate, GetRestaurantData, GetAllRestaurantData, RestaurantUpdate, GetRestaurantOrder } from "../Controllers/RestaurantControllers"
import { jwtMiddleware } from "../Middewares/jwtAuthMiddleware"

router.post("/Create/Restaurant/User", jwtMiddleware, RestaurantCreate)
router.get("/Get/Restaurant/Data", jwtMiddleware, GetRestaurantData)
router.get("/Get/RestaurantData/AllUser", jwtMiddleware, GetAllRestaurantData)
router.put("/Restaurant/Updated/:id", jwtMiddleware, RestaurantUpdate)
router.get("/Restaurant/Order", jwtMiddleware, GetRestaurantOrder)

export default router
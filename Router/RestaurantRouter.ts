import express from "express"
const router = express.Router()
import { RestaurantCreate, GetRestaurantData, GetAllRestaurantData, RestaurantUpdate, GetRestaurantOrder, statusUpdate } from "../Controllers/RestaurantControllers"
import { jwtMiddleware } from "../Middewares/jwtAuthMiddleware"
import { upload } from "../Middewares/Multer middleware"

router.post("/Create/Restaurant/User", jwtMiddleware, upload.single("RestaurantBanner"), RestaurantCreate)
router.get("/Get/Restaurant/Data", jwtMiddleware, GetRestaurantData)
router.get("/Get/RestaurantData/AllUser", jwtMiddleware, GetAllRestaurantData)
router.put("/Restaurant/Updated/:id", jwtMiddleware, RestaurantUpdate)
router.get("/Restaurant/Order", jwtMiddleware, GetRestaurantOrder)
router.put("/Status/Update", jwtMiddleware, statusUpdate)
export default router
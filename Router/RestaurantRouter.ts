import express from "express"
const router = express.Router()
import { RestaurantCreate, GetRestaurantData, GetAllRestaurantData, RestaurantUpdate, GetRestaurantOrder, statusUpdate, AddToCartDecreaseQuantity, AddToCartIncreaseQuantity, RemoveToaddToCart, ClearAllAddToCart, AdminDeleteTheRestaurant } from "../Controllers/RestaurantControllers"
import { jwtMiddleware } from "../Middewares/jwtAuthMiddleware"
import { upload } from "../Middewares/Multer middleware"

router.put("/Status/Update/:id", jwtMiddleware, statusUpdate)
router.get("/Restaurant/Order", jwtMiddleware, GetRestaurantOrder)
router.get("/Get/Restaurant/Data", jwtMiddleware, GetRestaurantData)
router.delete("/ClearAll/AddToCart", jwtMiddleware, ClearAllAddToCart)
router.get("/Get/RestaurantData/AllUser", jwtMiddleware, GetAllRestaurantData)
router.put("/AddToCart/Remove/MenuItems/:id", jwtMiddleware, RemoveToaddToCart)
router.put("/Admin/Delete/Restaurant/:ID", jwtMiddleware, AdminDeleteTheRestaurant)
router.post("/AddToCart/Increase/Quantity", jwtMiddleware, AddToCartIncreaseQuantity)
router.post("/AddToCart/Decrease/Quantity", jwtMiddleware, AddToCartDecreaseQuantity)
router.put("/Restaurant/Updated/:id", jwtMiddleware, upload.single("RestaurantBanner"), RestaurantUpdate)
router.post("/Create/Restaurant/User", jwtMiddleware, upload.single("RestaurantBanner"), RestaurantCreate)

export default router
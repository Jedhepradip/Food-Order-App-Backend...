import express from "express"
import { jwtMiddleware } from "../Middewares/jwtAuthMiddleware"
import { GetLoginUser, GetMenuData, MenuCreated, MenuUpdate } from "../Controllers/MenuControllers"
import { upload } from "../Middewares/Multer middleware"
const router = express.Router()

router.post("/Created/Meun", jwtMiddleware, upload.single("menuPictuer"), MenuCreated)
router.get("/Get/Menu/Data/:id", jwtMiddleware, GetMenuData)
router.get("/Get/Login/User/Data/:id", jwtMiddleware, GetLoginUser)
router.put("/Menu/Update/:id", jwtMiddleware, MenuUpdate)
export default router;
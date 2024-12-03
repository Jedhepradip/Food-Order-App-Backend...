import express from "express"
import { jwtMiddleware } from "../Middewares/jwtAuthMiddleware"
import { AllMenuDataGet, GetLoginUser, GetMenuData, MenuCreated, MenuUpdate } from "../Controllers/MenuControllers"
import { upload } from "../Middewares/Multer middleware"
const router = express.Router()

router.get("/Get/Menu/Data/:id", jwtMiddleware, GetMenuData)
router.get("/Get/Login/User/Data", jwtMiddleware, GetLoginUser)
router.get("/AllData/Send/Menu", jwtMiddleware, AllMenuDataGet)
router.post("/Created/Meun", jwtMiddleware, upload.single("menuPictuer"), MenuCreated)
router.put("/Menu/Update/:id", jwtMiddleware, upload.single("menuPictuer"), MenuUpdate)

export default router;
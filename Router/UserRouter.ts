import express from "express";
const router = express.Router();
import { upload } from "../Middewares/Multer middleware";
import { SendOTPForRegistrationUser, RegistrationUser, LoginUser, UserUpdate, ForgetPassword, PasswordReset } from "../Controllers/UserControllers";

router.post("/SendOTP/ForRegistration/User", SendOTPForRegistrationUser);
router.post("/Registration/User", upload.single("profilePicture"), RegistrationUser);
router.post("/Login/User", LoginUser);
router.post("/Update/User/:id", UserUpdate);
router.post("/ForgetPassword", ForgetPassword);
router.post("/User/Password/Reset", PasswordReset)

export default router;

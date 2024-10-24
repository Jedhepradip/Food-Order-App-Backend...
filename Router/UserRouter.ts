import express, { Router, Request, Response } from "express";
const router = Router();
import { SendOTPForRegistrationUser, RegistrationUser, LoginUser, UserUpdate, ForgetPassword, PasswordReset } from "../Controllers/UserControllers";

router.post("/SendOTP/ForRegistration/User", SendOTPForRegistrationUser);
router.post("/Registration/User", RegistrationUser);
router.post("/Login/User", LoginUser);
router.post("/Update/User/:id", UserUpdate);
router.post("/ForgetPassword", ForgetPassword);
router.post("/User/Password/Reset", PasswordReset)

export default router;

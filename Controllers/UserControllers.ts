import { Request, Response, NextFunction } from "express";
import UserModels from "../Models/UserModels";
import nodemailer from "nodemailer"
import bcrypt from "bcrypt"
import { generateToken } from "../Middewares/generateToken"
import crypto from "crypto"
import { v2 as cloudinary } from 'cloudinary';

interface CustomRequest extends Request {
    user?: {
        id: string;  // Define the specific type you expect for 'user.id'
        // Add other properties if needed
    };
}

interface UserPayload {
    id: any,
    email: string,
    name: string,
}


interface MulterFile {
    originalname: string;
    path: string;
    filename: string;
    mimetype: string;
    size: number;
    // Add other properties from Multer's File type if necessary
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export const SendOTPForRegistrationUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, contact, name } = req.body;

        if (!email || !contact || !name) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const emailCheck = await UserModels.findOne({ email });
        if (emailCheck) {
            return res.status(400).json({ message: "User already exists with this email." });
        }

        const contactCheck = await UserModels.findOne({ contact });
        if (contactCheck) {
            return res.status(400).json({ message: "User already exists with this contact." });
        }

        // Set up the email transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            secure: true,
            port: Number(process.env.NODEMAILER_PORT) || 465,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        // Send OTP email
        const otpCode = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
        console.log("OTP Code :", otpCode);

        const info = await transporter.sendMail({
            from: process.env.FROM,
            to: email, // Send the email to the user
            subject: "Welcome to CraveCourier!", // Subject line
            text: `Thank you for registering at CraveCourier. Your OTP code is ${otpCode}. It is valid for 10 minutes.`, // Fallback text
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: black; text-align:center;">Welcome to CraveCourier!</h2>
                    <p>Hi ${name},</p>
                    <p>Thank you for registering at CraveCourier. We're excited to have you on board!</p>
        
                    <h3 style="margin-top: 30px; color: #333;">Your OTP Code:</h3>
                    <div style="background-color: #f4f4f4; padding: 10px 20px; border-radius: 8px; font-size: 24px; text-align: center; max-width: 400px; margin: auto; font-weight: bold; color: black;">
                        ${otpCode}
                    </div>
        
                    <p style="margin-top: 20px;">Use this OTP to verify your account. This OTP is valid for the next 10 minutes.</p>
                    
                    <h3 style="margin-top: 30px; color: #333;">Your Account Information:</h3>
                    <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px;">
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
                    </div>
                    
                    <p style="margin-top: 30px;">We're here to help you with your food orders! Feel free to explore our menu and place your first order.</p>
                    
                    <p>Best regards,<br/> The CraveCourier Team</p>
                    
                    <p style="font-size: 12px; color: #888; margin-top: 20px;">If you have any questions, please contact us at support@yourcompany.com.</p>
                </div>
            `,
        });
        // Optionally, you can also store the OTP code in your database or log it for later verification. 
        return res.status(200).json({ message: "OTP sent successfully Check Your Email... ", otpCode });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
};

// Ensure similar changes for other handlers
export const RegistrationUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, email, contact, password, address, country, city } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Profile Pictuer are missing.😊" })
        }

        const result = await cloudinary.uploader.upload(req.file!.path);

        if (!name || !email || !contact || !password || !contact || !address || !country || !city) {
            return res.status(400).json({
                message: "Oops! It looks like some details are missing.😊"
            });
        }

        const emailcheck = await UserModels.findOne({ email: email })
        if (emailcheck) {
            return res.status(400).json({ message: "User allredy exsit with this email..." })
        }

        const contactCheck = await UserModels.findOne({ contact: contact })
        if (contactCheck) {
            return res.status(400).json({ message: "User allredy exsit with this contact..." })
        }

        const passwordhash = await bcrypt.hash(password, 11)


        const UserData = new UserModels({
            name,
            email,
            contact,
            address,
            country,
            city,
            idAdmin: false,
            password: passwordhash,
            profilePictuer: result.secure_url,
        })
        await UserData.save()


        if (UserData.email === "pradipjedhe69@gmail.com") {
            UserData.idAdmin = true;
        } else {
            UserData.idAdmin = false; // Ensure a default value for other users
        }

        const payload: UserPayload = {
            id: UserData._id,
            name: UserData.name,
            email: UserData.email
        }
        const token = generateToken(JSON.stringify(payload))

        return res.status(200).json({ message: "Registration successful.", token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error.." });
    }
};

export const LoginUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "all filed is the required..." })
        }

        const user = await UserModels.findOne({ email: email })
        if (!user) {
            return res.status(400).json({ message: "user not found..." })
        }

        const passwordcheck = await bcrypt.compare(password, user.password)
        if (!passwordcheck) {
            return res.status(400).json({ message: "Incorrect Password..." })
        }

        const payloed: UserPayload = {
            id: user._id,
            name: user.name,
            email: user.email
        }
        const token = generateToken(JSON.stringify(payloed))
        return res.status(200).json({ message: "Login Successfully...", token })

    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error.." })

    }
}

export const UserUpdate = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const { name, contact, address, country, profilePictuer, city } = req.body
        const UserUpdate = { name, contact, address, country, profilePictuer, city }
        const UserId = req.params?.id
        const user = await UserModels.findById(UserId)

        if (!user) {
            return res.status(400).json({ message: "User Not Found..." })
        }

        if (contact) {
            const contactcheck = await UserModels.findOne({ contact: contact })
            if (contactcheck) {
                if (!(contactcheck?.contact == user.contact)) {
                    return res.status(400).json({ message: "Mobile number already exists" });
                }
            }
        }
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file!.path);
            UserUpdate.profilePictuer = result.secure_url
        } else {
            UserUpdate.profilePictuer = user?.profilePictuer
        }

        if (!name) UserUpdate.name = user.name
        if (!address) UserUpdate.address = user.address
        if (!country) UserUpdate.country = user.country
        if (!city) UserUpdate.city = user.city

        await UserModels.findByIdAndUpdate(UserId, UserUpdate, { new: true });
        return res.status(200).json({ message: "Profile Update Successfully..." });

    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error.." })
        return
    }
}

export const GetLoginUserdata = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const Userdata = await UserModels.findById(req.user?.id).populate({
            path: "items",
            populate: {
                path: "Menu",
            },
        })
        if (!UserUpdate) {
            return res.status(401).json({ message: "User Not Found..." })
        }
        return res.status(200).json(Userdata)
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error.." })
    }
}

export const UserAllDataSend = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const User = await UserModels.find()
        if (!User) {
            return res.status(400).json({ message: "Users Not Find..." })
        }
        return res.status(200).json(User)
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error.." })
    }
}

export const ForgetPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const EmailCheck = await UserModels.findOne({ email: email })
        if (!EmailCheck) {
            return res.status(400).json({ message: "user not Found..." })
        }
        sendPasswordResetEmail(email)
        // const otp = Math.floor(1000 + Math.random() * 9000);
        // Set up the email transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            secure: true,
            port: Number(process.env.NODEMAILER_PORT) || 465,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        async function sendPasswordResetEmail(email: string) {
            // Step 1: Generate a unique token
            const token = crypto.randomBytes(32).toString('hex');
            // Step 2: Store the token with the user's email (example using MongoDB)
            const user = await UserModels.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "User Not Found..." })
            }

            user.resetToken = token; // Create a field for reset token
            user.resetTokenExpiration = Date.now() + 10 * 60 * 1000; // 10 minutes
            await user.save();

            // Step 3: Create the password reset link
            const resetLink = `https://cravecourier1.netlify.app/SetNewPassword/?token=${token}&email=${encodeURIComponent(email)}`;

            console.log(resetLink);

            const info = await transporter.sendMail({
                from: process.env.FROM,
                to: email, // Send the email to the user
                subject: "Password Reset Request - CraveCourier", // Subject line
                text: `Your password reset link is valid for 10 minutes.`, // Fallback text
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #fff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #007bff; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Hi there,</p>
                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">We received a request to reset the password for your account at CraveCourier. If you did not request this, please ignore this email.</p>
                        
                        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">To reset your password, please click the link below:</p>
                        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; text-align: center; margin: 20px auto; max-width: 400px;">
                            <a href="${resetLink}" style="text-decoration: none; color: #fff; background-color: #007bff; padding: 10px 20px; border-radius: 5px; font-size: 16px; display: inline-block;">Reset Password</a>
                        </div>
                        
                        <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">This link is valid for the next 10 minutes. After that, you'll need to request a new password reset.</p>
                        
                        <h3 style="margin-top: 30px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Account Information:</h3>
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
                            <p style="font-size: 14px; margin: 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                            <p style="font-size: 14px; margin: 0;"><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
                        </div>
                        
                        <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">Thank you for choosing CraveCourier. We're here to help you with your food orders!</p>
                        
                        <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">Best regards,<br/><strong>The CraveCourier Team</strong></p>
                        
                        <p style="font-size: 12px; color: #888; margin-top: 20px; line-height: 1.4;">If you did not request a password reset, please contact us immediately at <a href="mailto:CraveCourier@gmail.com" style="color: #007bff; text-decoration: none;">CraveCourier@gmail.com</a>.</p>
                    </div>
                `,
            });

            return res.status(200).json({
                message: 'Password reset link has been sent to your email. Please check your inbox to reset your password.', resetLink
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error.." })
        return
    }
}

export const PasswordReset = async (req: Request, res: Response): Promise<any> => {
    try {
        const { resetToken, email, password, Cpassword } = req.body;
        if (!resetToken || !password || !email || !Cpassword) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const user = await UserModels.findOne({ resetToken: resetToken })
        if (!user) {
            return res.status(400).json({ message: "Reset Token Is Not Mach..." })
        }
        if (!(user.email == email)) {
            return res.status(400).json({
                message: "The email you entered does not match the one used to reset your password."
            });
        }

        if (!(password == Cpassword)) {
            return res.status(400).json({
                message: "The confirm password does not match the entered password. Please try again."
            });
        }

        const Passwordhash = await bcrypt.hash(password, 11)
        user.password = Passwordhash
        user.resetToken = ""
        await user.save()
        return res.status(200).json({ message: "Password Reset Successfully..", user })
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error.." })
    }
}

export const AdminDeleteTheUSER = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const UserID = req.params.ID;
        // Find the Restaurant by ID
        const user = await UserModels.findById(UserID);
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        // Delete the Restaurant
        await UserModels.findByIdAndDelete(UserID);
        return res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
};
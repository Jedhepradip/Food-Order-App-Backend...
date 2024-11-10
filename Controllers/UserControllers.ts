import { Request, Response } from "express";
import UserModels from "../Models/UserModels";
import nodemailer from "nodemailer"
import bcrypt from "bcrypt"
import { generateToken } from "../Middewares/generateToken"
import crypto from "crypto"

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

export const SendOTPForRegistrationUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, contact, name } = req.body;
        console.log(req.body);

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

        const info = await transporter.sendMail({
            from: process.env.FROM,
            to: email, // Send the email to the user
            subject: "Welcome to JedheEats!", // Subject line
            text: `Thank you for registering at JedheEats. Your OTP code is ${otpCode}. It is valid for 10 minutes.`, // Fallback text
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: black; text-align:center;">Welcome to JedheEats!</h2>
                    <p>Hi ${name},</p>
                    <p>Thank you for registering at JedheEats. We're excited to have you on board!</p>
        
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
                    
                    <p>Best regards,<br/> The JedheEats Team</p>
                    
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
            password: passwordhash,
            profilePictuer: req.file.originalname,
        })
        await UserData.save()

        const payload: UserPayload = {
            id: UserData._id,
            name: UserData.name,
            email: UserData.email
        }
        const token = generateToken(JSON.stringify(payload))
        console.log(token);

        return res.status(200).json({ message: "Registration successful.", token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error.." });
    }
};

export const LoginUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body
        console.log(req.body);

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
        const { name, contact, address, country } = req.body
        const UserUpdate = { name, contact, address, country }
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

        // type Files = {
        //     [fieldname: string]: MulterFile[];
        // }

        // if (req.files && (req.files as Files)) {
        //     // const result2 = await cloudinary.uploader.upload((req.files as Files)?.ProfileImg[0].path);
        //     // reqbody.ProfileImg = result2.secure_url
        //     UserUpdate.profilePictuer = req.file?.originalname[0]

        // } else {
        //     UserUpdate.profilePictuer = user?.profilePictuer
        // }

        if (!name) UserUpdate.name = user.name
        if (!address) UserUpdate.address = user.address
        if (!country) UserUpdate.country = user.country

        const User = await UserModels.findByIdAndUpdate(UserId, UserUpdate, { new: true });

        console.log("Update User", User);

        return res.status(200).json({ message: "Profile Update Successfully..." });

    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error.." })

    }
}

export const GetLoginUserdata = async (req: CustomRequest, res: Response): Promise<any> => {
    try {
        const Userdata = await UserModels.findById(req.user?.id)
        if (!UserUpdate) {
            return res.status(401).json({ message: "User Not Found..." })
        }
        return res.status(200).json(Userdata)
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: "Internal Server Error.." })
    }
}

export const ForgetPassword = async (req: Request, res: Response): Promise<any> => {
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
        const otp = Math.floor(1000 + Math.random() * 9000);
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
                throw new Error('User not found');
            }

            user.resetToken = token; // Create a field for reset token
            user.resetTokenExpiration = Date.now() + 10 * 60 * 1000; // 10 minutes
            await user.save();

            // Step 3: Create the password reset link
            const resetLink = `https://jobhunt0.netlify.app/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

            // Step 4: Send the email
            const info = await transporter.sendMail({
                from: process.env.FROM,
                to: email, // Send the email to the user
                subject: "Password Reset Request - [Your Food Order Website]", // Subject line
                text: `Your password reset link is valid for 10 minutes.`, // Fallback text
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <h2 style="color: black; text-align:center;">Password Reset Request</h2>
                        <p>Hi there,</p>
                        <p>We received a request to reset the password for your account at [Your Food Order Website]. If you did not request this, please ignore this email.</p>
                        
                        <p>To reset your password, please click the link below:</p>
                        <div style="background-color: #f4f4f4; padding: 10px 20px; border-radius: 8px; font-size: 18px; text-align: center; max-width: 400px; margin: auto;">
                            <a href="${resetLink}" style="text-decoration: none; color: #007bff;">Reset Password</a>
                        </div>
                        
                        <p style="margin-top: 20px;">This link is valid for the next 10 minutes. After that, you'll need to request a new password reset.</p>
                        
                        <h3 style="margin-top: 30px; color: #333;">Account Information:</h3>
                        <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px;">
                            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
                        </div>
                        
                        <p style="margin-top: 30px;">Thank you for choosing [Your Food Order Website]. We're here to help you with your food orders!</p>
                        
                        <p>Best regards,<br/> The [Your Food Order Website] Team</p>
                        
                        <p style="font-size: 12px; color: #888; margin-top: 20px;">If you did not request a password reset, please contact us immediately at support@yourcompany.com.</p>
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
    }
}

export const PasswordReset = async (req: Request, res: Response): Promise<any> => {
    try {
        const { resetToken, password } = req.body;
        if (!resetToken || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const user = await UserModels.findOne({ resetToken: resetToken })
        if (!user) {
            return res.status(400).json({ message: "Reset Token Is Not Mach..." })
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
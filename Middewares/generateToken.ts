import Jwt from "jsonwebtoken"
export const generateToken = (userData: string): any => {
    if (!process.env.JWTSECRET_KEY) {
        console.error("SECRET_KEY is not defined in the environment variables");
        throw new Error("SECRET_KEY is not defined");
    }
    return Jwt.sign(userData, process.env.JWTSECRET_KEY || "Defult_Secret_Key")
}
// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken"

// interface CustomRequest extends Request {
//     user?: any;  // You can replace 'any' with the specific type you expect for 'user'
// }

// export const jwtmiddewares = (req: CustomRequest, res: Response, next: NextFunction) => {
//     const authorization = req.headers.authorization
//     if (!authorization) {
//         return res.status(401).json({ message: "Authorization headers missing" });
//     }

//     const token = authorization.split("")[1]
//     if (!token) {
//         return res.status(401).json({ message: "Token missing from authorization header" });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWTSECRET_KEY || "DefultSecretKey")
//         req.user = decoded
//         next()
//     } catch (error) {
//         console.log(error);
//         return res.status(401).json({ message: "Invalid token" });
//     }
// }

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface CustomRequest extends Request {
    user?: any;  // You can replace 'any' with the specific type you expect for 'user'
}

export const jwtMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        res.status(401).json({ message: "Authorization header missing" });
        return;
    }

    const token = authorization.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Token missing from authorization header" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWTSECRET_KEY || "DefaultSecretKey");
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Invalid token" });
    }
};

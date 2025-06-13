import jwt from "jsonwebtoken";
import { env } from "../config/envConfig";
import { JwtPayloadToken } from "../interfaces/authInterface";

export const generateAccessToken = (payload: JwtPayloadToken) => {
   return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: '15m',
   });
};

export const generateRefreshToken = (payload: JwtPayloadToken) => {
   return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
   });
};

export const generateTokenSetPassword = (user_id: number) => {
   return jwt.sign({user_id: user_id}, env.JWT_SECRET, {
      expiresIn: '1h'
   })
}

export const verifyToken = (token: string) => {
   return jwt.verify(token, env.JWT_SECRET);
};

export const verifyRefreshToken = (refresh_token: string) => {
   return jwt.verify(refresh_token, env.JWT_REFRESH_SECRET)
}

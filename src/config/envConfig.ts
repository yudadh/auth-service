import dotenv from "dotenv";

if (process.env.NODE_ENV !== 'production') {
   dotenv.config();
}

export const env = {
   JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret",
   JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "your_refresh_secret",
   JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || "15m",
   JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || "7d",
   PORT: process.env.PORT || 3000,
   NODE_ENV: process.env.NODE_ENV || "production",
   GMAIL_USERNAME: process.env.GMAIL_USERNAME || '',
   GMAIL_PASSWORD: process.env.GMAIL_PASSWORD || ''
};


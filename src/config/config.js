import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });

export const port = process.env.PORT;
export const mangoDbUri = process.env.MONGODB_URL;
export const jwtSecret = process.env.JWT_SECRET;

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export const googleClient = new OAuth2Client(process.env.CLIENT_ID);

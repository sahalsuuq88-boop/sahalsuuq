import { createReview } from "../controllers/review";
import { profileUser } from "../middleware/authMiddleware";
import express from 'express';

const reviewRouter = express.Router()

reviewRouter.post(
"/:id/review",
profileUser,
createReview
);
export default reviewRouter;
import express from "express";

import {
  getFAQs,
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from "../controllers/faq.js";

const FaqRouter = express.Router();

FaqRouter.get("/", getFAQs);

FaqRouter.get("/admin", getAllFAQs);

FaqRouter.post("/", createFAQ);

FaqRouter.put("/:id", updateFAQ);

FaqRouter.delete("/:id", deleteFAQ);

export default FaqRouter;
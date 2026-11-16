import express from "express";

import {
  getAbout,
  createAbout,
  updateAbout,
} from "../controllers/about.js";

const AboutCrouter = express.Router();

AboutCrouter.get("/", getAbout);
AboutCrouter.post("/", createAbout);
AboutCrouter.put("/:id", updateAbout);

export default AboutCrouter;
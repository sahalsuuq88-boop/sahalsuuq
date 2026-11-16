import express from "express";

import {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.js";

import { profileUser } from "../middleware/authMiddleware.js";

const AddessRouter = express.Router();

AddessRouter.use(profileUser);

AddessRouter.get("/", getMyAddresses);

AddessRouter.post("/", createAddress);

AddessRouter.put("/:id", updateAddress);

AddessRouter.delete("/:id", deleteAddress);

AddessRouter.patch("/:id/default", setDefaultAddress);

export default AddessRouter;
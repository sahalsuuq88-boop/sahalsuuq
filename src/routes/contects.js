import express from "express";

import {
  createContact,
  getContacts,
  getContact,
  updateContactStatus,
  deleteContact,
} from "../controllers/contects.js";

const ContactRouter = express.Router();

ContactRouter.post("/", createContact);

ContactRouter.get("/", getContacts);

ContactRouter.get("/:id", getContact);

ContactRouter.put("/:id/status", updateContactStatus);

ContactRouter.delete("/:id", deleteContact);

export default ContactRouter;
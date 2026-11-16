import { body } from "express-validator";

export const updateProductValidation = [
  body("name")
    .optional(),

  body("price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number"),

  body("description")
    .optional(),

  body("category")
    .optional(),

  body("badge")
    .optional(),

  body("stock")
    .optional()
];
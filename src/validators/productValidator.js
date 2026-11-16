import { body } from "express-validator";


export const createProductValidation = [

  body("name")
    .notEmpty()
    .withMessage("Product name is required"),

  body("description")
    .notEmpty()
    .withMessage("Description is required"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be 0 or greater"),

  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be 0 or greater"),

  body("category")
    .notEmpty()
    .withMessage("Category is required"),

];
const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipe.controller");
const { authenticate } = require("../middleware/auth.middleware");

// Public routes (no auth required)
router.get("/", recipeController.getRecipes);
router.get("/categories", recipeController.getCategories);
router.get("/:id", recipeController.getRecipeById);

// Admin routes
router.post("/", authenticate, recipeController.createRecipe);
router.put("/:id", authenticate, recipeController.updateRecipe);
router.delete("/:id", authenticate, recipeController.deleteRecipe);

module.exports = router;

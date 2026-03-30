const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    description: String,
    category: {
      type: String,
      enum: ["high-protein", "high-carb", "high-fat"],
      required: true,
      index: true,
    },
    calories: {
      type: Number,
      required: true,
    },
    prepTime: {
      type: Number,
      required: true,
    },
    cookTime: {
      type: Number,
      required: true,
    },
    servings: {
      type: Number,
      default: 1,
    },
    nutrition: {
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
    },
    ingredients: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true },
        unit: { type: String, required: true },
      },
    ],
    instructions: [
      {
        step: { type: Number, required: true },
        description: { type: String, required: true },
      },
    ],
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

recipeSchema.index({ title: "text", tags: "text" });

module.exports = mongoose.model("Recipe", recipeSchema);

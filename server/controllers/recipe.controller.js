const Recipe = require("../models/Recipe.model");

// Get all recipes with filtering and search
exports.getRecipes = async (req, res) => {
  try {
    const { category, search, limit = 10, page = 1 } = req.query;

    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const recipes = await Recipe.find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Recipe.countDocuments(query);

    res.json({
      success: true,
      data: recipes,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single recipe details
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }
    res.json({ success: true, data: recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get categories (for dropdown)
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      { id: "high-protein", name: "High Protein", icon: "💪" },
      { id: "high-carb", name: "High Carb", icon: "🍚" },
      { id: "high-fat", name: "High Fat", icon: "🥑" },
    ];
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Create recipe
exports.createRecipe = async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    await recipe.save();
    res.status(201).json({ success: true, data: recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update recipe
exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }
    res.json({ success: true, data: recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }
    res.json({ success: true, message: "Recipe deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

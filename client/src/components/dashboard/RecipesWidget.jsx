import React, { useState, useEffect } from "react";
import axios from "../../api/axios";

const RecipesWidget = ({ className }) => {
  const [selectedCategory, setSelectedCategory] = useState("high-protein");
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchRecipes();
  }, [selectedCategory, search]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/recipes/categories");
      setCategories(res.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([
        { id: "high-protein", name: "High Protein", icon: "💪" },
        { id: "high-carb", name: "High Carb", icon: "🍚" },
        { id: "high-fat", name: "High Fat", icon: "🥑" },
      ]);
    }
  };

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/recipes", {
        params: {
          category: selectedCategory,
          search: search || undefined,
          limit: 10,
        },
      });
      setRecipes(res.data.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const totalTime = (recipe) => {
    return `${recipe.prepTime + recipe.cookTime} min`;
  };

  return (
    <div className={`card flex flex-col ${className || ""}`}>
      <h3 className="text-xl font-semibold mb-4 flex items-center shrink-0">
        <span className="mr-2">🍽️</span>
        Healthy Recipes
      </h3>

      {/* Search Bar */}
      <div className="mb-4 shrink-0">
        <input
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 shrink-0">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Recipes Grid */}
      <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
        {loading ? (
          <div className="flex justify-center items-center h-20">
            <span className="text-gray-500">Loading recipes...</span>
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex justify-center items-center h-20">
            <span className="text-gray-500">No recipes found</span>
          </div>
        ) : (
          recipes.map((recipe) => (
            <div
              key={recipe._id}
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="text-4xl mr-3">🍽️</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 mb-1">
                  {recipe.title}
                </h4>
                <div className="flex items-center space-x-3 text-xs text-gray-600 mb-1">
                  <span>🔥 {recipe.calories} cal</span>
                  <span>⏱️ {totalTime(recipe)}</span>
                  <span>👥 {recipe.servings} servings</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {recipe.tags?.slice(0, 2).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button className="text-primary-600 hover:text-primary-700 ml-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecipesWidget;

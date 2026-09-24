"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addProduct } from "@/api/productApi";
import ProtectedRoute from "@/components/ProtectedRoute";

const Page = () => {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !title ||
      !price ||
      !category ||
      stock === "" ||
      !description ||
      !image
    ) {
      setError("Please fill all fields and select an image");
      return;
    }

    if (Number(price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    if (Number(stock) < 0) {
      setError("Stock cannot be negative");
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const product = {
        title: title,
        price: Number(price),
        category: category,
        stock: Number(stock),
        description: description,
      };

      const data = await addProduct(product);

      console.log("Added Product:", data);

      const savedProducts =
        JSON.parse(localStorage.getItem("addedProducts")) || [];

      const localProduct = {
        ...data,
        id: Date.now(),
        title: title,
        price: Number(price),
        category: category,
        stock: Number(stock),
        description: description,
        thumbnail: image,
        rating: null,
        isLocal: true,
      };

      savedProducts.unshift(localProduct);

      localStorage.setItem(
        "addedProducts",
        JSON.stringify(savedProducts)
      );

      setSuccess("Product added successfully");

      setTitle("");
      setPrice("");
      setCategory("");
      setStock("");
      setDescription("");
      setImage("");

      document.getElementById("productImage").value = "";
    } catch (error) {
      console.log(error);
      setError("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800">
              Add Product
            </h1>

            <p className="text-slate-500 mt-1">
              Add a new product to your catalog
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">

            <form onSubmit={handleSubmit}>

              {/* Title */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter product title"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Price
                  </label>

                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Stock
                  </label>

                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Enter stock"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

              </div>

              {/* Category */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>

                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Enter category"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>

                <textarea
                  rows="5"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter product description"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product Image
                </label>

                <input
                  id="productImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:font-medium hover:file:bg-blue-100"
                />

                <p className="text-xs text-slate-500 mt-2">
                  Only image files. Maximum size: 5MB.
                </p>
              </div>

              {/* Image Preview */}
              {image && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-700 mb-3">
                    Image Preview
                  </p>

                  <div className="w-40 h-40 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <img
                      src={image}
                      alt="Product Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="mb-5 bg-green-50 border border-green-200 text-green-600 rounded-lg px-4 py-3 text-sm">
                  {success}
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold px-6 py-3 rounded-lg transition"
                >
                  {loading ? "Adding..." : "Add Product"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/products")}
                  className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-lg transition"
                >
                  Back to Products
                </button>

              </div>

            </form>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Page;
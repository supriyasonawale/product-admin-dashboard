
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getProductById,
  updateProduct,
} from "@/api/productApi";
import ProtectedRoute from "@/components/ProtectedRoute";

const Page = () => {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const savedProducts =
          JSON.parse(localStorage.getItem("addedProducts")) || [];

        const updatedProducts =
          JSON.parse(localStorage.getItem("updatedProducts")) || [];

        // Check newly added product first
        const localProduct = savedProducts.find(
          (item) => String(item.id) === String(params.id)
        );

        if (localProduct) {
          setProduct(localProduct);
          setLoading(false);
          return;
        }

        // Check previously updated product
        const updatedProduct = updatedProducts.find(
          (item) => String(item.id) === String(params.id)
        );

        if (updatedProduct) {
          setProduct(updatedProduct);
          setLoading(false);
          return;
        }

        // Otherwise get product from API
        const data = await getProductById(params.id);

        setProduct(data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setError("Product not found");
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleUpdate = async () => {
    if (saving) {
      return;
    }

    setSuccess("");
    setError("");

    if (
      !product.title ||
      !product.category ||
      !product.description ||
      product.price === "" ||
      product.stock === ""
    ) {
      setError("Please fill all fields");
      return;
    }

    if (Number(product.price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    if (Number(product.stock) < 0) {
      setError("Stock cannot be negative");
      return;
    }

    setSaving(true);

    try {
      const updatedProduct = {
        ...product,
        title: product.title,
        price: Number(product.price),
        category: product.category,
        stock: Number(product.stock),
        description: product.description,
      };

      // If product was added by us
      if (product.isLocal) {
        const savedProducts =
          JSON.parse(localStorage.getItem("addedProducts")) || [];

        const updatedAddedProducts = savedProducts.map((item) => {
          if (String(item.id) === String(params.id)) {
            return updatedProduct;
          }

          return item;
        });

        localStorage.setItem(
          "addedProducts",
          JSON.stringify(updatedAddedProducts)
        );

        setProduct(updatedProduct);
        setSuccess("Product updated successfully");

        return;
      }

      // Update product on DummyJSON
      const data = await updateProduct(params.id, {
        title: product.title,
        price: Number(product.price),
        category: product.category,
        stock: Number(product.stock),
        description: product.description,
      });

      // Save updated product locally because DummyJSON
      // does not permanently save PUT changes
      const updatedProducts =
        JSON.parse(localStorage.getItem("updatedProducts")) || [];

      const finalProduct = {
        ...data,
        id: Number(params.id),
        title: product.title,
        price: Number(product.price),
        category: product.category,
        stock: Number(product.stock),
        description: product.description,
      };

      const existingIndex = updatedProducts.findIndex(
        (item) => String(item.id) === String(params.id)
      );

      if (existingIndex !== -1) {
        updatedProducts[existingIndex] = finalProduct;
      } else {
        updatedProducts.push(finalProduct);
      }

      localStorage.setItem(
        "updatedProducts",
        JSON.stringify(updatedProducts)
      );

      setProduct(finalProduct);
      setSuccess("Product updated successfully");
    } catch (error) {
      console.log(error);
      setError("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg">
              Product not found
            </p>

            <button
              onClick={() => router.push("/products")}
              className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              Back to Products
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="max-w-3xl mx-auto">

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800">
              Edit Product
            </h1>

            <p className="text-slate-500 mt-1">
              Update product information
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

            {product.thumbnail && (
              <div className="flex justify-center mb-6">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-40 h-40 object-contain rounded-xl border border-slate-200"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product Title
                </label>

                <input
                  type="text"
                  value={product.title}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      title: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price
                </label>

                <input
                  type="number"
                  value={product.price}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      price: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Stock
                </label>

                <input
                  type="number"
                  value={product.stock}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      stock: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>

                <input
                  type="text"
                  value={product.category}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      category: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>

                <textarea
                  rows="5"
                  value={product.description}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      description: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

            </div>

            {error && (
              <div className="mt-5 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-5 bg-green-50 border border-green-200 text-green-600 rounded-lg px-4 py-3">
                {success}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">

              <button
                onClick={handleUpdate}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold px-6 py-3 rounded-lg"
              >
                {saving ? "Updating..." : "Update Product"}
              </button>

              <button
                onClick={() => router.push("/products")}
                className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-lg"
              >
                Back to Products
              </button>

            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Page;

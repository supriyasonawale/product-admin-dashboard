"use client";

import { useParams, useRouter } from "next/navigation";
import { getProductById } from "@/api/productApi";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

const Page = () => {
  const router = useRouter();
  const params = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      setProduct(null);

      try {
        const data = await getProductById(params.id);

        if (!data || !data.id) {
          setError("Product not found");
          setLoading(false);
          return;
        }

        setProduct(data);
        setLoading(false);
      } catch (error) {
        console.log(error);

        if (error.response?.status === 404) {
          setError("Product not found");
        } else {
          setError("Failed to load product");
        }

        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Product Details
              </h1>

              <p className="text-slate-500 mt-1">
                View complete product information
              </p>
            </div>

            <button
              onClick={() => router.push("/products")}
              className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium"
            >
              ← Back to Products
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
              <p className="text-slate-600 text-lg">
                Loading product...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
              <div className="text-red-500 text-5xl mb-4">
                !
              </div>

              <h2 className="text-xl font-semibold text-slate-800">
                {error}
              </h2>

              <button
                onClick={() => router.push("/products")}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium"
              >
                Back to Products
              </button>
            </div>
          )}

          {/* Product */}
          {!loading && !error && product && (
            <div className="space-y-6">

              {/* Product Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                <div className="grid grid-cols-1 md:grid-cols-2">

                  {/* Image */}
                  <div className="bg-slate-50 flex items-center justify-center p-8 min-h-[350px]">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-full max-w-md h-80 object-contain"
                      />
                    ) : (
                      <p className="text-slate-500">
                        No image available
                      </p>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-6 md:p-8">

                    <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
                      {product.category}
                    </span>

                    <h2 className="text-3xl font-bold text-slate-800">
                      {product.title}
                    </h2>

                    <p className="text-slate-600 mt-4 leading-7">
                      {product.description}
                    </p>

                    {/* Price */}
                    <div className="mt-6">
                      <p className="text-sm text-slate-500">
                        Price
                      </p>

                      <p className="text-3xl font-bold text-blue-600">
                        ${product.price}
                      </p>
                    </div>

                    {/* Product Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-6">

                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-sm text-slate-500">
                          Rating
                        </p>

                        <p className="text-xl font-semibold text-slate-800 mt-1">
                          ⭐ {product.rating}
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-sm text-slate-500">
                          Stock
                        </p>

                        <p className="text-xl font-semibold text-slate-800 mt-1">
                          {product.stock}
                        </p>
                      </div>

                    </div>

                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">

                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Reviews
                  </h2>

                  <span className="text-sm text-slate-500">
                    {product.reviews?.length || 0} reviews
                  </span>
                </div>

                {!product.reviews ||
                product.reviews.length === 0 ? (
                  <div className="bg-slate-50 rounded-xl p-6 text-center">
                    <p className="text-slate-500">
                      No reviews found.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">

                    {product.reviews.map((review, index) => (
                      <div
                        key={index}
                        className="border border-slate-200 rounded-xl p-5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                          <p className="font-semibold text-slate-800">
                            {review.reviewerName}
                          </p>

                          <span className="text-sm bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">
                            ⭐ {review.rating}
                          </span>

                        </div>

                        <p className="text-slate-600 mt-3">
                          {review.comment}
                        </p>

                      </div>
                    ))}

                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Page;
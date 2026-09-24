
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  getProducts,
  searchProducts,
  getCategories,
  getProductsByCategory,
  deleteProduct,
} from "@/api/productApi";

import ProtectedRoute from "@/components/ProtectedRoute";

const ProductsPage  = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [limit, setLimit] = useState(10);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  const requestId = useRef(0);

  const sortProducts = (items) => {
    const sorted = [...items];

    if (sort === "price") {
      sorted.sort((a, b) => a.price - b.price);
    }

    if (sort === "rating") {
      sorted.sort((a, b) => b.rating - a.rating);
    }

    if (sort === "title") {
      sorted.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    return sorted;
  };

  // Apply locally updated products over API products
  const applyUpdatedProducts = (items, updatedProducts) => {
    return items.map((product) => {
      const updatedProduct = updatedProducts.find(
        (item) =>
          String(item.id) === String(product.id)
      );

      if (updatedProduct) {
        return {
          ...product,
          ...updatedProduct,
        };
      }

      return product;
    });
  };

  const updateURL = (
    page,
    currentSearch = search,
    currentCategory = category,
    currentSort = sort
  ) => {
    const params = new URLSearchParams();

    params.set("page", page);
    params.set("limit", limit);

    if (currentSearch) {
      params.set("search", currentSearch);
    }

    if (currentCategory) {
      params.set("category", currentCategory);
    }

    if (currentSort) {
      params.set("sort", currentSort);
    }

    router.push(
      `/products?${params.toString()}`
    );
  };

  useEffect(() => {
    const pageValue = Number(
      searchParams.get("page")
    );

    const page =
      Number.isInteger(pageValue) &&
      pageValue >= 1
        ? pageValue
        : 1;

    const searchValue =
      searchParams.get("search") || "";

    const categoryValue =
      searchParams.get("category") || "";

    const validCategory =
      categories.some(
        (item) =>
          item.slug === categoryValue
      )
        ? categoryValue
        : "";

    const sortValue =
      searchParams.get("sort");

    const validSort =
      sortValue === "price" ||
      sortValue === "rating" ||
      sortValue === "title"
        ? sortValue
        : "";

    const limitValue = Number(
      searchParams.get("limit")
    );

    const validLimit =
      limitValue === 10 ||
      limitValue === 20 ||
      limitValue === 50
        ? limitValue
        : 10;

    setLimit(validLimit);

    setSkip(
      (page - 1) * validLimit
    );

    setCategory(validCategory);
    setSort(validSort);

    if (validCategory) {
      setSearch("");
    } else {
      setSearch(searchValue);
    }
  }, [searchParams, categories]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    requestId.current =
      requestId.current + 1;

    const currentRequestId =
      requestId.current;

    setLoading(true);
    setError("");
    setProducts([]);

    try {
      const savedProducts =
        JSON.parse(
          localStorage.getItem(
            "addedProducts"
          )
        ) || [];

      const updatedProducts =
        JSON.parse(
          localStorage.getItem(
            "updatedProducts"
          )
        ) || [];

      // CATEGORY
      if (category) {
        const data =
          await getProductsByCategory(
            category,
            limit,
            skip
          );

        if (
          currentRequestId !==
          requestId.current
        ) {
          return;
        }

        const mergedProducts =
          applyUpdatedProducts(
            data.products,
            updatedProducts
          );

        setProducts(
          sortProducts(mergedProducts)
        );

        setTotal(data.total);
        setLoading(false);

        return;
      }

      // SEARCH
      if (search) {
        const data =
          await searchProducts(search);

        if (
          currentRequestId !==
          requestId.current
        ) {
          return;
        }

        const localMatches =
          savedProducts.filter(
            (product) =>
              product.title
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                )
          );

        const updatedMatches =
          updatedProducts.filter(
            (product) =>
              product.title
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                )
          );

        const apiProducts =
          applyUpdatedProducts(
            data.products,
            updatedProducts
          );

        const allProducts = [
          ...localMatches,
          ...updatedMatches,
          ...apiProducts,
        ];

        // Remove duplicate products
        const uniqueProducts = [];

        allProducts.forEach(
          (product) => {
            const alreadyExists =
              uniqueProducts.some(
                (item) =>
                  String(item.id) ===
                  String(product.id)
              );

            if (!alreadyExists) {
              uniqueProducts.push(
                product
              );
            }
          }
        );

        setProducts(
          sortProducts(
            uniqueProducts
          )
        );

        setTotal(
          uniqueProducts.length
        );

        setLoading(false);

        return;
      }

      // NORMAL PRODUCTS
      const localCount =
        savedProducts.length;

      if (skip < localCount) {
        const localProducts =
          savedProducts.slice(
            skip,
            skip + limit
          );

        const remaining =
          limit -
          localProducts.length;

        let apiProducts = [];
        let apiTotal = 0;

        if (remaining > 0) {
          const data =
            await getProducts(
              remaining,
              0
            );

          apiProducts =
            data.products;

          apiTotal =
            data.total;
        }

        if (
          currentRequestId !==
          requestId.current
        ) {
          return;
        }

        const mergedApiProducts =
          applyUpdatedProducts(
            apiProducts,
            updatedProducts
          );

        const mergedLocalProducts =
          applyUpdatedProducts(
            localProducts,
            updatedProducts
          );

        const allProducts = [
          ...mergedLocalProducts,
          ...mergedApiProducts,
        ];

        setProducts(
          sortProducts(allProducts)
        );

        setTotal(
          apiTotal + localCount
        );

        setLoading(false);

        return;
      }

      const apiSkip =
        skip - localCount;

      const data =
        await getProducts(
          limit,
          apiSkip
        );

      if (
        currentRequestId !==
        requestId.current
      ) {
        return;
      }

      const mergedProducts =
        applyUpdatedProducts(
          data.products,
          updatedProducts
        );

      setProducts(
        sortProducts(mergedProducts)
      );

      const totalProducts =
        data.total + localCount;

      setTotal(totalProducts);

      const totalPages =
        Math.ceil(
          totalProducts / limit
        );

      if (
        skip >= totalProducts &&
        totalPages > 0
      ) {
        const validSkip =
          (totalPages - 1) * limit;

        setSkip(validSkip);

        updateURL(
          totalPages,
          search,
          category,
          sort
        );

        return;
      }

      setLoading(false);
    } catch (error) {
      console.log(error);

      if (
        currentRequestId !==
        requestId.current
      ) {
        return;
      }

      setError(
        "Failed to load products"
      );

      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [
    skip,
    search,
    category,
    sort,
    limit,
  ]);

  const handleSearch = (e) => {
    const value = e.target.value;

    setSearch(value);
    setCategory("");
    setSkip(0);

    const params =
      new URLSearchParams();

    params.set("page", "1");
    params.set("limit", limit);

    if (value) {
      params.set("search", value);
    }

    if (sort) {
      params.set("sort", sort);
    }

    router.push(
      `/products?${params.toString()}`
    );
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;

    setCategory(value);
    setSearch("");
    setSkip(0);

    const params =
      new URLSearchParams();

    params.set("page", "1");
    params.set("limit", limit);

    if (value) {
      params.set("category", value);
    }

    if (sort) {
      params.set("sort", sort);
    }

    router.push(
      `/products?${params.toString()}`
    );
  };

  const handleSortChange = (e) => {
    const value = e.target.value;

    setSort(value);
    setSkip(0);

    const params =
      new URLSearchParams();

    params.set("page", "1");
    params.set("limit", limit);

    if (search) {
      params.set("search", search);
    }

    if (category) {
      params.set("category", category);
    }

    if (value) {
      params.set("sort", value);
    }

    router.push(
      `/products?${params.toString()}`
    );
  };

  const handlePageSizeChange = (e) => {
    const newLimit =
      Number(e.target.value);

    setLimit(newLimit);
    setSkip(0);

    const params =
      new URLSearchParams();

    params.set("page", "1");
    params.set(
      "limit",
      newLimit
    );

    if (search) {
      params.set("search", search);
    }

    if (category) {
      params.set("category", category);
    }

    if (sort) {
      params.set("sort", sort);
    }

    router.push(
      `/products?${params.toString()}`
    );
  };

  const handlePrevious = () => {
    if (skip === 0) {
      return;
    }

    const newSkip =
      skip - limit;

    setSkip(newSkip);

    updateURL(
      newSkip / limit + 1,
      search,
      category,
      sort
    );
  };

  const handleNext = () => {
    if (
      skip + limit >= total
    ) {
      return;
    }

    const newSkip =
      skip + limit;

    setSkip(newSkip);

    updateURL(
      newSkip / limit + 1,
      search,
      category,
      sort
    );
  };

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this product?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const savedProducts =
        JSON.parse(
          localStorage.getItem(
            "addedProducts"
          )
        ) || [];

      const localProduct =
        savedProducts.find(
          (product) =>
            String(product.id) ===
            String(id)
        );

      if (localProduct) {
        const updatedProducts =
          savedProducts.filter(
            (product) =>
              String(product.id) !==
              String(id)
          );

        localStorage.setItem(
          "addedProducts",
          JSON.stringify(
            updatedProducts
          )
        );

        setProducts(
          products.filter(
            (product) =>
              String(product.id) !==
              String(id)
          )
        );

        setTotal(
          total - 1
        );

        return;
      }

      // Remove locally updated version also
      const savedUpdatedProducts =
        JSON.parse(
          localStorage.getItem(
            "updatedProducts"
          )
        ) || [];

      const remainingUpdatedProducts =
        savedUpdatedProducts.filter(
          (product) =>
            String(product.id) !==
            String(id)
        );

      localStorage.setItem(
        "updatedProducts",
        JSON.stringify(
          remainingUpdatedProducts
        )
      );

      await deleteProduct(id);

      setProducts(
        products.filter(
          (product) =>
            String(product.id) !==
            String(id)
        )
      );

      setTotal(total - 1);
    } catch (error) {
      console.log(error);

      setError(
        "Failed to delete product"
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "accessToken"
    );

    router.push("/login");
  };

  const totalPages =
    Math.max(
      1,
      Math.ceil(total / limit)
    );

  const currentPage =
    Math.floor(skip / limit) + 1;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">

        {/* Header */}
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Product Admin
              </h1>

              <p className="text-sm text-gray-500">
                Manage your products
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              Logout
            </button>

          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6">

          {/* Top section */}
          <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Products
              </h2>

              <p className="text-sm text-gray-500">
                View and manage all products
              </p>
            </div>

            <button
              onClick={() =>
                router.push(
                  "/products/add"
                )
              }
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
            >
              + Add Product
            </button>

          </div>

          {/* Filters */}
          <div className="mb-6 grid gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-4">

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={handleSearch}
              className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <select
              value={category}
              onChange={
                handleCategoryChange
              }
              className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
            >
              <option value="">
                All Categories
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item.slug}
                    value={item.slug}
                  >
                    {item.name}
                  </option>
                )
              )}
            </select>

            <select
              value={sort}
              onChange={
                handleSortChange
              }
              className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
            >
              <option value="">
                Sort By
              </option>

              <option value="price">
                Price
              </option>

              <option value="rating">
                Rating
              </option>

              <option value="title">
                Title
              </option>
            </select>

            <select
              value={limit}
              onChange={
                handlePageSizeChange
              }
              className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
            >
              <option value={10}>
                10 per page
              </option>

              <option value={20}>
                20 per page
              </option>

              <option value={50}>
                50 per page
              </option>
            </select>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">

              <p className="text-sm text-red-600">
                {error}
              </p>

              <button
                onClick={
                  fetchProducts
                }
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Retry
              </button>

            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="rounded-xl bg-white py-16 text-center shadow-sm">

              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

              <p className="text-gray-500">
                Loading products...
              </p>

            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            products.length === 0 && (
              <div className="rounded-xl bg-white py-16 text-center shadow-sm">

                <h3 className="text-lg font-semibold text-gray-800">
                  No products found
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Try another search or filter.
                </p>

              </div>
            )}

          {/* Desktop table */}
          {!loading &&
            products.length > 0 && (
              <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm md:block">

                <div className="overflow-x-auto">

                  <table className="w-full text-left">

                    <thead className="border-b bg-gray-50">

                      <tr>

                        <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                          Image
                        </th>

                        <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                          Title
                        </th>

                        <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                          Category
                        </th>

                        <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                          Price
                        </th>

                        <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                          Rating
                        </th>

                        <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                          Stock
                        </th>

                        <th className="px-5 py-4 text-sm font-semibold text-gray-600">
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y">

                      {products.map(
                        (product) => (
                          <tr
                            key={
                              product.id
                            }
                            className="hover:bg-gray-50"
                          >

                            <td className="px-5 py-4">

                              {product.thumbnail ? (
                                <img
                                  src={
                                    product.thumbnail
                                  }
                                  alt={
                                    product.title
                                  }
                                  className="h-14 w-14 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                                  No image
                                </div>
                              )}

                            </td>

                            <td className="max-w-xs px-5 py-4 font-medium">

                              <button
                                onClick={() =>
                                  router.push(
                                    `/products/${product.id}`
                                  )
                                }
                                className="text-left text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {product.title}
                              </button>

                            </td>

                            <td className="px-5 py-4 text-sm text-gray-500">
                              {
                                product.category
                              }
                            </td>

                            <td className="px-5 py-4 font-medium text-gray-900">
                              $
                              {
                                product.price
                              }
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                              ⭐{" "}
                              {
                                product.rating
                              }
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                              {
                                product.stock
                              }
                            </td>

                            <td className="px-5 py-4">

                              <div className="flex gap-2">

                                <button
                                  onClick={() =>
                                    router.push(
                                      `/products/${product.id}/edit`
                                    )
                                  }
                                  className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() =>
                                    handleDelete(
                                      product.id
                                    )
                                  }
                                  className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                                >
                                  Delete
                                </button>

                              </div>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>
            )}

          {/* Mobile cards */}
          {!loading &&
            products.length > 0 && (
              <div className="grid gap-4 md:hidden">

                {products.map(
                  (product) => (
                    <div
                      key={product.id}
                      className="rounded-xl bg-white p-4 shadow-sm"
                    >

                      <div className="flex gap-4">

                        {product.thumbnail ? (
                          <img
                            src={
                              product.thumbnail
                            }
                            alt={
                              product.title
                            }
                            className="h-24 w-24 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                            No image
                          </div>
                        )}

                        <div className="min-w-0">

                          <button
                            onClick={() =>
                              router.push(
                                `/products/${product.id}`
                              )
                            }
                            className="text-left font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {product.title}
                          </button>

                          <p className="mt-1 text-sm text-gray-500">
                            {
                              product.category
                            }
                          </p>

                          <p className="mt-2 font-semibold text-gray-900">
                            $
                            {
                              product.price
                            }
                          </p>

                        </div>

                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-3 text-sm">

                        <p>
                          Rating: ⭐{" "}
                          {
                            product.rating
                          }
                        </p>

                        <p>
                          Stock:{" "}
                          {
                            product.stock
                          }
                        </p>

                      </div>

                      <div className="mt-4 flex gap-2">

                        <button
                          onClick={() =>
                            router.push(
                              `/products/${product.id}/edit`
                            )
                          }
                          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              product.id
                            )
                          }
                          className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white"
                        >
                          Delete
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          {/* Pagination */}
          {!loading &&
            !search &&
            products.length > 0 && (
              <div className="mt-6 flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

                <p className="text-sm text-gray-600">
                  Showing{" "}
                  {total === 0
                    ? 0
                    : skip + 1}{" "}
                  -{" "}
                  {Math.min(
                    skip +
                      products.length,
                    total
                  )}{" "}
                  of {total}
                </p>

                <div className="flex items-center gap-2">

                  <button
                    onClick={
                      handlePrevious
                    }
                    disabled={
                      skip === 0
                    }
                    className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                    Page{" "}
                    {currentPage}{" "}
                    / {totalPages}
                  </span>

                  <button
                    onClick={
                      handleNext
                    }
                    disabled={
                      skip + limit >=
                      total
                    }
                    className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>

                </div>

              </div>
            )}

        </main>

      </div>
    </ProtectedRoute>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <p className="text-slate-600">Loading products...</p>
        </div>
      }
    >
      <ProductsPage />
    </Suspense>
  );
};

export default Page;

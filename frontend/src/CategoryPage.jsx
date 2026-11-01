

import { useEffect, useMemo, useState } from "react";
import "./CategoryPage.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const imageModules = import.meta.glob("./assets/*", {
  eager: true,
  import: "default",
});

function getImage(filename) {
  const entry = Object.entries(imageModules).find(([path]) =>
    path.toLowerCase().endsWith(`/${filename.toLowerCase()}`)
  );

  return entry?.[1] || "";
}

function mapApiProduct(item) {
  const sizes = Array.isArray(item.sizes)
    ? item.sizes
    : typeof item.sizes === "string"
      ? item.sizes.split(",").map((size) => size.trim())
      : [];

  const colors = Array.isArray(item.colors)
    ? item.colors
    : typeof item.colors === "string"
      ? item.colors.split(",").map((color) => color.trim())
      : [];

  return {
    id: item.id,
    name: item.name,
    category: item.category_name || "",
    image: item.image || item.image_url || "",
    imageName: item.image ? item.image.split("/").pop() : item.name,
    price: Number(item.price) || 0,
    originalPrice:
      Number(item.original_price) || Number(item.price) || 0,
    rating: Number(item.rating) || 0,
    reviewCount: Number(item.review_count) || 0,
    style: item.style || "Casual",
    brand: item.brand || "StepUp",
    colors: colors.length ? colors : ["Black", "White", "Blue"],
    sizes: sizes.length
      ? sizes.map(String)
      : ["3", "4", "5", "6", "7", "8", "9", "10"],
    description: item.description || "",
    specifications: Array.isArray(item.specifications)
      ? item.specifications
      : [],
    stock: Number(item.stock) || 0,
  };
}

function readStorage(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function HeartButton({ active, onClick }) {
  return (
    <button
      type="button"
      className={`stepup-wishlist-button ${active ? "is-wishlisted" : ""}`}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      title={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      {active ? "♥" : "♡"}
    </button>
  );
}

function ActionButton({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type={type}
      disabled={disabled}
      className={`stepup-action-button ${className} ${pressed ? "pressed" : ""}`}
      onClick={() => {
        if (disabled) return;
        setPressed(true);
        onClick?.();
        window.setTimeout(() => setPressed(false), 220);
      }}
    >
      {children}
    </button>
  );
}

export default function CategoryPage({
  category = "Women",
  onBack,
  onAddToCart,
  onBuyNow,
}) {
  const normalizedCategory =
    category?.toLowerCase() === "men"
      ? "Men"
      : category?.toLowerCase() === "kids"
        ? "Kids"
        : "Women";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [wishlist, setWishlist] = useState(() =>
    readStorage("stepup_wishlist")
  );

  const [sortBy, setSortBy] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Accordion filter state
  const [expandedFilters, setExpandedFilters] = useState([]);

  const [styleFilters, setStyleFilters] = useState([]);
  const [sizeFilters, setSizeFilters] = useState([]);
  const [colorFilters, setColorFilters] = useState([]);
  const [brandFilters, setBrandFilters] = useState([]);

  const [maxPrice, setMaxPrice] = useState(2500);
  const [minimumRating, setMinimumRating] = useState("all");
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("Black");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");

  // Real Django reviews state
  const [reviewSort, setReviewSort] = useState("newest");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  // FETCH PRODUCTS FROM DJANGO BACKEND
  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      try {
        setLoading(true);
        setApiError("");

        const response = await fetch(`${API_URL}/products/`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to fetch products from server.");
        }

        const data = await response.json();

        const productList = Array.isArray(data)
          ? data
          : data.results || [];

        const categoryProducts = productList
          .filter(
            (item) =>
              item.category_name?.toLowerCase() ===
              normalizedCategory.toLowerCase()
          )
          .map(mapApiProduct);

        setProducts(categoryProducts);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Product API error:", error);
          setApiError("Unable to load products. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, [normalizedCategory]);

  // FETCH REAL REVIEWS WHEN SELECTED PRODUCT CHANGES
  useEffect(() => {
    if (!selectedProduct) {
      setReviews([]);
      return;
    }

    const controller = new AbortController();

    async function fetchReviews() {
      try {
        setReviewsLoading(true);
        setReviewError("");

        const response = await fetch(
          `${API_URL}/reviews/?product_id=${selectedProduct.id}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load customer reviews.");
        }

        const data = await response.json();

        setReviews(
          Array.isArray(data) ? data : data.results || []
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Review fetch error:", error);
          setReviewError("Unable to load reviews. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setReviewsLoading(false);
        }
      }
    }

    fetchReviews();

    return () => controller.abort();
  }, [selectedProduct]);

  // SAVE WISHLIST
  useEffect(() => {
    localStorage.setItem(
      "stepup_wishlist",
      JSON.stringify(wishlist)
    );

    window.dispatchEvent(new Event("stepup-wishlist-updated"));
    window.dispatchEvent(new Event("wishlistUpdated"));
  }, [wishlist]);

  // SAVE RECENTLY VIEWED PRODUCTS
  function saveRecentlyViewed(product) {
    if (!product?.id) return;

    try {
      const savedProducts = readStorage("stepup_recently_viewed");

      const updatedProducts = [
        product,
        ...savedProducts.filter(
          (item) => String(item.id) !== String(product.id)
        ),
      ].slice(0, 10);

      localStorage.setItem(
        "stepup_recently_viewed",
        JSON.stringify(updatedProducts)
      );

      window.dispatchEvent(
        new Event("recentlyViewedUpdated")
      );
    } catch (error) {
      console.error("Recently viewed error:", error);
    }
  }

  function isWishlisted(product) {
    return wishlist.some(
      (item) => String(item.id) === String(product.id)
    );
  }

  // TOGGLE WISHLIST
  function toggleWishlist(product) {
    setWishlist((previous) => {
      const exists = previous.some(
        (item) => String(item.id) === String(product.id)
      );

      if (exists) {
        return previous.filter(
          (item) => String(item.id) !== String(product.id)
        );
      }

      return [...previous, product];
    });
  }

  // ACCORDION FILTER TOGGLE
  function toggleFilterSection(title) {
    setExpandedFilters((previous) =>
      previous.includes(title)
        ? previous.filter((item) => item !== title)
        : [...previous, title]
    );
  }

  // FILTER AND SORT PRODUCTS
  const filteredProducts = useMemo(() => {
    let result = products.filter(
      (product) => product.price <= maxPrice
    );

    if (styleFilters.length) {
      result = result.filter((product) =>
        styleFilters.some(
          (style) =>
            product.style.toLowerCase() === style.toLowerCase()
        )
      );
    }

    if (brandFilters.length) {
      result = result.filter((product) =>
        brandFilters.some(
          (brand) =>
            product.brand.toLowerCase() === brand.toLowerCase()
        )
      );
    }

    if (sizeFilters.length) {
      result = result.filter((product) =>
        sizeFilters.some((size) =>
          product.sizes.some(
            (productSize) =>
              String(productSize).trim() === String(size).trim()
          )
        )
      );
    }

    if (colorFilters.length) {
      result = result.filter((product) =>
        colorFilters.some((color) =>
          product.colors.some(
            (productColor) =>
              productColor.toLowerCase() === color.toLowerCase()
          )
        )
      );
    }

    if (minimumRating !== "all") {
      result = result.filter(
        (product) =>
          product.rating >= Number(minimumRating)
      );
    }

    if (showWishlistOnly) {
      result = result.filter((product) =>
        isWishlisted(product)
      );
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [
    products,
    maxPrice,
    styleFilters,
    sizeFilters,
    colorFilters,
    brandFilters,
    minimumRating,
    showWishlistOnly,
    sortBy,
    wishlist,
  ]);

  function toggleFilter(value, selected, setSelected) {
    setSelected((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value]
    );
  }

  // OPEN PRODUCT AND SAVE TO RECENTLY VIEWED
  function openProduct(product) {
    saveRecentlyViewed(product);

    setSelectedProduct(product);
    setSelectedSize("");
    setSelectedColor("Black");
    setQuantity(1);
    setActiveTab("details");
    setReviewTitle("");
    setReviewText("");
    setReviewRating(5);
    setReviewError("");
  }

  function makeCartItem(product) {
    if (!selectedSize) {
      window.alert("Please select a UK shoe size first.");
      return null;
    }

    if (product.stock <= 0) {
      window.alert("Sorry, this product is out of stock.");
      return null;
    }

    if (quantity > product.stock) {
      window.alert(`Only ${product.stock} items are available.`);
      return null;
    }

    return {
      ...product,
      size: selectedSize,
      color: selectedColor,
      quantity,
    };
  }

  // ADD TO CART
  function handleAddToCart(product) {
    const cartItem = makeCartItem(product);
    if (!cartItem) return;

    if (onAddToCart) {
      onAddToCart(cartItem);
      return;
    }

    const currentCart = readStorage("stepup_cart");

    const existingIndex = currentCart.findIndex(
      (item) =>
        String(item.id) === String(cartItem.id) &&
        String(item.size) === String(cartItem.size) &&
        item.color === cartItem.color
    );

    let nextCart;

    if (existingIndex >= 0) {
      nextCart = currentCart.map((item, index) =>
        index === existingIndex
          ? {
              ...item,
              quantity:
                (Number(item.quantity) || 1) + quantity,
            }
          : item
      );
    } else {
      nextCart = [...currentCart, cartItem];
    }

    localStorage.setItem(
      "stepup_cart",
      JSON.stringify(nextCart)
    );

    window.dispatchEvent(
      new Event("stepup-cart-updated")
    );

    window.alert("Product added to cart!");
  }

  // BUY NOW
  function handleBuyNow(product) {
    const cartItem = makeCartItem(product);
    if (!cartItem) return;

    if (onBuyNow) {
      onBuyNow(cartItem);
      return;
    }

    localStorage.setItem(
      "stepup_checkout_items",
      JSON.stringify([cartItem])
    );

    window.location.href = "/checkout";
  }

  // SUBMIT REVIEW TO DJANGO DATABASE
  async function submitReview(event) {
    event.preventDefault();

    const accessToken = localStorage.getItem(
      "stepup_access_token"
    );

    if (!accessToken) {
      window.alert("Please login to submit a review.");
      window.location.href = "/login";
      return;
    }

    if (!reviewTitle.trim() || !reviewText.trim()) {
      setReviewError(
        "Please enter your review title and comment."
      );
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError("");

      const response = await fetch(`${API_URL}/reviews/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          product: selectedProduct.id,
          rating: reviewRating,
          title: reviewTitle.trim(),
          comment: reviewText.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        window.alert(
          "Your login session has expired. Please login again."
        );

        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const message =
          data.detail ||
          data.non_field_errors?.[0] ||
          data.product?.[0] ||
          data.rating?.[0] ||
          data.title?.[0] ||
          data.comment?.[0] ||
          "Unable to submit your review.";

        throw new Error(message);
      }

      setReviews((previous) => [data, ...previous]);

      setReviewTitle("");
      setReviewText("");
      setReviewRating(5);

      window.alert(
        "Thank you! Your review has been submitted."
      );
    } catch (error) {
      console.error("Review submission error:", error);

      setReviewError(
        error.message || "Unable to submit your review."
      );
    } finally {
      setReviewSubmitting(false);
    }
  }

  const productReviews = [...reviews].sort((a, b) =>
    reviewSort === "newest"
      ? new Date(b.created_at) - new Date(a.created_at)
      : new Date(a.created_at) - new Date(b.created_at)
  );

  function clearFilters() {
    setStyleFilters([]);
    setSizeFilters([]);
    setColorFilters([]);
    setBrandFilters([]);
    setMaxPrice(2500);
    setMinimumRating("all");
    setShowWishlistOnly(false);
    setSortBy("featured");
  }

  // DYNAMIC FILTER OPTIONS
  function getUniqueValues(values) {
    return [...new Set(values.filter(Boolean).map(String))].sort(
      (a, b) => a.localeCompare(b, undefined, { numeric: true })
    );
  }

  const filterOptions = [
    {
      title: "Style",
      values: getUniqueValues(
        products.map((product) => product.style)
      ),
      selected: styleFilters,
      setSelected: setStyleFilters,
    },
    {
      title: "Size (UK)",
      values: getUniqueValues(
        products.flatMap((product) => product.sizes)
      ),
      selected: sizeFilters,
      setSelected: setSizeFilters,
    },
    {
      title: "Colors",
      values: getUniqueValues(
        products.flatMap((product) => product.colors)
      ),
      selected: colorFilters,
      setSelected: setColorFilters,
    },
    {
      title: "Brands",
      values: getUniqueValues(
        products.map((product) => product.brand)
      ),
      selected: brandFilters,
      setSelected: setBrandFilters,
    },
  ];

  return (
    <main className="stepup-category-page">
      <header className="stepup-category-top">
        <button
          type="button"
          className="stepup-back-button"
          onClick={() =>
            onBack ? onBack() : window.history.back()
          }
        >
          ← Back
        </button>

        <div className="stepup-category-heading">
          <p className="stepup-category-eyebrow">
            STEPUP COLLECTION
          </p>

          <h1>{normalizedCategory} Shoes</h1>

          <p>Find your style. Walk with confidence.</p>
        </div>

        <button
          type="button"
          className={`stepup-wishlist-filter ${
            showWishlistOnly ? "active" : ""
          }`}
          onClick={() =>
            setShowWishlistOnly((value) => !value)
          }
        >
          ♥ Wishlist ({wishlist.length})
        </button>
      </header>

      <div className="stepup-category-toolbar">
        <button
          type="button"
          className={`stepup-filter-toggle ${
            filtersOpen ? "active" : ""
          }`}
          onClick={() =>
            setFiltersOpen((value) => !value)
          }
          aria-expanded={filtersOpen}
        >
          ☰ {filtersOpen ? "Hide Filters" : "Show Filters"}
        </button>

        <p>
          Showing <strong>{filteredProducts.length}</strong> products
        </p>

        <label className="stepup-sort-label">
          Sort by

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
          >
            <option value="featured">Featured</option>
            <option value="price-low">
              Price: Low to High
            </option>
            <option value="price-high">
              Price: High to Low
            </option>
            <option value="rating">Top Rated</option>
          </select>
        </label>
      </div>

      <div
        className={`stepup-category-layout ${
          filtersOpen ? "filters-visible" : ""
        }`}
      >
        {filtersOpen && (
          <aside className="stepup-filters">
            <div className="stepup-filter-heading">
              <h2>Filters</h2>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear all
              </button>
            </div>

            <div className="stepup-filter-group">
              <label htmlFor="stepup-price">
                Maximum price: ₹{maxPrice}
              </label>

              <input
                id="stepup-price"
                type="range"
                min="500"
                max="2500"
                step="100"
                value={maxPrice}
                onChange={(event) =>
                  setMaxPrice(Number(event.target.value))
                }
              />
            </div>

            <div className="stepup-filter-group">
              <label htmlFor="stepup-rating">
                Customer rating
              </label>

              <select
                id="stepup-rating"
                value={minimumRating}
                onChange={(event) =>
                  setMinimumRating(event.target.value)
                }
              >
                <option value="all">All ratings</option>
                <option value="4">4 stars &amp; above</option>
                <option value="4.5">
                  4.5 stars &amp; above
                </option>
              </select>
            </div>

            {/* ACCORDION FILTERS */}
            {filterOptions.map((group) => {
              const isExpanded = expandedFilters.includes(
                group.title
              );

              return (
                <div
                  className="stepup-filter-group"
                  key={group.title}
                >
                  <button
                    type="button"
                    className="stepup-filter-section-button"
                    onClick={() =>
                      toggleFilterSection(group.title)
                    }
                    aria-expanded={isExpanded}
                  >
                    <h3>{group.title}</h3>

                    <span>{isExpanded ? "−" : "+"}</span>
                  </button>

                  {isExpanded && (
                    <div className="stepup-filter-options">
                      {group.values.length > 0 ? (
                        group.values.map((value) => (
                          <label
                            key={value}
                            className="stepup-filter-option"
                          >
                            <input
                              type="checkbox"
                              checked={group.selected.includes(value)}
                              onChange={() =>
                                toggleFilter(
                                  value,
                                  group.selected,
                                  group.setSelected
                                )
                              }
                            />

                            <span>{value}</span>
                          </label>
                        ))
                      ) : (
                        <p>No options available.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </aside>
        )}

        <section className="stepup-products-section">
          {loading ? (
            <div className="stepup-empty-products">
              <h2>Loading products...</h2>
            </div>
          ) : apiError ? (
            <div className="stepup-empty-products">
              <h2>{apiError}</h2>

              <button
                type="button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="stepup-empty-products">
              <span>♡</span>

              <h2>No products found</h2>

              <p>
                Try changing your filters or add products to your wishlist.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Show all products
              </button>
            </div>
          ) : (
            <div className="stepup-products-grid">
              {filteredProducts.map((product) => (
                <article
                  className="stepup-product-card"
                  key={product.id}
                  onClick={() => openProduct(product)}
                >
                  <div className="stepup-product-image">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    ) : (
                      <div className="stepup-image-placeholder">
                        {product.imageName}
                      </div>
                    )}

                    <span className="stepup-sale-badge">
                      {product.originalPrice > 0
                        ? Math.round(
                            ((product.originalPrice -
                              product.price) /
                              product.originalPrice) *
                              100
                          )
                        : 0}
                      % OFF
                    </span>

                    <HeartButton
                      active={isWishlisted(product)}
                      onClick={() =>
                        toggleWishlist(product)
                      }
                    />
                  </div>

                  <div className="stepup-product-info">
                    <p className="stepup-product-category">
                      {product.category} / {product.style}
                    </p>

                    <h3>{product.name}</h3>

                    <p className="stepup-product-rating">
                      <span>★</span> {product.rating} (
                      {product.reviewCount} reviews)
                    </p>

                    <div className="stepup-product-prices">
                      <strong>₹{product.price}</strong>
                      <del>₹{product.originalPrice}</del>
                    </div>

                    <p className="stepup-offer-text">
                      Save ₹
                      {product.originalPrice - product.price}
                    </p>

                    <button
                      type="button"
                      className="stepup-view-product"
                      onClick={(event) => {
                        event.stopPropagation();
                        openProduct(product);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div
          className="stepup-detail-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <section
            className="stepup-product-details"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="stepup-close-details"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close product details"
            >
              ×
            </button>

            <div className="stepup-detail-image">
              {selectedProduct.image ? (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                />
              ) : (
                <div className="stepup-image-placeholder">
                  {selectedProduct.imageName}
                </div>
              )}

              <HeartButton
                active={isWishlisted(selectedProduct)}
                onClick={() =>
                  toggleWishlist(selectedProduct)
                }
              />
            </div>

            <div className="stepup-detail-content">
              <p className="stepup-category-eyebrow">
                {selectedProduct.category} COLLECTION
              </p>

              <h2>{selectedProduct.name}</h2>

              <p className="stepup-product-rating">
                <span>★</span> {selectedProduct.rating} (
                {selectedProduct.reviewCount} reviews)
              </p>

              <div className="stepup-product-prices stepup-detail-prices">
                <strong>₹{selectedProduct.price}</strong>
                <del>₹{selectedProduct.originalPrice}</del>

                <span>
                  {selectedProduct.originalPrice > 0
                    ? Math.round(
                        ((selectedProduct.originalPrice -
                          selectedProduct.price) /
                          selectedProduct.originalPrice) *
                          100
                      )
                    : 0}
                  % OFF
                </span>
              </div>

              <p className="stepup-offer-text">
                You save ₹
                {selectedProduct.originalPrice -
                  selectedProduct.price}
              </p>

              <p className="stepup-detail-description">
                {selectedProduct.description}
              </p>

              <div className="stepup-detail-option">
                <h3>Choose size (UK)</h3>

                <div className="stepup-size-options">
                  {selectedProduct.sizes.map((size) => (
                    <button
                      type="button"
                      key={size}
                      className={
                        selectedSize === size ? "selected" : ""
                      }
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="stepup-detail-option">
                <h3>Choose colour: {selectedColor}</h3>

                <div className="stepup-color-options">
                  {selectedProduct.colors.map((color) => (
                    <button
                      type="button"
                      key={color}
                      className={`stepup-colour-choice ${
                        selectedColor === color ? "selected" : ""
                      }`}
                      onClick={() => setSelectedColor(color)}
                    >
                      <span
                        className={`stepup-color-dot stepup-color-${color.toLowerCase()}`}
                      />
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="stepup-detail-option">
                <h3>Quantity</h3>

                <div className="stepup-quantity-control">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) =>
                        Math.max(1, value - 1)
                      )
                    }
                  >
                    −
                  </button>

                  <span>{quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) =>
                        Math.min(10, value + 1)
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="stepup-detail-actions">
                <ActionButton
                  className="stepup-add-cart"
                  onClick={() =>
                    handleAddToCart(selectedProduct)
                  }
                >
                  Add to Cart
                </ActionButton>

                <ActionButton
                  className="stepup-buy-now"
                  onClick={() =>
                    handleBuyNow(selectedProduct)
                  }
                >
                  Buy Now
                </ActionButton>
              </div>

              {/* PRODUCT TABS */}
              <div className="stepup-product-tabs">
                <div className="stepup-tab-buttons">
                  <button
                    type="button"
                    className={
                      activeTab === "details" ? "active" : ""
                    }
                    onClick={() => setActiveTab("details")}
                  >
                    Details
                  </button>

                  <button
                    type="button"
                    className={
                      activeTab === "specifications" ? "active" : ""
                    }
                    onClick={() =>
                      setActiveTab("specifications")
                    }
                  >
                    Specifications
                  </button>

                  <button
                    type="button"
                    className={
                      activeTab === "reviews" ? "active" : ""
                    }
                    onClick={() => setActiveTab("reviews")}
                  >
                    Reviews ({reviews.length})
                  </button>
                </div>

                {activeTab === "details" && (
                  <div className="stepup-tab-content">
                    <h3>Product Details</h3>

                    <p>{selectedProduct.description}</p>

                    <p>
                      Suitable for everyday use. Please check the
                      size before placing your order.
                    </p>
                  </div>
                )}

                {activeTab === "specifications" && (
                  <div className="stepup-tab-content">
                    <h3>Specifications</h3>

                    <table className="stepup-specifications-table">
                      <tbody>
                        {selectedProduct.specifications.map(
                          ([label, value]) => (
                            <tr key={label}>
                              <th>{label}</th>
                              <td>{value}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="stepup-tab-content">
                    <h3>Customer Reviews</h3>

                    <label className="stepup-review-sort">
                      Sort reviews

                      <select
                        value={reviewSort}
                        onChange={(event) =>
                          setReviewSort(event.target.value)
                        }
                      >
                        <option value="newest">
                          Newest first
                        </option>

                        <option value="oldest">
                          Oldest first
                        </option>
                      </select>
                    </label>

                    {reviewsLoading ? (
                      <p>Loading customer reviews...</p>
                    ) : reviewError && reviews.length === 0 ? (
                      <p>{reviewError}</p>
                    ) : productReviews.length === 0 ? (
                      <p>
                        No customer reviews yet. Be the first to
                        review!
                      </p>
                    ) : (
                      <div className="stepup-reviews-list">
                        {productReviews.map((review) => (
                          <article
                            className="stepup-review-card"
                            key={review.id}
                          >
                            <div className="stepup-review-header">
                              <strong>
                                {review.user_name || "Customer"}
                              </strong>

                              <span>
                                {"★".repeat(
                                  Number(review.rating) || 0
                                )}
                              </span>
                            </div>

                            <h4>{review.title}</h4>

                            <p>{review.comment}</p>

                            <small>
                              {review.created_at
                                ? new Date(
                                    review.created_at
                                  ).toLocaleDateString()
                                : ""}
                            </small>
                          </article>
                        ))}
                      </div>
                    )}

                    <form
                      className="stepup-review-form"
                      onSubmit={submitReview}
                    >
                      <h3>Write a Review</h3>

                      <label>Your rating</label>

                      <div className="stepup-review-rating-picker">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            type="button"
                            key={rating}
                            className={
                              rating <= reviewRating
                                ? "selected"
                                : ""
                            }
                            onClick={() =>
                              setReviewRating(rating)
                            }
                            aria-label={`${rating} stars`}
                          >
                            ★
                          </button>
                        ))}
                      </div>

                      <label htmlFor="stepup-review-title">
                        Review title
                      </label>

                      <input
                        id="stepup-review-title"
                        value={reviewTitle}
                        onChange={(event) =>
                          setReviewTitle(event.target.value)
                        }
                        placeholder="Give your review a title"
                        maxLength={150}
                        required
                      />

                      <label htmlFor="stepup-review-text">
                        Your review
                      </label>

                      <textarea
                        id="stepup-review-text"
                        value={reviewText}
                        onChange={(event) =>
                          setReviewText(event.target.value)
                        }
                        placeholder="Share your experience with this shoe..."
                        rows={4}
                        maxLength={1000}
                        required
                      />

                      {reviewError && (
                        <p className="stepup-review-error">
                          {reviewError}
                        </p>
                      )}

                      <ActionButton
                        type="submit"
                        className="stepup-submit-review"
                        disabled={reviewSubmitting}
                      >
                        {reviewSubmitting
                          ? "Submitting..."
                          : "Submit Review"}
                      </ActionButton>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}




import { useState, useEffect } from "react";
import "./ProductDetails.css";

function ProductDetails({
  product,
  onBack,
  onAddToCart,
  onBuyNow,
}) {
  const [selectedSize, setSelectedSize] = useState("UK 8");
  const [selectedColor, setSelectedColor] = useState("Black");
  const [quantity, setQuantity] = useState(1);

  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const [isWishlisted, setIsWishlisted] = useState(false);

  // SAVE RECENTLY VIEWED PRODUCTS
  useEffect(() => {
    if (!product?.id) return;

    try {
      const savedProducts = JSON.parse(
        localStorage.getItem("stepup_recently_viewed") || "[]"
      );

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

      window.dispatchEvent(new Event("recentlyViewedUpdated"));
    } catch (error) {
      console.error(
        "Unable to save recently viewed product:",
        error
      );
    }
  }, [product?.id]);

  // LOAD WISHLIST STATUS
  useEffect(() => {
    if (!product?.id) {
      setIsWishlisted(false);
      return;
    }

    try {
      const savedWishlist = JSON.parse(
        localStorage.getItem("stepup_wishlist") || "[]"
      );

      setIsWishlisted(
        savedWishlist.some(
          (item) => String(item.id) === String(product.id)
        )
      );
    } catch {
      setIsWishlisted(false);
    }
  }, [product?.id]);

  // ADD OR REMOVE FROM WISHLIST
  function handleWishlist() {
    if (!product) return;

    try {
      const savedWishlist = JSON.parse(
        localStorage.getItem("stepup_wishlist") || "[]"
      );

      const alreadyAdded = savedWishlist.some(
        (item) => String(item.id) === String(product.id)
      );

      const updatedWishlist = alreadyAdded
        ? savedWishlist.filter(
            (item) => String(item.id) !== String(product.id)
          )
        : [...savedWishlist, product];

      localStorage.setItem(
        "stepup_wishlist",
        JSON.stringify(updatedWishlist)
      );

      setIsWishlisted(!alreadyAdded);

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch {
      alert("Unable to update wishlist. Please try again.");
    }
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <p>Product not found.</p>

        <button
          type="button"
          className="pd-back-button"
          onClick={onBack}
        >
          Back to shopping
        </button>
      </div>
    );
  }

  const discount = product.oldPrice
    ? Math.round(
        (1 - product.price / product.oldPrice) * 100
      )
    : 0;

  // ADD SELECTED PRODUCT TO CART
  function handleAddToCart() {
    if (typeof onAddToCart !== "function") {
      return;
    }

    for (let i = 0; i < quantity; i++) {
      onAddToCart({
        ...product,
        selectedSize,
        selectedColor,
      });
    }
  }

  // BUY NOW
  function handleBuyNow() {
    if (typeof onBuyNow === "function") {
      onBuyNow({
        ...product,
        quantity,
        selectedSize,
        selectedColor,
      });
      return;
    }

    if (typeof onAddToCart === "function") {
      for (let i = 0; i < quantity; i++) {
        onAddToCart({
          ...product,
          selectedSize,
          selectedColor,
        });
      }

      alert(
        "Product added to cart. Checkout navigation is not connected yet."
      );
    }
  }

  // SUBMIT REVIEW
  function handleReviewSubmit(event) {
    event.preventDefault();

    if (!reviewName.trim() || !reviewText.trim()) {
      return;
    }

    const newReview = {
      id: Date.now(),
      name: reviewName.trim(),
      text: reviewText.trim(),
      rating: 5,
    };

    setReviews((previousReviews) => [
      newReview,
      ...previousReviews,
    ]);

    setReviewName("");
    setReviewText("");
    setReviewSuccess(true);
  }

  return (
    <main className="product-detail-page">

      {/* BACK TO SHOPPING */}
      <button
        type="button"
        className="pd-back-button"
        onClick={onBack}
      >
        ← Back to shopping
      </button>

      {/* PRODUCT DETAILS */}
      <section className="pd-main">

        <div className="pd-image-panel">

          {product.offer && (
            <span className="pd-sale-badge">SALE</span>
          )}

          {/* WISHLIST BUTTON */}
          <button
            type="button"
            className={`pd-wishlist-button ${
              isWishlisted ? "wishlisted" : ""
            }`}
            onClick={handleWishlist}
            aria-label={
              isWishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            aria-pressed={isWishlisted}
            title={
              isWishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
          >
            {isWishlisted ? "♥" : "♡"}
          </button>

          <img
            className="pd-main-image"
            src={product.image}
            alt={product.name}
          />

        </div>

        <div className="pd-info">

          <p className="pd-eyebrow">
            {product.brand} · {product.type}
          </p>

          <h1>{product.name}</h1>

          <p className="pd-rating">
            ★★★★★
            <span> New product listing</span>
          </p>

          {/* PRICE */}
          <div className="pd-price-line">

            <strong>
              ₹{Number(product.price).toLocaleString("en-IN")}
            </strong>

            {product.oldPrice && (
              <>
                <del>
                  ₹{Number(product.oldPrice).toLocaleString("en-IN")}
                </del>

                {discount > 0 && (
                  <span className="pd-discount">
                    {discount}% OFF
                  </span>
                )}
              </>
            )}

          </div>

          <p className="pd-description">
            {product.description}
          </p>

          {/* COLOUR SELECTION */}
          <div className="pd-option-block">

            <h3>
              Colour: <span>{selectedColor}</span>
            </h3>

            <div className="pd-colors">

              {["Black", "White", "Blue"].map((color) => (
                <button
                  type="button"
                  key={color}
                  className={`pd-color-option ${
                    selectedColor === color ? "selected" : ""
                  }`}
                  onClick={() => setSelectedColor(color)}
                  aria-pressed={selectedColor === color}
                >
                  <span
                    className={`pd-color-dot ${color.toLowerCase()}`}
                  />
                  {color}
                </button>
              ))}

            </div>
          </div>

          {/* SIZE SELECTION */}
          <div className="pd-option-block">

            <h3>Choose Size</h3>

            <div className="pd-sizes">

              {["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"].map(
                (size) => (
                  <button
                    type="button"
                    key={size}
                    className={
                      selectedSize === size ? "selected" : ""
                    }
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={selectedSize === size}
                  >
                    {size}
                  </button>
                )
              )}

            </div>
          </div>

          {/* QUANTITY */}
          <div className="pd-quantity-row">

            <span>Quantity</span>

            <div className="pd-quantity-control">

              <button
                type="button"
                onClick={() =>
                  setQuantity((current) =>
                    Math.max(1, current - 1)
                  )
                }
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((current) =>
                    Math.min(10, current + 1)
                  )
                }
                aria-label="Increase quantity"
              >
                +
              </button>

            </div>
          </div>

          <p className="pd-selection-note">
            Selected size: {selectedSize} | Colour: {selectedColor}
          </p>

          {/* ADD TO CART AND BUY NOW */}
          <div className="pd-action-buttons">

            <button
              type="button"
              className="pd-add-button"
              onClick={handleAddToCart}
            >
              Add to Cart · ₹
              {(Number(product.price) * quantity).toLocaleString("en-IN")}
            </button>

            <button
              type="button"
              className="pd-buy-now-button"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>

          </div>

          <p className="pd-demo-note">
            Size and colour selections are currently for display.
            Stock availability requires backend integration.
          </p>

        </div>
      </section>

      {/* PRODUCT SPECIFICATIONS */}
      <section className="pd-specifications">

        <h2>Product Specifications</h2>

        <p>{product.description}</p>

        <div className="pd-spec-table">

          <div>
            <span>Product Name</span>
            <strong>{product.name}</strong>
          </div>

          <div>
            <span>Brand</span>
            <strong>{product.brand || "Not specified"}</strong>
          </div>

          <div>
            <span>Category</span>
            <strong>{product.category || "Not specified"}</strong>
          </div>

          <div>
            <span>Product Type</span>
            <strong>{product.type || "Not specified"}</strong>
          </div>

          <div>
            <span>Product ID</span>
            <strong>
              SU-{String(product.id).padStart(4, "0")}
            </strong>
          </div>

          <div>
            <span>Price</span>
            <strong>
              ₹{Number(product.price).toLocaleString("en-IN")}
            </strong>
          </div>

          <div>
            <span>Selected Size</span>
            <strong>{selectedSize}</strong>
          </div>

          <div>
            <span>Selected Colour</span>
            <strong>{selectedColor}</strong>
          </div>

          <div>
            <span>Quantity</span>
            <strong>{quantity}</strong>
          </div>

          <div>
            <span>Total Price</span>
            <strong>
              ₹{(
                Number(product.price) * quantity
              ).toLocaleString("en-IN")}
            </strong>
          </div>

        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="pd-reviews">

        <h2>Customer Reviews</h2>

        <p className="pd-review-caption">
          Share your feedback about this product.
          Reviews are temporary until a backend is connected.
        </p>

        <form
          className="pd-review-form"
          onSubmit={handleReviewSubmit}
        >

          <input
            type="text"
            placeholder="Enter your name"
            value={reviewName}
            onChange={(event) => {
              setReviewName(event.target.value);
              setReviewSuccess(false);
            }}
            required
          />

          <textarea
            placeholder="Write your review..."
            value={reviewText}
            onChange={(event) => {
              setReviewText(event.target.value);
              setReviewSuccess(false);
            }}
            rows={4}
            required
          />

          <button type="submit">
            Submit Review
          </button>

        </form>

        {/* SUCCESS MESSAGE */}
        {reviewSuccess && (
          <p className="pd-review-success" role="status">
            ✓ Successfully submitted! Your review has been added.
          </p>
        )}

        {/* REVIEW LIST */}
        <div className="pd-review-list">

          {reviews.length === 0 ? (
            <p className="pd-no-reviews">
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            reviews.map((review) => (
              <article
                className="pd-review-card"
                key={review.id}
              >
                <p className="pd-review-stars">
                  {"★".repeat(review.rating)}
                </p>

                <strong>{review.name}</strong>

                <p>{review.text}</p>
              </article>
            ))
          )}

        </div>
      </section>

    </main>
  );
}

export default ProductDetails;

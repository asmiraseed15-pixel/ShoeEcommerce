

import { useEffect, useState } from "react";
import "./Wishlist.css";

export default function Wishlist({ onBack, onAddToCart }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("stepup_wishlist") || "[]"
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("stepup_wishlist", JSON.stringify(items));

    window.dispatchEvent(
      new Event("stepup-wishlist-updated")
    );
  }, [items]);

  function removeItem(product) {
    setItems((previous) =>
      previous.filter(
        (item) =>
          String(item.id ?? item.name) !==
          String(product.id ?? product.name)
      )
    );
  }

  function addToCart(product) {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      alert("Cart connection needs to be added in App.jsx.");
    }
  }

  return (
    <main className="wishlist-page">
      <div className="wishlist-heading">
        <div>
          <p className="wishlist-label">YOUR COLLECTION</p>

          <h1>My Wishlist ♡</h1>

          <p className="wishlist-subtitle">
            Your favourite shoes, all in one place.
          </p>
        </div>

        <button
          className="wishlist-back"
          onClick={onBack}
        >
          ← Continue Shopping
        </button>
      </div>

      {items.length === 0 ? (
        <section className="wishlist-empty">
          <div className="wishlist-empty-heart">♡</div>

          <h2>Your wishlist is empty</h2>

          <p>
            Save the shoes you love and find them here anytime.
          </p>

          <button
            className="wishlist-primary"
            onClick={onBack}
          >
            Explore Shoes
          </button>
        </section>
      ) : (
        <>
          <p className="wishlist-count">
            {items.length} saved{" "}
            {items.length === 1 ? "item" : "items"}
          </p>

          <div className="wishlist-grid">
            {items.map((product, index) => (
              <article
                className="wishlist-card"
                key={product.id ?? product.name ?? index}
              >
                <div className="wishlist-image-wrap">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name || "Shoe"}
                      className="wishlist-image"
                    />
                  ) : (
                    <div className="wishlist-image">
                      Shoe Image
                    </div>
                  )}

                  <button
                    className="wishlist-remove"
                    title="Remove from wishlist"
                    aria-label={`Remove ${product.name || "product"}`}
                    onClick={() => removeItem(product)}
                  >
                    ×
                  </button>
                </div>

                <div className="wishlist-info">
                  <p className="wishlist-category">
                    {product.category || "Shoes"}
                  </p>

                  <h3>{product.name || "Shoe"}</h3>

                  <p className="wishlist-price">
                    ₹
                    {Number(product.price || 0).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <button
                    className="wishlist-primary wishlist-cart-button"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>

                  <button
                    className="wishlist-text-button"
                    onClick={() => removeItem(product)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

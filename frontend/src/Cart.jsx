
import { useEffect, useState } from "react";
import "./Cart.css";

export default function Cart({ onBack, onCheckout }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("stepup_cart") || "[]");
    } catch {
      return [];
    }
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    const syncCart = () => {
      try {
        setItems(JSON.parse(localStorage.getItem("stepup_cart") || "[]"));
      } catch {
        setItems([]);
      }
    };

    window.addEventListener("stepup-cart-updated", syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener("stepup-cart-updated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  function updateCart(updatedItems) {
    setItems(updatedItems);
    localStorage.setItem("stepup_cart", JSON.stringify(updatedItems));
    window.dispatchEvent(new Event("stepup-cart-updated"));
  }

  function changeQuantity(cartId, amount) {
    updateCart(
      items.map((item) =>
        item.cartId === cartId
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) + amount) }
          : item
      )
    );
  }

  function removeItem(cartId) {
    updateCart(items.filter((item) => item.cartId !== cartId));
  }

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const delivery = subtotal === 0 || subtotal >= 1999 ? 0 : 99;
  const total = subtotal + delivery;

  return (
    <main className="cart-page">
      <button className="cart-back" onClick={onBack}>
        ← Continue Shopping
      </button>

      <h1>My Shopping Cart</h1>
      <p className="cart-subtitle">
        Review your shoes before placing your order.
      </p>

      <div className="cart-layout">
        <section className="cart-products">
          {items.length === 0 ? (
            <div className="empty-cart">
              <span className="empty-cart-icon">🛒</span>
              <h2>Your cart is empty</h2>
              <p>Find your perfect pair and add it to your cart.</p>
              <button onClick={onBack}>Shop Now</button>
            </div>
          ) : (
            items.map((item, index) => {
              const cartId =
                item.cartId ||
                `${item.id ?? item.name}-${item.selectedSize || item.size || "UK 8"}-${item.selectedColor || "Black"}`;

              return (
                <article className="cart-item" key={cartId}>
                  <img
                    className="cart-product-image"
                    src={item.image}
                    alt={item.name || item.title || "Shoe"}
                  />

                  <div className="cart-product-info">
                    <h3>{item.name || item.title}</h3>
                    <p className="cart-brand">{item.brand || "StepUp Collection"}</p>
                    <p>Size: {item.selectedSize || item.size || "UK 8"}</p>
                    <p>Colour: {item.selectedColor || "Black"}</p>

                    <strong className="cart-item-price">
                      ₹{Number(item.price || 0).toLocaleString("en-IN")}
                    </strong>

                    <div className="cart-item-actions">
                      <div className="cart-quantity">
                        <button onClick={() => changeQuantity(cartId, -1)}>−</button>
                        <span>{item.quantity || 1}</span>
                        <button onClick={() => changeQuantity(cartId, 1)}>+</button>
                      </div>

                      <button
                        className="cart-remove"
                        onClick={() => removeItem(cartId)}
                        aria-label={`Remove ${item.name || "product"}`}
                      >
                        🗑 Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}

          {items.length > 0 && (
            <>
              <div className="cart-info-card">
                <h3>🚚 Expected Delivery</h3>
                <p>
                  Estimated delivery date will be confirmed after your
                  delivery address is entered at checkout.
                </p>
              </div>

              <div className="cart-info-card">
                <h3>↩ Delivery & Returns</h3>
                <p>
                  Check the product's return eligibility and applicable
                  delivery charges before placing your order.
                </p>
              </div>
            </>
          )}
        </section>

        <aside className="cart-summary">
          <h2>Order Summary</h2>

          <div className="cart-summary-row">
            <span>Items ({items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)})</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>

          <div className="cart-summary-row">
            <span>Delivery</span>
            <span>{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
          </div>

          <p className="cart-delivery-note">
            {subtotal >= 1999
              ? "You've unlocked free delivery!"
              : "Free delivery on orders of ₹1,999 or more."}
          </p>

          <div className="cart-offer">
            <strong>🎉 Special Shopping Offer</strong>
            <p>
              Look for available offers at checkout. Any discount will be
              applied only when a valid promotion is configured.
            </p>
          </div>

          <div className="cart-total-row">
            <strong>Total Amount</strong>
            <strong>₹{total.toLocaleString("en-IN")}</strong>
          </div>

          <button
            className="cart-checkout"
            disabled={items.length === 0}
            onClick={() =>
              typeof onCheckout === "function"
                ? onCheckout({ items, paymentMethod, subtotal, delivery, total })
                : alert("Checkout page is not connected yet.")
            }
          >
            🔒 Checkout Securely
          </button>

          <h3 className="express-title">Express Checkout</h3>
          <p className="express-subtitle">Choose your preferred payment method.</p>

          <div className="payment-options">
            {[
              ["COD", "Cash on Delivery"],
              ["CARD", "Card Payment"],
              ["NETBANKING", "Net Banking"],
              ["GPAY", "Google Pay"],
              ["PHONEPE", "PhonePe"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={`payment-option ${paymentMethod === value ? "active" : ""}`}
                onClick={() => setPaymentMethod(value)}
                aria-pressed={paymentMethod === value}
              >
                <span className="payment-radio">
                  {paymentMethod === value ? "●" : "○"}
                </span>
                {label}
              </button>
            ))}
          </div>

          <p className="cart-secure-note">
            🔒 Secure checkout · Payment options are selections only until
            connected to a real checkout/payment gateway.
          </p>
        </aside>
      </div>
    </main>
  );
}


import React from "react";
import "./OrderDetails.css";

export default function OrderDetails({ order, onBack }) {
  if (!order) {
    return (
      <main className="order-details-page">
        <h2>Order details not available.</h2>
        <button onClick={onBack}>Back</button>
      </main>
    );
  }

  const items = order.items || [];
  const fullName =
    order.fullName ||
    `${order.firstName || ""} ${order.lastName || ""}`.trim();

  const subtotal =
    order.subtotal ??
    items.reduce(
      (sum, item) =>
        sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );

  const delivery =
    order.delivery ?? (subtotal >= 1999 ? 0 : 99);

  const total = order.total ?? subtotal + delivery;

  const orderDate = order.orderDate
    ? new Date(order.orderDate).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not available";

  return (
    <main className="order-details-page">
      <div className="order-details-container">

        <button className="order-back-button" onClick={onBack}>
          ← Back to Order Confirmation
        </button>

        <div className="order-details-heading">
          <p>STEPUP ORDER INFORMATION</p>
          <h1>Order Details</h1>
          <span>Thank you for shopping with StepUp!</span>
        </div>

        <section className="order-info-card">
          <div>
            <small>Order ID</small>
            <strong>{order.orderId}</strong>
          </div>

          <div>
            <small>Order Date</small>
            <strong>{orderDate}</strong>
          </div>

          <div>
            <small>Order Status</small>
            <strong className="order-status">
              {order.status || "Confirmed"}
            </strong>
          </div>
        </section>

        <section className="order-details-card">
          <h2>Ordered Products</h2>

          {items.length === 0 ? (
            <p>No products found in this order.</p>
          ) : (
            <div className="ordered-products-list">
              {items.map((item, index) => (
                <div
                  className="ordered-product"
                  key={item.cartId || item.id || index}
                >
                  <div className="ordered-product-image">
                    <img
                      src={item.image}
                      alt={item.name || item.title || "Shoe"}
                    />
                  </div>

                  <div className="ordered-product-info">
                    <h3>{item.name || item.title || "StepUp Shoe"}</h3>

                    <p>{item.brand || "StepUp Collection"}</p>

                    <div className="ordered-product-meta">
                      <span>
                        Size: {item.selectedSize || item.size || "UK 8"}
                      </span>

                      <span>
                        Colour: {item.selectedColor || item.color || "Black"}
                      </span>

                      <span>
                        Quantity: {item.quantity || 1}
                      </span>
                    </div>

                    <strong>
                      ₹
                      {(
                        Number(item.price || 0) *
                        Number(item.quantity || 1)
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="ordered-product-price">
                    ₹{Number(item.price || 0).toLocaleString("en-IN")}
                    <small>per item</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="order-details-grid">

          <section className="order-details-card">
            <h2>Delivery Address</h2>

            <div className="order-address">
              <strong>{fullName || "Customer"}</strong>
              <p>{order.address || "Address not available"}</p>
              <p>
                {[order.city, order.state, order.pincode]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              {order.landmark && (
                <p>Landmark: {order.landmark}</p>
              )}

              <p>Phone: {order.phone || "Not available"}</p>
              <p>Email: {order.email || "Not available"}</p>
            </div>
          </section>

          <section className="order-details-card">
            <h2>Payment Information</h2>

            <div className="order-payment-info">
              <div>
                <span>Payment Method</span>
                <strong>{order.paymentMethod || "COD"}</strong>
              </div>

              <div>
                <span>Payment Status</span>
                <strong>{order.paymentStatus || "Pending"}</strong>
              </div>

              {order.paymentMethod === "NETBANKING" && order.bank && (
                <div>
                  <span>Bank</span>
                  <strong>{order.bank}</strong>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="order-details-card order-total-card">
          <h2>Price Summary</h2>

          <div>
            <span>Subtotal</span>
            <strong>₹{Number(subtotal).toLocaleString("en-IN")}</strong>
          </div>

          <div>
            <span>Delivery Fee</span>
            <strong>
              {delivery === 0
                ? "Free"
                : `₹${Number(delivery).toLocaleString("en-IN")}`}
            </strong>
          </div>

          <div className="order-grand-total">
            <span>Total Amount</span>
            <strong>₹{Number(total).toLocaleString("en-IN")}</strong>
          </div>
        </section>

        <div className="order-details-footer">
          <p>Thank you for choosing StepUp.</p>
          <span>Walk your way. Own your style.</span>
        </div>

      </div>
    </main>
  );
}

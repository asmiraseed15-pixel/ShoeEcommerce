

import React, { useState } from "react";
import "./OrderSuccess.css";
import DeliveryMap from "./DeliveryMap";

export default function OrderSuccess({ order }) {
  const [currentView, setCurrentView] = useState("success");

  // ORDER INFORMATION
  const orderId = order?.orderId || "N/A";
  const items = order?.items || [];

  const subtotal = Number(order?.subtotal || 0);
  const delivery = Number(order?.delivery || order?.deliveryFee || 0);
  const total = Number(order?.total || subtotal + delivery);

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  // DELIVERY ADDRESS
  const address = [
    order?.address,
    order?.city,
    order?.state,
    order?.postal_code || order?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  // PAYMENT & ORDER STATUS
  const paymentMethod = order?.paymentMethod || "Not specified";
  const paymentStatus = order?.paymentStatus || "Pending";
  const orderStatus = order?.status || "Confirmed";

  // ORDER DATE
  const orderDateText = order?.orderDate
    ? new Date(order.orderDate).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not available";

  // ESTIMATED DELIVERY
  const estimatedDate = order?.estimatedDelivery
    ? new Date(order.estimatedDelivery)
    : order?.orderDate
      ? new Date(
          new Date(order.orderDate).getTime() +
            5 * 24 * 60 * 60 * 1000
        )
      : null;

  const estimatedDeliveryText =
    estimatedDate && !Number.isNaN(estimatedDate.getTime())
      ? estimatedDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "Will be updated soon";

  // TRACKING STAGES
  const trackingStages = [
    "Order Placed",
    "Packed",
    "Dispatched",
    "In Transit",
    "Out for Delivery",
    "Delivered",
  ];

  const statusText = String(orderStatus).toLowerCase();

  const statusIndex =
    statusText.includes("out for delivery")
      ? 4
      : statusText.includes("delivered")
        ? 5
        : statusText.includes("transit")
          ? 3
          : statusText.includes("dispatch") ||
              statusText.includes("shipped")
            ? 2
            : statusText.includes("pack")
              ? 1
              : 0;

  // INVOICE TEXT
  const getBillText = () => `
STEPUP - ORDER INVOICE

Order ID: ${orderId}
Order Date: ${orderDateText}

PRODUCTS
${items
  .map(
    (item, index) => `
${index + 1}. ${item.name || item.title || item.productName || "Product"}
Size: ${item.size || item.selectedSize || "N/A"}
Colour: ${item.color || item.selectedColor || "N/A"}
Quantity: ${item.quantity || 1}
Price: ${formatPrice(
      Number(item.price || 0) * Number(item.quantity || 1)
    )}
`
  )
  .join("\n")}

Subtotal: ${formatPrice(subtotal)}
Delivery Fee: ${formatPrice(delivery)}
TOTAL: ${formatPrice(total)}

Payment Method: ${paymentMethod}
Payment Status: ${paymentStatus}
Order Status: ${orderStatus}

DELIVERY ADDRESS
${order?.fullName || ""}
${order?.phone || ""}
${address || ""}

Thank you for shopping with StepUp!
`;

  // SHARE INVOICE - WHATSAPP
  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(getBillText())}`,
      "_blank"
    );
  };

  // SHARE INVOICE - EMAIL
  const shareEmail = () => {
    const subject = encodeURIComponent(
      `StepUp Order Invoice - ${orderId}`
    );

    const body = encodeURIComponent(getBillText());

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // PRINT INVOICE
  const printBill = () => {
    window.print();
  };

  // PRODUCT IMAGE
  const getProductImage = (item) =>
    item.image || item.imageUrl || item.thumbnail;

  // PRODUCT NAME
  const getProductName = (item) =>
    item.name || item.title || item.productName || "Product";

  // =====================================
  // ORDER DETAILS PAGE
  // =====================================

  if (currentView === "details") {
    return (
      <main className="order-success-page order-details-page">
        <div className="order-details-container">

          <button
            type="button"
            className="order-back-btn"
            onClick={() => setCurrentView("success")}
          >
            ← Back
          </button>

          <h1>Order Details</h1>

          <p className="order-details-subtitle">
            Thank you for shopping with StepUp!
          </p>

          {/* ORDER INFORMATION */}

          <div className="order-details-card">
            <h2>Order Information</h2>

            <p>
              <span>Order ID</span>
              <strong>#{orderId}</strong>
            </p>

            <p>
              <span>Order Date</span>
              <strong>{orderDateText}</strong>
            </p>

            <p>
              <span>Order Status</span>
              <strong>{orderStatus}</strong>
            </p>
          </div>

          {/* PRODUCTS */}

          <div className="order-details-card">
            <h2>Products Ordered</h2>

            {items.length > 0 ? (
              items.map((item, index) => {
                const name = getProductName(item);
                const image = getProductImage(item);
                const quantity = Number(item.quantity || 1);
                const price = Number(item.price || 0);

                return (
                  <div
                    className="order-detail-product"
                    key={item.id || index}
                  >
                    {image ? (
                      <img src={image} alt={name} />
                    ) : (
                      <div className="order-detail-no-image">
                        No Image
                      </div>
                    )}

                    <div className="order-detail-product-info">
                      <h3>{name}</h3>

                      <p>
                        Size: {item.size || item.selectedSize || "N/A"}
                      </p>

                      <p>
                        Colour: {item.color || item.selectedColor || "N/A"}
                      </p>

                      <p>Quantity: {quantity}</p>

                      <p>Price: {formatPrice(price)}</p>
                    </div>

                    <strong>
                      {formatPrice(price * quantity)}
                    </strong>
                  </div>
                );
              })
            ) : (
              <p>No product details available for this order.</p>
            )}
          </div>

          {/* PRICE SUMMARY */}

          <div className="order-details-card">
            <h2>Price Summary</h2>

            <p>
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </p>

            <p>
              <span>Delivery Fee</span>
              <strong>{formatPrice(delivery)}</strong>
            </p>

            <p className="order-total-row">
              <span>Total Amount</span>
              <strong>{formatPrice(total)}</strong>
            </p>
          </div>

          {/* PAYMENT INFORMATION */}

          <div className="order-details-card">
            <h2>Payment Information</h2>

            <p>
              <span>Payment Method</span>
              <strong>{paymentMethod}</strong>
            </p>

            <p>
              <span>Payment Status</span>
              <strong>{paymentStatus}</strong>
            </p>
          </div>

          {/* DELIVERY ADDRESS */}

          <div className="order-details-card">
            <h2>Delivery Address</h2>

            <p>
              <span>Full Name</span>
              <strong>{order?.fullName || "Not available"}</strong>
            </p>

            <p>
              <span>Phone</span>
              <strong>{order?.phone || "Not available"}</strong>
            </p>

            <p>
              <span>Address</span>
              <strong>{address || "Not available"}</strong>
            </p>
          </div>

          {/* SHARE BILL */}

          <div className="share-bill-section">
            <h2>Share Your Order Bill</h2>

            <p>
              Save or share your order invoice with others.
            </p>

            <div className="share-bill-buttons">

              <button
                type="button"
                onClick={shareWhatsApp}
                className="share-bill-btn whatsapp-btn"
              >
                <span>✆</span> WhatsApp
              </button>

              <button
                type="button"
                onClick={shareEmail}
                className="share-bill-btn email-btn"
              >
                <span>✉</span> Email
              </button>

              <button
                type="button"
                onClick={printBill}
                className="share-bill-btn print-btn"
              >
                <span>▤</span> Print / Save PDF
              </button>

            </div>
          </div>

        </div>
      </main>
    );
  }

  // =====================================
  // PROFESSIONAL TRACK ORDER PAGE
  // =====================================

  if (currentView === "track") {
    return (
      <main className="order-success-page order-details-page professional-track-page">

        <div className="order-details-container tracking-container">

          <button
            type="button"
            className="order-back-btn"
            onClick={() => setCurrentView("success")}
          >
            ← Back to Order
          </button>

          {/* TRACKING HEADER */}

          <div className="professional-track-header">

            <div>
              <span>STEPUP / ORDER TRACKING</span>

              <h1>Track Your Order</h1>

              <p>
                Stay updated on your shipment journey.
              </p>
            </div>

            <div className="professional-order-status">
              {orderStatus}
            </div>

          </div>

          {/* ORDER SUMMARY */}

          <div className="professional-track-summary">

            <div>
              <span>ORDER ID</span>
              <strong>#{orderId}</strong>
            </div>

            <div>
              <span>ORDER DATE</span>
              <strong>{orderDateText}</strong>
            </div>

            <div>
              <span>ESTIMATED DELIVERY</span>
              <strong>{estimatedDeliveryText}</strong>
            </div>

            <div>
              <span>TOTAL AMOUNT</span>
              <strong>{formatPrice(total)}</strong>
            </div>

          </div>

          {/* DELIVERY MAP */}

          <DeliveryMap />

          {/* SHIPMENT UPDATES */}

          <div className="professional-track-card">

            <div className="professional-section-heading">
              <div>
                <h2>Shipment Updates</h2>
                <p>Current progress of your order</p>
              </div>
            </div>

            <div className="professional-status-timeline">

              {trackingStages.map((stage, index) => {
                const completed = index < statusIndex;
                const current = index === statusIndex;

                return (
                  <div
                    key={stage}
                    className={`professional-status-step ${
                      completed ? "completed" : ""
                    } ${current ? "current" : ""}`}
                  >

                    <div className="professional-status-marker">

                      <div className="professional-status-circle">
                        {completed ? "✓" : index + 1}
                      </div>

                      {index !== trackingStages.length - 1 && (
                        <div className="professional-status-line"></div>
                      )}

                    </div>

                    <div className="professional-status-content">

                      <h3>{stage}</h3>

                      <p>
                        {completed
                          ? "Completed"
                          : current
                            ? "Your current order status"
                            : "Awaiting update"}
                      </p>

                      {current && (
                        <span className="professional-current-label">
                          CURRENT STATUS
                        </span>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>

            <p className="professional-tracking-note">
              Actual shipment dates and automatic status updates will be
              available after backend integration.
            </p>

          </div>

          {/* ORDERED PRODUCTS */}

          <div className="professional-track-card">

            <div className="professional-section-heading">
              <div>
                <h2>Ordered Products</h2>
                <p>{items.length} product(s) in this shipment</p>
              </div>
            </div>

            {items.length > 0 ? (
              items.map((item, index) => {
                const name = getProductName(item);
                const image = getProductImage(item);
                const quantity = Number(item.quantity || 1);
                const price = Number(item.price || 0);

                return (
                  <div
                    className="professional-order-product"
                    key={item.id || index}
                  >

                    {image ? (
                      <img src={image} alt={name} />
                    ) : (
                      <div className="professional-product-placeholder">
                        No Image
                      </div>
                    )}

                    <div className="professional-product-details">

                      <h3>{name}</h3>

                      <p>
                        Size: {item.size || item.selectedSize || "N/A"}
                      </p>

                      <p>
                        Colour: {item.color || item.selectedColor || "N/A"}
                      </p>

                      <p>Quantity: {quantity}</p>

                    </div>

                    <strong>
                      {formatPrice(price * quantity)}
                    </strong>

                  </div>
                );
              })
            ) : (
              <p>No product details available.</p>
            )}

          </div>

          {/* PAYMENT DETAILS */}

          <div className="professional-track-card">

            <h2>Payment Details</h2>

            <div className="professional-track-detail-row">
              <span>Payment Method</span>
              <strong>{paymentMethod}</strong>
            </div>

            <div className="professional-track-detail-row">
              <span>Payment Status</span>
              <strong>{paymentStatus}</strong>
            </div>

            <div className="professional-track-detail-row">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            <div className="professional-track-detail-row">
              <span>Delivery Fee</span>
              <strong>{formatPrice(delivery)}</strong>
            </div>

            <div className="professional-track-detail-row total">
              <span>Total Amount</span>
              <strong>{formatPrice(total)}</strong>
            </div>

          </div>

          {/* DELIVERY INFORMATION */}

          <div className="professional-track-card">

            <h2>Delivery Information</h2>

            <div className="professional-track-detail-row">
              <span>Customer Name</span>
              <strong>
                {order?.fullName || "Not available"}
              </strong>
            </div>

            <div className="professional-track-detail-row">
              <span>Phone Number</span>
              <strong>
                {order?.phone || "Not available"}
              </strong>
            </div>

            <div className="professional-track-address">
              <span>Delivery Address</span>
              <strong>
                {address || "Not available"}
              </strong>
            </div>

          </div>

          {/* CONTINUE SHOPPING BUTTON */}

          <div className="track-continue-shopping">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/shop";
              }}
            >
              ← Continue Shopping
            </button>
          </div>

        </div>

      </main>
    );
  }

  // =====================================
  // ORDER SUCCESS PAGE
  // =====================================

  return (
    <main className="order-success-page">

      <div className="success-content">

        <div className="success-check-circle">
          <span>✓</span>
        </div>

        <h1>Thank You for Your Order!</h1>

        <h2>Your order has been placed successfully.</h2>

        <div className="success-order-info">

          <div className="success-package-icon">▢</div>

          <div className="success-order-text">

            <strong>Order ID: #{orderId}</strong>

            <p>
              Your order confirmation is ready.
              Thank you for shopping with StepUp!
            </p>

          </div>

        </div>

        <div className="success-message">

          <p>We're excited to get your order ready!</p>

          <p className="happy-shopping">
            Happy Shopping! <span>♥</span>
          </p>

        </div>

        {/* SUCCESS ACTION BUTTONS */}

        <div className="success-action-buttons">

          <button
            type="button"
            className="success-action-btn"
            onClick={() => setCurrentView("details")}
          >
            <span className="success-action-icon">▤</span>
            <span className="success-action-label">View Order</span>
            <span className="success-arrow">›</span>
          </button>

          <button
            type="button"
            className="success-action-btn"
            onClick={() => setCurrentView("track")}
          >
            <span className="success-action-icon">♧</span>
            <span className="success-action-label">Track Order</span>
            <span className="success-arrow">›</span>
          </button>

          <button
            type="button"
            className="success-action-btn"
            onClick={() => {
              window.location.href = "/shop";
            }}
          >
            <span className="success-action-icon">🛍️</span>
            <span className="success-action-label">
              Continue Shopping
            </span>
            <span className="success-arrow">›</span>
          </button>

        </div>

        {/* SECURE NOTE */}

        <div className="success-secure-note">
          <span>♢</span>
          <p>Your order is safe and secure with us</p>
        </div>

      </div>

    </main>
  );
}

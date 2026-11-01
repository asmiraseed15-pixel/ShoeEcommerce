

import React, { useState } from "react";
import "./Checkout.css";

// Load Razorpay only for Card payments
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

const Checkout = ({ orderData, onBack, onOrderNow }) => {
  const [step, setStep] = useState(1);

  const [paymentMethod, setPaymentMethod] = useState(
    orderData?.paymentMethod || "COD"
  );

  const [loading, setLoading] = useState(false);
  const [upiVerified, setUpiVerified] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    upiId: "",
    cardHolder: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    bank: "",
  });

  const items = orderData?.items || [];

  const subtotal =
    orderData?.subtotal ??
    items.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 1),
      0
    );

  const delivery =
    orderData?.delivery ?? (subtotal >= 499 ? 0 : 40);

  const total = orderData?.total ?? subtotal + delivery;

  // Google Pay, PhonePe and UPI use the UPI demo flow
  const isUpiMethod = ["UPI", "GPAY", "PHONEPE"].includes(
    paymentMethod
  );

  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setDate(
    estimatedDeliveryDate.getDate() + 5
  );

  const estimatedDeliveryText =
    estimatedDeliveryDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000/api";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "upiId") {
      setUpiVerified(false);
    }
  };

  const verifyUpiId = () => {
    const upiPattern =
      /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;

    if (!form.upiId.trim()) {
      alert("Please enter your UPI ID.");
      return;
    }

    if (!upiPattern.test(form.upiId.trim())) {
      alert(
        "Please enter a valid UPI ID. Example: name@okaxis"
      );

      setUpiVerified(false);
      return;
    }

    setUpiVerified(true);

    alert("UPI ID format verified successfully!");
  };

  const savePersonalDetails = (e) => {
    e.preventDefault();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      alert(
        "Please enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    if (!/^\d{6}$/.test(form.postalCode)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    if (
      !form.fullName.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim()
    ) {
      alert("Please complete all delivery details.");
      return;
    }

    localStorage.setItem(
      "stepup_delivery_address",
      JSON.stringify({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
      })
    );

    setStep(2);
  };

  const validatePayment = () => {
    if (paymentMethod === "NETBANKING") {
      alert(
        "Net Banking integration is not available yet."
      );

      return false;
    }

    if (isUpiMethod && !upiVerified) {
      alert("Please verify your UPI ID first.");
      return false;
    }

    return true;
  };

  const handleOrderSuccess = (data, paymentStatus) => {
    const order = {
      ...form,
      items,
      subtotal,
      delivery,
      total,
      paymentMethod,

      orderId: data.id,
      orderDate: data.created_at,

      orderStatus:
        paymentStatus === "PAID" ||
        paymentStatus === "DEMO_SUCCESS"
          ? "CONFIRMED"
          : data.status,

      paymentStatus,

      estimatedDelivery:
        estimatedDeliveryDate.toISOString(),
    };

    if (typeof onOrderNow === "function") {
      onOrderNow(order);
    }
  };

  const buildOrderPayload = () => ({
    full_name: form.fullName,
    phone: form.phone,
    address: form.address,
    city: form.city,
    state: form.state,
    postal_code: form.postalCode,

    // Backend supports UPI, so GPAY and PHONEPE use UPI
    payment_method: isUpiMethod ? "UPI" : paymentMethod,

    items: items.map((item) => ({
      product: item.id,
      quantity: Number(item.quantity || 1),
      size: String(
        item.selectedSize || item.size || ""
      ),
      color: String(
        item.selectedColor || item.color || "Default"
      ),
    })),
  });

  const createBackendOrder = async (
    accessToken,
    payload
  ) => {
    const response = await fetch(`${API_URL}/orders/`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },

      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        Object.values(data).flat().join("\n") ||
          "Unable to place order."
      );
    }

    return data;
  };

  const placeOrder = async () => {
    if (loading) return;

    if (!validatePayment()) return;

    const accessToken = localStorage.getItem(
      "stepup_access_token"
    );

    if (!accessToken) {
      alert("Please login before placing your order.");
      return;
    }

    if (!items.length) {
      alert("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const orderPayload = buildOrderPayload();

      // UPI / GOOGLE PAY / PHONEPE DEMO PAYMENT
      if (isUpiMethod) {
        const data = await createBackendOrder(
          accessToken,
          orderPayload
        );

        if (
          data.payment_method !== "UPI" ||
          data.payment_status !== "PAID" ||
          data.status !== "CONFIRMED"
        ) {
          throw new Error(
            "UPI demo order was created, but confirmation status is missing. Please check backend."
          );
        }

        handleOrderSuccess(data, "DEMO_SUCCESS");

        alert(
          `${paymentMethod === "GPAY" ? "Google Pay" : paymentMethod === "PHONEPE" ? "PhonePe" : "UPI"} Demo Order Successful!\n\nOrder ID: ${data.id}\nUPI ID: ${form.upiId}\n\nThis is a demo transaction. No real money was transferred.`
        );

        return;
      }

      // CREATE COD / CARD ORDER
      const data = await createBackendOrder(
        accessToken,
        orderPayload
      );

      // COD PAYMENT
      if (paymentMethod === "COD") {
        handleOrderSuccess(
          data,
          data.payment_status || "PENDING"
        );

        alert(
          `Order placed successfully!\nOrder ID: ${data.id}`
        );

        return;
      }

      // RAZORPAY - CARD ONLY
      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded) {
        throw new Error(
          "Unable to load Razorpay. Please check your internet connection."
        );
      }

      if (
        !data.razorpay_order_id ||
        !data.razorpay_key_id ||
        !data.razorpay_amount
      ) {
        throw new Error(
          "Razorpay order details are missing from backend."
        );
      }

      const options = {
        key: data.razorpay_key_id,

        amount: data.razorpay_amount,

        currency: data.razorpay_currency || "INR",

        name: "StepUp",

        description: "Shoe Purchase",

        order_id: data.razorpay_order_id,

        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },

        config: {
          display: {
            blocks: {
              selected_payment: {
                name: "Pay via Card",

                instruments: [
                  {
                    method: "card",
                  },
                ],
              },
            },

            sequence: ["block.selected_payment"],

            preferences: {
              show_default_blocks: false,
            },
          },
        },

        theme: {
          color: "#087CF0",
        },

        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await fetch(
              `${API_URL}/orders/verify-payment/`,
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },

                body: JSON.stringify({
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                  razorpay_signature:
                    paymentResponse.razorpay_signature,
                }),
              }
            );

            const verifyData =
              await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                Object.values(verifyData).flat().join("\n") ||
                  "Payment verification failed."
              );
            }

            if (
              verifyData.payment_status !== "PAID"
            ) {
              throw new Error(
                "Payment could not be confirmed."
              );
            }

            handleOrderSuccess(
              data,
              verifyData.payment_status
            );

            alert(
              `Payment successful!\nOrder ID: ${data.id}`
            );

          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            alert(
              error.message ||
                "Payment verification failed. Please contact support with your order ID."
            );

          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);

            alert(
              "Payment was cancelled. Your order is still pending."
            );
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (failureResponse) {
          console.error(
            "Razorpay payment failed:",
            failureResponse.error
          );

          setLoading(false);

          alert(
            failureResponse.error?.description ||
              "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();

    } catch (error) {
      console.error(
        "Order placement error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">

        <div className="checkout-header">
          <button
            type="button"
            className="checkout-back-btn"
            onClick={onBack}
          >
            ← Back
          </button>

          <h1>Checkout</h1>

          <p>Complete your order securely</p>
        </div>

        <div className="checkout-progress">

          <div
            className={
              step >= 1
                ? "progress-step active"
                : "progress-step"
            }
          >
            <span>1</span>
            <p>Personal Details</p>
          </div>

          <div className="progress-line"></div>

          <div
            className={
              step >= 2
                ? "progress-step active"
                : "progress-step"
            }
          >
            <span>2</span>
            <p>Payment</p>
          </div>

        </div>

        <div className="checkout-layout">

          <div className="checkout-form-section">

            {step === 1 && (
              <form onSubmit={savePersonalDetails}>
                <div className="checkout-card">

                  <h2>Personal Details</h2>

                  <p>
                    Enter your delivery information
                  </p>

                  <div className="checkout-input-group">
                    <label>Full Name</label>

                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="checkout-input-group">
                    <label>Email Address</label>

                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="checkout-input-group">
                    <label>Mobile Number</label>

                    <input
                      type="tel"
                      name="phone"
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="checkout-input-group">
                    <label>Address</label>

                    <textarea
                      name="address"
                      placeholder="House number, street, area"
                      value={form.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="checkout-two-columns">

                    <div className="checkout-input-group">
                      <label>City</label>

                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={form.city}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="checkout-input-group">
                      <label>State</label>

                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={form.state}
                        onChange={handleChange}
                        required
                      />
                    </div>

                  </div>

                  <div className="checkout-input-group">
                    <label>Pincode</label>

                    <input
                      type="text"
                      name="postalCode"
                      placeholder="6-digit pincode"
                      maxLength="6"
                      value={form.postalCode}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="checkout-primary-btn"
                  >
                    Continue to Payment →
                  </button>

                </div>
              </form>
            )}

            {step === 2 && (
              <div className="checkout-card">

                <h2>Payment Method</h2>

                <p>
                  Choose your preferred payment method
                </p>

                <div className="payment-methods">

                  <label
                    className={
                      paymentMethod === "COD"
                        ? "payment-option selected"
                        : "payment-option"
                    }
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setUpiVerified(false);
                      }}
                    />

                    <span>Cash on Delivery</span>
                  </label>

                  <label
                    className={
                      paymentMethod === "GPAY"
                        ? "payment-option selected"
                        : "payment-option"
                    }
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="GPAY"
                      checked={paymentMethod === "GPAY"}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setUpiVerified(false);
                      }}
                    />

                    <span>Google Pay</span>
                  </label>

                  <label
                    className={
                      paymentMethod === "PHONEPE"
                        ? "payment-option selected"
                        : "payment-option"
                    }
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PHONEPE"
                      checked={paymentMethod === "PHONEPE"}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setUpiVerified(false);
                      }}
                    />

                    <span>PhonePe</span>
                  </label>

                  <label
                    className={
                      paymentMethod === "UPI"
                        ? "payment-option selected"
                        : "payment-option"
                    }
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={paymentMethod === "UPI"}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setUpiVerified(false);
                      }}
                    />

                    <span>Other UPI</span>
                  </label>

                  <label
                    className={
                      paymentMethod === "CARD"
                        ? "payment-option selected"
                        : "payment-option"
                    }
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CARD"
                      checked={paymentMethod === "CARD"}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setUpiVerified(false);
                      }}
                    />

                    <span>Credit / Debit Card</span>
                  </label>

                  <label
                    className={
                      paymentMethod === "NETBANKING"
                        ? "payment-option selected"
                        : "payment-option"
                    }
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="NETBANKING"
                      checked={paymentMethod === "NETBANKING"}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setUpiVerified(false);
                      }}
                    />

                    <span>Net Banking</span>
                  </label>

                </div>

                {isUpiMethod && (
                  <div className="checkout-input-group upi-demo-section">

                    <label htmlFor="upiId">
                      {paymentMethod === "GPAY"
                        ? "Enter Google Pay UPI ID"
                        : paymentMethod === "PHONEPE"
                          ? "Enter PhonePe UPI ID"
                          : "Enter UPI ID"}
                    </label>

                    <input
                      id="upiId"
                      type="text"
                      name="upiId"
                      placeholder="Example: name@okaxis"
                      value={form.upiId}
                      onChange={handleChange}
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="checkout-secondary-btn"
                      onClick={verifyUpiId}
                      disabled={loading || upiVerified}
                    >
                      {upiVerified
                        ? "✓ UPI ID Verified"
                        : "Verify UPI ID"}
                    </button>

                    {upiVerified && (
                      <p className="upi-success-message">
                        ✓ UPI ID Verified Successfully!
                      </p>
                    )}

                  </div>
                )}

                {paymentMethod === "CARD" && (
                  <div className="checkout-input-group">
                    <p>
                      Enter your card details securely in the
                      Razorpay checkout window.
                    </p>
                  </div>
                )}

                {paymentMethod === "NETBANKING" && (
                  <div className="checkout-input-group">
                    <p>
                      Net Banking integration is coming soon.
                    </p>
                  </div>
                )}

                {/* Only the top Back button is kept */}

                <div className="checkout-payment-buttons">

                  <button
                    type="button"
                    className="checkout-primary-btn"
                    onClick={placeOrder}
                    disabled={loading}
                  >
                    {loading
                      ? "Processing..."
                      : isUpiMethod
                        ? `Pay ₹${total.toFixed(2)} (Demo)`
                        : `Place Order ₹${total.toFixed(2)}`}
                  </button>

                </div>

                <p className="checkout-secure-note">
                  🔒 Your personal information is protected.
                </p>

              </div>
            )}

          </div>

          <div className="checkout-summary-section">

            <div className="checkout-card checkout-summary-card">

              <h2>Order Summary</h2>

              <div className="checkout-summary-items">

                {items.length > 0 ? (
                  items.map((item, index) => (
                    <div
                      className="checkout-summary-item"
                      key={`${item.id || index}-${item.size || ""}`}
                    >

                      <div className="checkout-summary-product">

                        {item.image && (
                          <img
                            src={item.image}
                            alt={
                              item.name ||
                              item.title ||
                              "Shoe"
                            }
                          />
                        )}

                        <div>

                          <strong>
                            {item.name ||
                              item.title ||
                              "Shoe"}
                          </strong>

                          <p>
                            Qty: {item.quantity || 1}
                          </p>

                          {item.size && (
                            <p>Size: {item.size}</p>
                          )}

                        </div>

                      </div>

                      <strong>
                        ₹
                        {(
                          Number(item.price || 0) *
                          Number(item.quantity || 1)
                        ).toFixed(2)}
                      </strong>

                    </div>
                  ))
                ) : (
                  <p>Your cart is empty.</p>
                )}

              </div>

              <div className="checkout-price-row">
                <span>Subtotal</span>

                <strong>
                  ₹{subtotal.toFixed(2)}
                </strong>
              </div>

              <div className="checkout-price-row">
                <span>Delivery Fee</span>

                <strong>
                  {delivery === 0
                    ? "FREE"
                    : `₹${delivery.toFixed(2)}`}
                </strong>
              </div>

              <div className="checkout-estimated-delivery">
                <span>Estimated Delivery</span>

                <strong>
                  {estimatedDeliveryText}
                </strong>
              </div>

              <div className="checkout-total-row">
                <span>Total</span>

                <strong>
                  ₹{total.toFixed(2)}
                </strong>
              </div>

              <p className="checkout-summary-note">
                🔒 Secure checkout
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;



import { useEffect, useState } from "react";
import "./Profile.css";

import {
  getUserProfile,
  updateUserProfile,
  getMyOrders,
} from "./api";

const TRACKING_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const STATUS_LABELS = {
  PENDING: "Order Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

// READ WISHLIST FROM LOCAL STORAGE
function getSavedWishlist() {
  try {
    const saved = localStorage.getItem("stepup_wishlist");
    const parsed = JSON.parse(saved || "[]");

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Wishlist loading error:", error);
    return [];
  }
}

// READ RECENTLY VIEWED FROM LOCAL STORAGE
function getSavedRecentlyViewed() {
  try {
    const saved = localStorage.getItem("stepup_recently_viewed");
    const parsed = JSON.parse(saved || "[]");

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Recently viewed loading error:", error);
    return [];
  }
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(amount) {
  return Number(amount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
}

function Profile({ user, onLogout, onBack }) {
  const [activeSection, setActiveSection] = useState("Personal Details");

  // PROFILE STATES
  const [profile, setProfile] = useState(user || {});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ORDERS STATES
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // WISHLIST STATE
  const [wishlistItems, setWishlistItems] = useState([]);

  // RECENTLY VIEWED STATE
  const [recentlyViewedItems, setRecentlyViewedItems] = useState([]);

  // SIDEBAR OPTIONS
  const sections = [
    { title: "Personal Details", icon: "👤" },
    { title: "My Orders", icon: "📦" },
    { title: "Wishlist", icon: "♡" },
    { title: "Recently Viewed", icon: "👀" },
  ];

  // LOAD PROFILE
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const data = await getUserProfile();

        if (mounted) {
          setProfile((previous) => ({
            ...previous,
            ...data,
          }));
        }
      } catch (err) {
        if (mounted) {
          setError("Unable to load profile details.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  // LOAD WISHLIST
  useEffect(() => {
    if (activeSection !== "Wishlist") return;

    const loadWishlist = () => {
      setWishlistItems(getSavedWishlist());
    };

    loadWishlist();

    window.addEventListener("wishlistUpdated", loadWishlist);
    window.addEventListener("storage", loadWishlist);

    return () => {
      window.removeEventListener("wishlistUpdated", loadWishlist);
      window.removeEventListener("storage", loadWishlist);
    };
  }, [activeSection]);

  // LOAD RECENTLY VIEWED PRODUCTS
  useEffect(() => {
    if (activeSection !== "Recently Viewed") return;

    const loadRecentlyViewed = () => {
      setRecentlyViewedItems(getSavedRecentlyViewed());
    };

    // Load existing products when section opens
    loadRecentlyViewed();

    // Listen for products viewed from other components
    window.addEventListener(
      "recentlyViewedUpdated",
      loadRecentlyViewed
    );

    // Listen for localStorage changes from other tabs
    window.addEventListener("storage", loadRecentlyViewed);

    return () => {
      window.removeEventListener(
        "recentlyViewedUpdated",
        loadRecentlyViewed
      );

      window.removeEventListener("storage", loadRecentlyViewed);
    };
  }, [activeSection]);

  // REMOVE PRODUCT FROM WISHLIST
  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlistItems.filter(
      (item) => String(item.id) !== String(productId)
    );

    localStorage.setItem(
      "stepup_wishlist",
      JSON.stringify(updatedWishlist)
    );

    setWishlistItems(updatedWishlist);

    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  // CLEAR RECENTLY VIEWED HISTORY
  const clearRecentlyViewed = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear your recently viewed products?"
    );

    if (!confirmClear) return;

    localStorage.removeItem("stepup_recently_viewed");

    setRecentlyViewedItems([]);

    window.dispatchEvent(
      new Event("recentlyViewedUpdated")
    );
  };

  // LOAD ORDERS + AUTO REFRESH
  useEffect(() => {
    if (activeSection !== "My Orders") return;

    let mounted = true;

    const loadOrders = async (showLoading = false) => {
      if (showLoading && mounted) {
        setOrdersLoading(true);
      }

      try {
        const data = await getMyOrders();

        if (mounted) {
          setOrders(data);
          setOrdersError("");
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (mounted) {
          setOrdersError(err.message || "Unable to load orders.");
        }
      } finally {
        if (showLoading && mounted) {
          setOrdersLoading(false);
        }
      }
    };

    loadOrders(true);

    const interval = setInterval(() => {
      loadOrders(false);
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [activeSection]);

  // HANDLE PROFILE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // EDIT PROFILE
  const handleEdit = () => {
    setMessage("");
    setError("");
    setIsEditing(true);
  };

  // CANCEL EDIT
  const handleCancel = async () => {
    setIsEditing(false);
    setMessage("");
    setError("");

    try {
      const data = await getUserProfile();
      setProfile(data);
    } catch (err) {
      setError("Unable to reload profile.");
    }
  };

  // SAVE PROFILE
  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const updated = await updateUserProfile({
        name: profile.name || profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });

      setProfile((previous) => ({
        ...previous,
        ...updated,
      }));

      setIsEditing(false);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(
        err.message || "Unable to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const displayName =
    profile.name ||
    profile.full_name ||
    user?.name ||
    "Welcome!";

  // REFRESH ORDERS
  const handleRefreshOrders = async () => {
    setOrdersLoading(true);

    try {
      const data = await getMyOrders();

      setOrders(data);
      setOrdersError("");
      setLastUpdated(new Date());
    } catch (err) {
      setOrdersError(err.message || "Unable to refresh orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  // ORDER TRACKING
  const renderTracking = (order) => {
    const history = order.tracking_history || [];
    const currentStatus = order.status;

    if (currentStatus === "CANCELLED") {
      return (
        <div className="order-cancelled">
          <span>✕</span>
          <div>
            <strong>Order Cancelled</strong>
            <p>
              {history.length > 0
                ? formatDate(history[history.length - 1].created_at)
                : "This order has been cancelled."}
            </p>
          </div>
        </div>
      );
    }

    const currentIndex = TRACKING_STEPS.indexOf(currentStatus);

    return (
      <div className="order-tracking">
        <h4>Order Tracking</h4>

        <div className="tracking-timeline">
          {TRACKING_STEPS.map((step, index) => {
            const historyItem = history.find(
              (item) => item.status === step
            );

            const completed =
              currentIndex >= 0 && index <= currentIndex;

            return (
              <div
                className={`tracking-step ${
                  completed ? "completed" : ""
                }`}
                key={step}
              >
                <div className="tracking-marker">
                  {completed ? "✓" : ""}
                </div>

                <div className="tracking-info">
                  <strong>{STATUS_LABELS[step]}</strong>

                  {historyItem && (
                    <p>{formatDate(historyItem.created_at)}</p>
                  )}

                  {historyItem?.note && (
                    <small>{historyItem.note}</small>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* PROFILE HEADING */}
        <div className="profile-heading">
          <button onClick={onBack}>
            ← Back to Shopping
          </button>

          <h1>My Account</h1>
          <p>Welcome to your StepUp.in account</p>
        </div>

        <div className="profile-layout">

          {/* SIDEBAR */}
          <aside className="profile-sidebar">

            <div className="profile-user">
              <div className="profile-avatar">👤</div>

              <h3>{displayName}</h3>

              <p>{profile.email || user?.email || "Your account"}</p>
            </div>

            <div className="profile-menu">
              {sections.map((item) => (
                <button
                  key={item.title}
                  className={
                    activeSection === item.title ? "active" : ""
                  }
                  onClick={() => {
                    setActiveSection(item.title);
                    setMessage("");
                    setError("");
                    setIsEditing(false);
                  }}
                >
                  <span>{item.icon}</span>
                  {item.title}
                  <span className="profile-arrow">›</span>
                </button>
              ))}

              <button
                className="profile-logout"
                onClick={onLogout}
              >
                <span>↪</span>
                Logout
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="profile-content">

            <h2>{activeSection}</h2>

            {/* PERSONAL DETAILS */}
            {activeSection === "Personal Details" && (
              <div className="profile-details">

                {loading ? (
                  <p>Loading profile...</p>
                ) : (
                  <>
                    {message && (
                      <p className="profile-success-message">
                        {message}
                      </p>
                    )}

                    {error && (
                      <p className="profile-error-message">
                        {error}
                      </p>
                    )}

                    {isEditing ? (
                      <form onSubmit={handleSave}>

                        <div className="profile-detail-card">
                          <label>Full Name</label>
                          <input
                            type="text"
                            name="name"
                            value={
                              profile.name ||
                              profile.full_name ||
                              ""
                            }
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="profile-detail-card">
                          <label>Email Address</label>
                          <input
                            type="email"
                            name="email"
                            value={profile.email || ""}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="profile-detail-card">
                          <label>Mobile Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={profile.phone || ""}
                            onChange={handleChange}
                            maxLength="10"
                            pattern="[0-9]{10}"
                            title="Enter a valid 10-digit mobile number"
                          />
                        </div>

                        <div className="profile-action-buttons">
                          <button
                            type="submit"
                            className="profile-edit-button"
                            disabled={saving}
                          >
                            {saving ? "Saving..." : "Save Changes"}
                          </button>

                          <button
                            type="button"
                            className="profile-cancel-button"
                            onClick={handleCancel}
                            disabled={saving}
                          >
                            Cancel
                          </button>
                        </div>

                      </form>
                    ) : (
                      <>
                        <div className="profile-detail-card">
                          <label>Full Name</label>
                          <p>{displayName}</p>
                        </div>

                        <div className="profile-detail-card">
                          <label>Email Address</label>
                          <p>{profile.email || "Not added"}</p>
                        </div>

                        <div className="profile-detail-card">
                          <label>Mobile Number</label>
                          <p>{profile.phone || "Not added"}</p>
                        </div>

                        <button
                          className="profile-edit-button"
                          onClick={handleEdit}
                        >
                          Edit Profile
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {/* MY ORDERS */}
            {activeSection === "My Orders" && (
              <div className="my-orders-section">

                <div className="orders-heading">
                  <div>
                    <h3>Your Orders</h3>
                    <p>Track and manage your purchases.</p>
                  </div>

                  <button
                    className="orders-refresh-button"
                    onClick={handleRefreshOrders}
                    disabled={ordersLoading}
                  >
                    {ordersLoading ? "Refreshing..." : "↻ Refresh"}
                  </button>
                </div>

                {lastUpdated && (
                  <p className="orders-last-updated">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                    {" "}· Auto refresh every 15 seconds
                  </p>
                )}

                {ordersLoading && orders.length === 0 ? (
                  <p className="orders-message">
                    Loading your orders...
                  </p>
                ) : ordersError && orders.length === 0 ? (
                  <div className="orders-message orders-error">
                    {ordersError}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="orders-empty">
                    <div>📦</div>
                    <h3>No Orders Yet</h3>
                    <p>Your purchased products will appear here.</p>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map((order) => (
                      <article
                        className="order-card"
                        key={order.id}
                      >

                        <div className="order-card-header">
                          <div>
                            <span>Order ID</span>
                            <strong>#{order.id}</strong>
                          </div>

                          <div>
                            <span>Order Date</span>
                            <strong>{formatDate(order.created_at)}</strong>
                          </div>

                          <div>
                            <span>Payment</span>
                            <strong>{order.payment_method}</strong>
                          </div>
                        </div>

                        <div className="order-status-banner">
                          <span>Current Status</span>
                          <strong
                            className={`order-status ${
                              (order.status || "").toLowerCase()
                            }`}
                          >
                            {STATUS_LABELS[order.status] || order.status}
                          </strong>
                        </div>

                        <div className="order-items">
                          {(order.items || []).map((item) => (
                            <div
                              className="order-item"
                              key={item.id}
                            >
                              <div className="order-product-image">
                                {item.product_image ? (
                                  <>
                                    <img
                                      src={item.product_image}
                                      alt={item.product_name || "Shoe"}
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        e.currentTarget.nextElementSibling.style.display = "block";
                                      }}
                                    />
                                    <span style={{ display: "none" }}>
                                      👟
                                    </span>
                                  </>
                                ) : (
                                  <span>👟</span>
                                )}
                              </div>

                              <div className="order-product-details">
                                <h4>
                                  {item.product_name ||
                                    `Product #${item.product}`}
                                </h4>
                                <p>Size: {item.size}</p>
                                <p>Color: {item.color}</p>
                                <p>Quantity: {item.quantity}</p>
                              </div>

                              <strong>
                                {formatPrice(
                                  Number(item.price) * item.quantity
                                )}
                              </strong>
                            </div>
                          ))}
                        </div>

                        {renderTracking(order)}

                        <div className="order-total">
                          <span>Total Amount</span>
                          <strong>
                            {formatPrice(order.total_amount)}
                          </strong>
                        </div>

                        <div className="order-delivery-address">
                          <h4>Delivery Address</h4>
                          <p>{order.full_name}</p>
                          <p>
                            {order.address}, {order.city},
                            {" "}{order.state} - {order.postal_code}
                          </p>
                          <p>Phone: {order.phone}</p>
                        </div>

                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WISHLIST */}
            {activeSection === "Wishlist" && (
              <div className="profile-wishlist">

                {wishlistItems.length === 0 ? (
                  <div className="profile-placeholder">
                    <div>♡</div>
                    <h3>Your Wishlist is Empty</h3>
                    <p>Your favourite shoes will appear here.</p>

                    <button onClick={onBack}>
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="profile-wishlist-grid">
                    {wishlistItems.map((product) => (
                      <div
                        className="profile-wishlist-card"
                        key={product.id}
                      >
                        <div className="profile-wishlist-image">
                          {(product.image || product.image_url) ? (
                            <img
                              src={product.image || product.image_url}
                              alt={product.name || "Shoe"}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <span>👟</span>
                          )}
                        </div>

                        <div className="profile-wishlist-details">
                          <h3>{product.name}</h3>

                          <p>{product.brand || "StepUp"}</p>

                          <strong>
                            {formatPrice(product.price)}
                          </strong>

                          <button
                            onClick={() =>
                              removeFromWishlist(product.id)
                            }
                          >
                            Remove ♡
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* RECENTLY VIEWED */}
            {activeSection === "Recently Viewed" && (
              <div className="profile-wishlist">

                <div className="orders-heading">
                  <div>
                    <h3>Recently Viewed Products</h3>
                    <p>
                      Products you have viewed recently.
                    </p>
                  </div>

                  {recentlyViewedItems.length > 0 && (
                    <button
                      className="orders-refresh-button"
                      onClick={clearRecentlyViewed}
                    >
                      Clear History
                    </button>
                  )}
                </div>

                {recentlyViewedItems.length === 0 ? (
                  <div className="profile-placeholder">
                    <div>👀</div>
                    <h3>No Recently Viewed Products</h3>
                    <p>
                      Shoes you view from Home and Category pages
                      will appear here.
                    </p>

                    <button onClick={onBack}>
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="profile-wishlist-grid">
                    {recentlyViewedItems.map((product) => (
                      <div
                        className="profile-wishlist-card"
                        key={product.id}
                      >
                        <div className="profile-wishlist-image">
                          {(product.image || product.image_url) ? (
                            <img
                              src={product.image || product.image_url}
                              alt={product.name || "Shoe"}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <span>👟</span>
                          )}
                        </div>

                        <div className="profile-wishlist-details">
                          <h3>
                            {product.name || "Shoe"}
                          </h3>

                          <p>
                            {product.brand || "StepUp"}
                          </p>

                          <strong>
                            {formatPrice(product.price)}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

export default Profile;

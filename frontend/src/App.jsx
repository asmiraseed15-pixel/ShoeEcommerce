

import { useEffect, useState } from "react";
import "./App.css";
import CategoryPage from "./CategoryPage.jsx";
import ProductDetails from "./ProductDetails.jsx";
import Wishlist from "./Wishlist.jsx";
import Cart from "./Cart.jsx";
import AboutUs from "./AboutUs.jsx";
import ContactUs from "./ContactUs.jsx";
import Login from "./Login.jsx";
import Checkout from "./Checkout.jsx";
import OrderSuccess from "./OrderSuccess.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import Profile from "./Profile.jsx";

import {
  getProducts,
  getTrendingProducts,
  getSiteSettings,
  getHomeSections,
  getAboutPage,
  getContactPage,
} from "./api.js";

import logo from "./assets/logo.png";
import front1 from "./assets/front1.png";
import front2 from "./assets/front2.png";
import slide2 from "./assets/Slide2.png";
import slide3 from "./assets/Slide3.png";

import gents from "./assets/Gents.png";
import women from "./assets/Women.png";
import kids from "./assets/Kids.png";

// Optional fifth slider image
let slide4;

try {
  slide4 = new URL("./assets/Slide4.png", import.meta.url).href;
} catch {
  slide4 = null;
}

const slides = [
  front1,
  front2,
  slide2,
  slide3,
  ...(slide4 ? [slide4] : []),
];

const slideOffers = [
  {
    title: "FLAT 50% OFF",
    subtitle: "Kids' Shoes",
    description:
      "Little steps, big adventures. Find their perfect pair.",
    side: "left",
    dark: false,
    category: "Kids",
  },
  {
    title: "FLAT 40% OFF",
    subtitle: "Discover Your Style",
    description: "Explore stylish shoes for every occasion.",
    side: "left",
    dark: false,
    category: "All",
  },
  {
    title: "WOMEN'S HIGH HEELS",
    subtitle: "FLAT 30% OFF",
    description: "Get a special offer on your first order.",
    side: "left",
    dark: true,
    category: "Women",
  },
  {
    title: "MEN'S OFFICE SHOES",
    subtitle: "40% OFF — TODAY ONLY",
    description: "Smart style for every workday.",
    side: "right",
    dark: false,
    category: "Men",
  },
  {
    title: "WOMEN'S RED HIGH HEELS",
    subtitle: "PARTY IN STYLE",
    description: "Place your first order and get a free gift!",
    side: "left",
    dark: true,
    category: "Women",
  },
];

const mainCategories = [
  "Women",
  "Men",
  "Kids",
  "Brands",
  "Offers",
];

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [searchText, setSearchText] = useState("");
  const [cart, setCart] = useState([]);
  const [email, setEmail] = useState("");
  const [shopCategory, setShopCategory] = useState(null);

  // About Us page
  const [showAbout, setShowAbout] = useState(false);

  // Contact Us page
  const [showContact, setShowContact] = useState(false);

  // Login and Checkout pages
  const [showLogin, setShowLogin] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  // Order Success page
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  // Current logged-in user
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("stepup_user") || "null"
      );
    } catch {
      return null;
    }
  });

  // Admin Dashboard
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // Profile Dashboard
  const [showProfile, setShowProfile] = useState(false);

  // Backend trending products
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  // All products for Brands filter and Search
  const [allProducts, setAllProducts] = useState([]);
  const [allProductsLoading, setAllProductsLoading] = useState(false);
  const [allProductsError, setAllProductsError] = useState("");

  // CMS data from Django backend
  const [siteSettings, setSiteSettings] = useState(null);
  const [homeSections, setHomeSections] = useState([]);
  const [aboutPage, setAboutPage] = useState(null);
  const [contactPage, setContactPage] = useState(null);

  // Selected product details state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);

  // Fetch Trending Products from Django backend
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError("");

        const data = await getTrendingProducts();

        setProducts(data);
      } catch (error) {
        console.error("Trending products loading error:", error);
        setProductsError(
          "Unable to load trending products. Please try again."
        );
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Fetch all products from Django backend for Brands and Search
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        setAllProductsLoading(true);
        setAllProductsError("");

        const data = await getProducts();
        console.log("ALL PRODUCTS RESPONSE:", data);

        setAllProducts(
          Array.isArray(data) ? data : data.results || []
        );
      } catch (error) {
        console.error("All products loading error:", error);
        setAllProductsError(
          "Unable to load products. Please try again."
        );
      } finally {
        setAllProductsLoading(false);
      }
    };

    loadAllProducts();
  }, []);

  // Fetch CMS data from Django backend
  useEffect(() => {
    const loadCMSData = async () => {
      try {
        const [settings, sections, about, contact] =
          await Promise.all([
            getSiteSettings(),
            getHomeSections(),
            getAboutPage(),
            getContactPage(),
          ]);

        setSiteSettings(settings);
        setHomeSections(sections);
        setAboutPage(about);
        setContactPage(contact);
      } catch (error) {
        console.error("CMS loading error:", error);
      }
    };

    loadCMSData();
  }, []);

  // Existing Add to Cart function preserved
  const addToCart = (product) => {
    try {
      const existingCart = JSON.parse(
        localStorage.getItem("stepup_cart") || "[]"
      );

      const selectedSize = product.selectedSize || "UK 8";
      const selectedColor = product.selectedColor || "Black";

      const cartId = `${product.id ?? product.name ?? product.title}-${selectedSize}-${selectedColor}`;

      const existingIndex = existingCart.findIndex(
        (item) => item.cartId === cartId
      );

      if (existingIndex !== -1) {
        existingCart[existingIndex] = {
          ...existingCart[existingIndex],
          quantity:
            (existingCart[existingIndex].quantity || 1) + 1,
        };
      } else {
        existingCart.push({
          ...product,
          selectedSize,
          selectedColor,
          quantity: 1,
          cartId,
        });
      }

      localStorage.setItem(
        "stepup_cart",
        JSON.stringify(existingCart)
      );

      setCart(existingCart);

      window.dispatchEvent(new Event("stepup-cart-updated"));
    } catch (error) {
      console.error("Unable to add product to cart:", error);
      alert("Unable to add product. Please try again.");
    }
  };

  const [showWishlist, setShowWishlist] = useState(false);

  const [wishlistCount, setWishlistCount] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("stepup_wishlist") || "[]"
      );
      return Array.isArray(saved) ? saved.length : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const updateWishlistCount = () => {
      try {
        const saved = JSON.parse(
          localStorage.getItem("stepup_wishlist") || "[]"
        );
        setWishlistCount(
          Array.isArray(saved) ? saved.length : 0
        );
      } catch {
        setWishlistCount(0);
      }
    };

    window.addEventListener(
      "stepup-wishlist-updated",
      updateWishlistCount
    );
    window.addEventListener("storage", updateWishlistCount);

    return () => {
      window.removeEventListener(
        "stepup-wishlist-updated",
        updateWishlistCount
      );
      window.removeEventListener("storage", updateWishlistCount);
    };
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const saved = JSON.parse(
          localStorage.getItem("stepup_cart") || "[]"
        );

        setCart(Array.isArray(saved) ? saved : []);
      } catch {
        setCart([]);
      }
    };

    window.addEventListener(
      "stepup-cart-updated",
      updateCartCount
    );
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("stepup-cart-updated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  useEffect(() => {
    const sliderTimer = setInterval(() => {
      setCurrentSlide(
        (previous) => (previous + 1) % slides.length
      );
    }, 3000);

    return () => clearInterval(sliderTimer);
  }, []);

  // Get unique brands from all backend products
  const uniqueBrands = [
    ...new Map(
      allProducts
        .filter((product) => product.brand?.trim())
        .map((product) => [
          product.brand.trim().toLowerCase(),
          product.brand.trim(),
        ])
    ).values(),
  ];

  // Use all products when searching or Brands category is selected
  const isSearching = searchText.trim().length > 0;

  const productSource =
    isSearching || activeCategory === "Brands"
      ? allProducts
      : products;

  // Search and category filtering
  const visibleProducts = productSource.filter((product) => {
    const query = searchText.toLowerCase().trim();

    const searchableFields = [
      product.name,
      product.brand,
      product.type,
      product.category,
      product.description,
    ];

    const matchesSearch =
      !query ||
      searchableFields.some((field) =>
        String(field || "").toLowerCase().includes(query)
      );

    let matchesCategory = true;

    // When searching, do not restrict results by category
    if (!query) {
      if (["Women", "Men", "Kids"].includes(activeCategory)) {
        matchesCategory =
          (product.category || "").toLowerCase() ===
          activeCategory.toLowerCase();
      } else if (activeCategory === "Offers") {
        matchesCategory = Boolean(product.offer);
      } else if (activeCategory === "Brands" && selectedBrand) {
        matchesCategory =
          (product.brand || "").toLowerCase() ===
          selectedBrand.toLowerCase();
      }
    }

    return matchesSearch && matchesCategory;
  });

  function chooseCategory(category) {
    setShowContact(false);
    setShowAbout(false);
    setSelectedBrand("");

    if (["Women", "Men", "Kids"].includes(category)) {
      setShopCategory(category);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setShopCategory(null);
    setActiveCategory(category);

    document.getElementById("trending")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function goHome() {
    setShowAdminDashboard(false);
    setShowProfile(false);
    setShowContact(false);
    setShowAbout(false);
    setShowCart(false);
    setShowWishlist(false);
    setShowLogin(false);
    setShowCheckout(false);
    setShowOrderSuccess(false);
    setCheckoutData(null);
    setShopCategory(null);
    setSelectedProduct(null);
    setActiveCategory("All");
    setSelectedBrand("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openProduct(product) {
    setShowContact(false);
    setShowAbout(false);
    setShowCart(false);
    setShowWishlist(false);
    setShowLogin(false);
    setShowCheckout(false);
    setShowOrderSuccess(false);
    setSelectedProduct(product);
    setShopCategory(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSubscribe(event) {
    event.preventDefault();

    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    alert("Thank you for subscribing to StepUp.in!");
    setEmail("");
  }

  // Open Profile Dashboard
  function openProfile() {
    setShowProfile(true);
    setShowAdminDashboard(false);
    setShowContact(false);
    setShowAbout(false);
    setShowCart(false);
    setShowWishlist(false);
    setShowLogin(false);
    setShowCheckout(false);
    setShowOrderSuccess(false);
    setSelectedProduct(null);
    setShopCategory(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Open Contact Us page
  function openContact() {
    setShowContact(true);
    setShowAbout(false);
    setShowCart(false);
    setShowWishlist(false);
    setShowLogin(false);
    setShowCheckout(false);
    setShowOrderSuccess(false);
    setSelectedProduct(null);
    setShopCategory(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Open Login page and preserve checkout information
  function openLogin(data = null) {
    setCheckoutData(data);
    setShowLogin(true);
    setShowCheckout(false);
    setShowOrderSuccess(false);

    setShowContact(false);
    setShowAbout(false);
    setShowCart(false);
    setShowWishlist(false);
    setSelectedProduct(null);
    setShopCategory(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Login/Register success
  function handleLoginSuccess(user) {
    localStorage.setItem("stepup_user", JSON.stringify(user));
    setCurrentUser(user);

    setShowLogin(false);

    if (checkoutData) {
      setShowCheckout(true);
    } else {
      goHome();
      alert("Login successful!");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Logout
  function handleLogout() {
    localStorage.removeItem("stepup_user");
    localStorage.removeItem("stepup_access_token");
    localStorage.removeItem("stepup_refresh_token");

    setCurrentUser(null);
    setShowLogin(false);
    setShowCheckout(false);
    setCheckoutData(null);

    goHome();

    alert("You have been logged out successfully.");
  }

  // Place order - frontend demo
  function handleOrderNow(order) {
    try {
      const savedOrders = JSON.parse(
        localStorage.getItem("stepup_orders") || "[]"
      );

      const newOrder = {
        ...order,
        orderId: `STEPUP-${Date.now()}`,
        orderDate: new Date().toISOString(),
        status: "Confirmed",
      };

      savedOrders.push(newOrder);

      localStorage.setItem(
        "stepup_orders",
        JSON.stringify(savedOrders)
      );

      // Save latest order for success page
      setLastOrder(newOrder);

      // Clear cart only for Cart checkout
      if (checkoutData?.source === "cart") {
        localStorage.removeItem("stepup_cart");
        setCart([]);
        window.dispatchEvent(new Event("stepup-cart-updated"));
      }

      // Open Order Success page
      setShowCheckout(false);
      setShowLogin(false);
      setShowCart(false);
      setShowWishlist(false);
      setShowAbout(false);
      setShowContact(false);
      setCheckoutData(null);
      setSelectedProduct(null);
      setShopCategory(null);
      setShowOrderSuccess(true);

      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error) {
      console.error("Order error:", error);
      alert("Unable to place your order. Please try again.");
    }
  }

  const currentOffer =
    slideOffers[currentSlide] || slideOffers[0];

  return (
    <div
      className="app"
      style={
        siteSettings
          ? {
              "--primary-color": siteSettings.primary_color,
              "--secondary-color": siteSettings.secondary_color,
              fontFamily: siteSettings.font_family || "inherit",
            }
          : undefined
      }
    >
      {/* NAVBAR - Existing design preserved */}
      <header className="navbar">
        <a
          className="brand-logo"
          href="#home"
          aria-label="StepUp home"
          onClick={goHome}
        >
          <img src={logo} alt="StepUp logo" />
        </a>

        <div className="search-box">
          <span className="search-symbol">⌕</span>
          <input
            type="search"
            placeholder="Search here..."
            value={searchText}
            onChange={(event) => {
              setShowContact(false);
              setSearchText(event.target.value);
              setActiveCategory("All");
              setSelectedBrand("");
              setShopCategory(null);
              setSelectedProduct(null);
            }}
            onFocus={() => {
              setShowContact(false);
              setShopCategory(null);
              setSelectedProduct(null);
              document.getElementById("trending")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            aria-label="Search shoes"
          />
        </div>

        <nav className="nav-links">
          <a href="#home" onClick={goHome}>
            <span aria-hidden="true">⌂</span>{" "}
            <span>Home</span>
          </a>

          {/* ABOUT US */}
          <a
            href="#about"
            onClick={(event) => {
              event.preventDefault();
              setShowContact(false);
              setShowAbout(true);
              setShowCart(false);
              setShowWishlist(false);
              setShowLogin(false);
              setShowCheckout(false);
              setShowOrderSuccess(false);
              setSelectedProduct(null);
              setShopCategory(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <span aria-hidden="true">ⓘ</span>{" "}
            <span>About Us</span>
          </a>

          {/* CONTACT US */}
          <a
            href="#contact-us"
            onClick={(event) => {
              event.preventDefault();
              openContact();
            }}
          >
            <span aria-hidden="true">✉</span>{" "}
            <span>Contact Us</span>
          </a>

          {/* PROFILE / LOGIN */}
          {currentUser ? (
            <a
              href="#profile"
              onClick={(event) => {
                event.preventDefault();
                openProfile();
              }}
            >
              <span aria-hidden="true">♙</span>{" "}
              <span>My Account</span>
            </a>
          ) : (
            <a
              href="#login"
              onClick={(event) => {
                event.preventDefault();
                openLogin();
              }}
            >
              <span aria-hidden="true">♙</span>{" "}
              <span>Login</span>
            </a>
          )}

          {/* ADMIN DASHBOARD - Only for staff users */}
          {currentUser?.is_staff && (
            <a
              href="#admin"
              onClick={(event) => {
                event.preventDefault();

                setShowAdminDashboard(true);
                setShowContact(false);
                setShowAbout(false);
                setShowCart(false);
                setShowWishlist(false);
                setShowLogin(false);
                setShowCheckout(false);
                setShowOrderSuccess(false);
                setSelectedProduct(null);
                setShopCategory(null);

                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <span aria-hidden="true">⚙</span>{" "}
              <span>Admin Dashboard</span>
            </a>
          )}

          {/* Wishlist */}
          <a
            href="#wishlist"
            onClick={(event) => {
              event.preventDefault();
              setShowContact(false);
              setShowAbout(false);
              setShowWishlist(true);
              setShowCart(false);
              setShowLogin(false);
              setShowCheckout(false);
              setShowOrderSuccess(false);
              setSelectedProduct(null);
              setShopCategory(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <span aria-hidden="true">♡</span>{" "}
            <span>Wishlist ({wishlistCount})</span>
          </a>

          <a
            href="#cart"
            onClick={(event) => {
              event.preventDefault();
              setShowContact(false);
              setShowAbout(false);
              setShowCart(true);
              setShowWishlist(false);
              setShowLogin(false);
              setShowCheckout(false);
              setShowOrderSuccess(false);
              setSelectedProduct(null);
              setShopCategory(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <span aria-hidden="true">🛒</span>{" "}
            <span>
              Cart (
              {cart.reduce(
                (total, item) =>
                  total + Number(item.quantity || 1),
                0
              )}
              )
            </span>
          </a>
        </nav>
      </header>

      {/* ORDER SUCCESS / ADMIN / CONTACT / ABOUT / LOGIN / CHECKOUT / PRODUCT / CATEGORY / WISHLIST / CART / HOME */}
      {showProfile ? (
        <Profile
          user={currentUser}
          onLogout={handleLogout}
          onBack={goHome}
        />
      ) : showAdminDashboard ? (
        <AdminDashboard
          user={currentUser}
          onBack={goHome}
        />
      ) : showOrderSuccess ? (
        <OrderSuccess
          order={lastOrder}
        />
      ) : showContact ? (
        <ContactUs />
      ) : showAbout ? (
        <AboutUs />
      ) : showLogin ? (
        <Login
          onLogin={handleLoginSuccess}
          onRegister={handleLoginSuccess}
        />
      ) : showCheckout ? (
        <Checkout
          orderData={checkoutData}
          onBack={() => {
            setShowCheckout(false);

            if (checkoutData?.source === "cart") {
              setShowCart(true);
            } else {
              setShowLogin(false);
              setShopCategory(null);
            }

            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onOrderNow={handleOrderNow}
        />
      ) : showCart ? (
        <Cart
          onBack={() => {
            setShowCart(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onCheckout={(checkoutData) => {
            openLogin({
              ...checkoutData,
              source: "cart",
            });
          }}
        />
      ) : showWishlist ? (
        <Wishlist
          onBack={() => {
            setShowWishlist(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onAddToCart={addToCart}
        />
      ) : selectedProduct ? (
        <ProductDetails
          product={selectedProduct}
          onBack={() => {
            setSelectedProduct(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onAddToCart={addToCart}
        />
      ) : shopCategory ? (
        <CategoryPage
          category={shopCategory}
          onBack={goHome}
          onAddToCart={addToCart}
          onBuyNow={(product) => {
            const subtotal =
              Number(product.price || 0) *
              Number(product.quantity || 1);

            const delivery = subtotal >= 1999 ? 0 : 99;

            openLogin({
              items: [product],
              paymentMethod: "COD",
              subtotal,
              delivery,
              total: subtotal + delivery,
              source: "buy-now",
            });
          }}
        />
      ) : (
        <main id="home">
          {/* MAIN HEADING */}
          <section className="intro-heading">
            <h1>{siteSettings?.site_name || "StepUp.in"}</h1>
          </section>

          {/* CATEGORIES */}
          <nav
            className="category-nav"
            aria-label="Shop categories"
            style={{
              borderTop: "1px solid #ddd",
              borderBottom: "1px solid #ddd",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "nowrap",
              gap: "clamp(14px, 4vw, 42px)",
              overflowX: "auto",
              whiteSpace: "nowrap",
              padding: "12px 16px",
            }}
          >
            {mainCategories.map((category) => (
              <button
                key={category}
                className={
                  activeCategory === category
                    ? "category-link active"
                    : "category-link"
                }
                style={{
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
                onClick={() => chooseCategory(category)}
              >
                {category}
              </button>
            ))}
          </nav>

          {/* AUTOMATIC HERO SLIDER */}
          <section
            className="hero-slider"
            aria-label="Featured collection"
          >
            <img
              key={slides[currentSlide]}
              className="hero-image"
              src={slides[currentSlide]}
              alt={`StepUp featured collection ${currentSlide + 1}`}
            />

            <div
              key={`offer-${currentSlide}`}
              className={`hero-offer ${currentOffer.side} ${
                currentOffer.dark ? "hero-offer-dark" : ""
              }`}
            >
              <p className="hero-offer-kicker">
                STEPUP.IN EXCLUSIVE
              </p>
              <h2>{currentOffer.title}</h2>
              <h3>{currentOffer.subtitle}</h3>
              <p className="hero-offer-description">
                {currentOffer.description}
              </p>

              <button
                className="shop-now-button"
                onClick={() => chooseCategory(currentOffer.category)}
              >
                Shop Now →
              </button>
            </div>

            <div className="slider-dots">
              {slides.map((slide, index) => (
                <button
                  key={slide}
                  className={
                    currentSlide === index
                      ? "slider-dot selected"
                      : "slider-dot"
                  }
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Show slide ${index + 1}`}
                />
              ))}
            </div>
          </section>

          {/* OVERVIEW */}
          <section id="overview" className="overview section-space">
            <p className="eyebrow">DISCOVER STEPUP</p>
            <h2>{aboutPage?.title || "Overview"}</h2>
            <p className="overview-text">
              {aboutPage?.content ||
                "Explore our curated selection of high-quality shoes for every occasion. From durable athletic shoes designed for peak performance to stylish casual sneakers and elegant dress shoes, we offer a diverse range of footwear to suit your needs. Our user-friendly interface makes it easy to browse our collection and find the perfect pair, while detailed product descriptions and high-quality images ensure you make an informed decision. Join our community of style and discover your next favorite shoe!"}
            </p>
          </section>

          {/* SHOP BY CATEGORY */}
          <section className="looking-section section-space">
            <p className="eyebrow">FIND YOUR STYLE</p>
            <h2>What are you looking for?</h2>

            <div className="audience-grid">
              <button
                className="audience-card"
                onClick={() => chooseCategory("Men")}
              >
                <img src={gents} alt="Men's shoes" />
                <span>Men</span>
                <small>Explore men's footwear →</small>
              </button>

              <button
                className="audience-card"
                onClick={() => chooseCategory("Women")}
              >
                <img src={women} alt="Women's shoes" />
                <span>Women</span>
                <small>Explore women's footwear →</small>
              </button>

              <button
                className="audience-card"
                onClick={() => chooseCategory("Kids")}
              >
                <img src={kids} alt="Kids' shoes" />
                <span>Kids</span>
                <small>Explore kids' footwear →</small>
              </button>
            </div>
          </section>

          {/* TRENDING PRODUCTS */}
          <section
            id="trending"
            className="trending-section section-space"
          >
            <p className="eyebrow">MADE FOR EVERY STEP</p>

            <h2>
              {isSearching
                ? `Search Results for "${searchText.trim()}"`
                : activeCategory === "Brands"
                ? selectedBrand
                  ? `${selectedBrand} Collection`
                  : "Shop by Brand"
                : activeCategory === "All"
                ? "New & Trending"
                : `${activeCategory} Collection`}
            </h2>

            <p className="section-subtitle">
              Find your next favourite pair from our latest collection.
            </p>

            {/* BRAND FILTERS */}
            {activeCategory === "Brands" && !isSearching && (
              <div
                className="brand-filter-list"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  margin: "24px 0",
                }}
              >
                {allProductsLoading ? (
                  <p>Loading brands...</p>
                ) : allProductsError ? (
                  <p>{allProductsError}</p>
                ) : uniqueBrands.length === 0 ? (
                  <p>No brands available.</p>
                ) : (
                  <>
                    <button
                      className={
                        selectedBrand === ""
                          ? "category-link active"
                          : "category-link"
                      }
                      onClick={() => setSelectedBrand("")}
                    >
                      All Brands
                    </button>

                    {uniqueBrands.map((brand) => (
                      <button
                        key={brand}
                        className={
                          selectedBrand === brand
                            ? "category-link active"
                            : "category-link"
                        }
                        onClick={() => setSelectedBrand(brand)}
                      >
                        {brand}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}

            <div className="product-grid">
              {(isSearching || activeCategory === "Brands") &&
              allProductsLoading ? (
                <p>Loading products...</p>
              ) : (isSearching || activeCategory === "Brands") &&
                allProductsError ? (
                <p>{allProductsError}</p>
              ) : !isSearching &&
                activeCategory !== "Brands" &&
                productsLoading ? (
                <p>Loading products...</p>
              ) : !isSearching &&
                activeCategory !== "Brands" &&
                productsError ? (
                <p>{productsError}</p>
              ) : (
                visibleProducts.map((product) => (
                  <article className="product-card" key={product.id}>
                    <div className="product-image-wrap">
                      {product.offer && (
                        <span className="sale-badge">SALE</span>
                      )}

                      <img
                        src={product.image}
                        alt={product.name}
                        onClick={() => openProduct(product)}
                        style={{ cursor: "pointer" }}
                      />

                      <button
                        className="quick-add"
                        onClick={() => addToCart(product)}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        + Add to Cart
                      </button>
                    </div>

                    <div className="product-details">
                      <p className="product-type">
                        {product.brand} · {product.type}
                      </p>

                      <h3
                        onClick={() => openProduct(product)}
                        style={{ cursor: "pointer" }}
                      >
                        {product.name}
                      </h3>

                      <p className="product-description">
                        {product.description}
                      </p>

                      <div className="price-row">
                        <strong>
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </strong>

                        {product.oldPrice && (
                          <del>
                            ₹{Number(product.oldPrice).toLocaleString("en-IN")}
                          </del>
                        )}

                        {product.offer &&
                          product.oldPrice > product.price && (
                            <span className="discount">
                              {Math.round(
                                (1 -
                                  product.price / product.oldPrice) *
                                  100
                              )}
                              % OFF
                            </span>
                          )}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {!allProductsLoading &&
              !productsLoading &&
              !allProductsError &&
              !productsError &&
              visibleProducts.length === 0 && (
                <div className="no-products">
                  <h3>No shoes found</h3>
                  <p>
                    Try another search or choose a different category.
                  </p>
                  <button
                    onClick={() => {
                      setSearchText("");
                      setActiveCategory("All");
                      setSelectedBrand("");
                    }}
                  >
                    View All Products
                  </button>
                </div>
              )}

            <div className="view-all-row">
              <button
                className="view-all-button"
                onClick={() => {
                  setActiveCategory("All");
                  setSelectedBrand("");
                  setSearchText("");
                }}
              >
                View All Products →
              </button>
            </div>
          </section>

          {/* OFFER STRIP */}
          <section className="offer-banner">
            <div className="gift-icon">🎁</div>

            <div>
              <p className="offer-kicker">A LITTLE GIFT FROM US</p>
              <h2>Get your first order with a free gift!</h2>
              <p>
                Plus, enjoy up to <strong>50% OFF</strong> on selected styles.
              </p>
            </div>

            <button onClick={() => chooseCategory("Offers")}>
              Shop Offers →
            </button>
          </section>
        </main>
      )}

      {/* FOOTER - Existing design preserved */}
      <footer id="contact" className="footer">
        <div className="footer-main">
          <div className="footer-column contact-column">
            <h3>{contactPage?.title || "Contact Us"}</h3>
            <p>{contactPage?.description || "We'd love to hear from you!"}</p>
            <p>Landline: {contactPage?.phone || "04144 269103"}</p>
            <p>WhatsApp: {contactPage?.whatsapp || "+918220418021"}</p>
            <p>Email: {contactPage?.email || "stepup@gmail.com"}</p>
            <p>
              Address: {contactPage?.address ||
                "2/38, Sulaiman sait street, Lalpet, Tamilnadu, India."}
            </p>
          </div>

          <div className="footer-column">
            <h3>Shop</h3>
            <a href="#trending" onClick={() => chooseCategory("All")}>
              New In
            </a>
            <a href="#trending" onClick={() => chooseCategory("Women")}>
              Women
            </a>
            <a href="#trending" onClick={() => chooseCategory("Men")}>
              Men
            </a>
            <a href="#trending" onClick={() => chooseCategory("All")}>
              Accessories
            </a>
            <a href="#trending" onClick={() => chooseCategory("Women")}>
              Heels
            </a>

            {/* ABOUT US */}
            <a
              href="#about"
              onClick={(event) => {
                event.preventDefault();
                setShowContact(false);
                setShowAbout(true);
                setShowCart(false);
                setShowWishlist(false);
                setShowLogin(false);
                setShowCheckout(false);
                setShowOrderSuccess(false);
                setSelectedProduct(null);
                setShopCategory(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              About Us
            </a>
          </div>

          <div className="footer-column">
            <h3>Info</h3>
            <a
              href="#trending"
              onClick={() => {
                setShowContact(false);
                setShopCategory(null);
                setSelectedProduct(null);
              }}
            >
              Search
            </a>
            <a href="#contact">Return &amp; Exchange Policy</a>
            <a href="#contact">Privacy Policy</a>
            <a href="#contact">Terms of Service</a>
            <a href="#contact">Shipping Policy</a>
            <a href="#contact">Blogs</a>
          </div>

          <div className="footer-column social-column">
            <h3>Social Media</h3>
            <div className="social-links">
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
              >
                f
              </a>
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                ◎
              </a>
              <a
                href="https://twitter.com"
                aria-label="Twitter"
                target="_blank"
                rel="noreferrer"
              >
                𝕏
              </a>
              <a
                href="https://meta.com"
                aria-label="Meta"
                target="_blank"
                rel="noreferrer"
              >
                ∞
              </a>
            </div>
          </div>
        </div>

        {/* NEWSLETTER */}
        <div className="newsletter">
          <div>
            <h2>Let's stay in touch!</h2>
            <p>
              Sign up for exclusive offers, original stories, events and more.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="newsletter-form">
            <label htmlFor="newsletter-email">Email ID</label>

            <div className="newsletter-input-row">
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <button type="submit">Subscribe →</button>
            </div>
          </form>
        </div>

        <div className="footer-bottom">
          <p>© 2026 StepUp.in. All rights reserved.</p>
          <p>Walk your way. Own your style.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

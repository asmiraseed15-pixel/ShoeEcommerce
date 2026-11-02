


const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://shoe-ecommerce-backend-ct52.onrender.com/api";

// ==============================
// PRODUCTS API
// ==============================

export async function getProducts() {
  const response = await fetch(`${API_URL}/products/`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await response.json();

  const serverUrl = API_URL.replace(/\/api\/?$/, "");

  return data.map((product) => {
    let image = product.image_url || product.image || "";

    if (image && !image.startsWith("http")) {
      image = `${serverUrl}/${image.replace(/^\/+/, "")}`;
    }

    return {
      ...product,
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: Number(product.price),
      oldPrice: null,
      category: product.category_name || "Other",
      type: product.category_name || "Shoes",
      brand: product.brand || "StepUp",
      image,
      offer: false,
    };
  });
}


// ==============================
// TRENDING PRODUCTS API
// ==============================

export async function getTrendingProducts() {
  const response = await fetch(`${API_URL}/products/trending/`);

  if (!response.ok) {
    throw new Error("Failed to fetch trending products");
  }

  const data = await response.json();

  const serverUrl = API_URL.replace(/\/api\/?$/, "");

  return data.map((product) => {
    let image = product.image_url || product.image || "";

    if (image && !image.startsWith("http")) {
      image = `${serverUrl}/${image.replace(/^\/+/, "")}`;
    }

    return {
      ...product,
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: Number(product.price),
      oldPrice: product.original_price
        ? Number(product.original_price)
        : null,
      category: product.category_name || "Other",
      type: product.category_name || "Shoes",
      brand: product.brand || "StepUp",
      image,
      offer: Boolean(product.original_price),
    };
  });
}


// ==============================
// CATEGORIES API
// ==============================

export async function getCategories() {
  const response = await fetch(`${API_URL}/products/categories/`);

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}


// ==============================
// SITE SETTINGS API
// ==============================

export async function getSiteSettings() {
  const response = await fetch(`${API_URL}/website/settings/`);

  if (!response.ok) {
    throw new Error("Failed to fetch site settings");
  }

  const data = await response.json();
  return data[0] || null;
}


// ==============================
// HOME PAGE SECTIONS API
// ==============================

export async function getHomeSections() {
  const response = await fetch(`${API_URL}/website/home-sections/`);

  if (!response.ok) {
    throw new Error("Failed to fetch home sections");
  }

  return response.json();
}


// ==============================
// ABOUT PAGE API
// ==============================

export async function getAboutPage() {
  const response = await fetch(`${API_URL}/website/about/`);

  if (!response.ok) {
    throw new Error("Failed to fetch about page");
  }

  const data = await response.json();
  return data[0] || null;
}


// ==============================
// CONTACT PAGE API
// ==============================

export async function getContactPage() {
  const response = await fetch(`${API_URL}/website/contact/`);

  if (!response.ok) {
    throw new Error("Failed to fetch contact page");
  }

  const data = await response.json();
  return data[0] || null;
}


// ==============================
// SEND CUSTOMER CONTACT MESSAGE
// ==============================

export async function sendContactMessage(messageData) {
  const response = await fetch(`${API_URL}/customer-messages/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: messageData.name,
      email: messageData.email,
      phone: messageData.phone,
      message: messageData.message,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data.detail ||
      data.name?.[0] ||
      data.email?.[0] ||
      data.phone?.[0] ||
      data.message?.[0] ||
      "Message sending failed. Please try again.";

    throw new Error(errorMessage);
  }

  return data;
}


// ==============================
// REGISTER API
// ==============================

export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/auth/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data.email?.[0] ||
      data.phone?.[0] ||
      data.password?.[0] ||
      data.name?.[0] ||
      data.username?.[0] ||
      data.error ||
      "Registration failed.";

    throw new Error(errorMessage);
  }

  return data;
}


// ==============================
// LOGIN API
// ==============================

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Invalid email or password.");
  }

  localStorage.setItem("stepup_access_token", data.access);
  localStorage.setItem("stepup_refresh_token", data.refresh);
  localStorage.setItem("stepup_user", JSON.stringify(data.user));

  return data;
}


// ==============================
// GOOGLE LOGIN API
// ==============================

export async function googleLoginUser(credential) {
  const response = await fetch(`${API_URL}/auth/google/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      credential,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Google login failed. Please try again."
    );
  }

  localStorage.setItem("stepup_access_token", data.access);
  localStorage.setItem("stepup_refresh_token", data.refresh);
  localStorage.setItem("stepup_user", JSON.stringify(data.user));

  return data;
}


// ==============================
// AUTHORIZATION HEADER
// ==============================

function getAuthHeaders(json = true) {
  const token = localStorage.getItem("stepup_access_token");

  if (!token) {
    throw new Error("Please login again. Access token not found.");
  }

  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  };
}


// ==============================
// PROFILE - GET DETAILS
// ==============================

export async function getUserProfile() {
  const response = await fetch(`${API_URL}/auth/profile/`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || data.error || "Unable to load profile."
    );
  }

  return data;
}


// ==============================
// PROFILE - UPDATE DETAILS
// ==============================

export async function updateUserProfile(profileData) {
  const response = await fetch(`${API_URL}/auth/profile/`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || data.error || "Profile update failed."
    );
  }

  return data;
}


// ==============================
// CUSTOMER - GET MY ORDERS
// ==============================

export async function getMyOrders() {
  const response = await fetch(`${API_URL}/orders/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || data.error || "Unable to load your orders."
    );
  }

  return Array.isArray(data) ? data : data.results || [];
}


// ==============================
// ADMIN - GET PRODUCTS
// ==============================

export async function getAdminProducts() {
  const response = await fetch(`${API_URL}/products/admin/`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to load admin products."
    );
  }

  return data;
}


// ==============================
// ADMIN - ADD PRODUCT
// ==============================

export async function createProduct(productData) {
  const hasImage = productData.image instanceof File;

  let body;
  let headers;

  if (hasImage) {
    body = new FormData();

    Object.entries(productData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        body.append(key, value);
      }
    });

    headers = getAuthHeaders(false);
  } else {
    body = JSON.stringify(productData);
    headers = getAuthHeaders();
  }

  const response = await fetch(`${API_URL}/products/create/`, {
    method: "POST",
    headers,
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}


// ==============================
// ADMIN - UPDATE PRODUCT
// ==============================

export async function updateProduct(id, productData) {
  const hasImage = productData.image instanceof File;

  let body;
  let headers;

  if (hasImage) {
    body = new FormData();

    Object.entries(productData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        body.append(key, value);
      }
    });

    headers = getAuthHeaders(false);
  } else {
    body = JSON.stringify(productData);
    headers = getAuthHeaders();
  }

  const response = await fetch(`${API_URL}/products/${id}/update/`, {
    method: "PATCH",
    headers,
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}


// ==============================
// ADMIN - DELETE PRODUCT
// ==============================

export async function deleteProduct(id) {
  const response = await fetch(
    `${API_URL}/products/${id}/delete/`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let message = "Unable to delete product.";

    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // Keep default error message
    }

    throw new Error(message);
  }

  return true;
}

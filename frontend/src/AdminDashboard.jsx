
import { useEffect, useState } from "react";
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "./api";
import "./AdminDashboard.css";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  image_url: "",
  is_active: true,
};

function AdminDashboard({ user, onBack }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // IMAGE UPLOAD STATES
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const serverUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
    : "http://127.0.0.1:8000";

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [productData, categoryData] = await Promise.all([
        getAdminProducts(),
        getCategories(),
      ]);

      setProducts(productData);
      setCategories(categoryData);
    } catch (err) {
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // FORM INPUT CHANGE
  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // IMAGE SELECT
  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    setError("");
    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  // EDIT PRODUCT
  function startEdit(product) {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock ?? "",
      category: product.category?.id || product.category || "",
      image_url: product.image_url || "",
      is_active: product.is_active,
    });

    setImageFile(null);

    const existingImage = product.image || product.image_url || "";

    if (existingImage) {
      setImagePreview(
        existingImage.startsWith("http")
          ? existingImage
          : `${serverUrl}/${existingImage.replace(/^\/+/, "")}`
      );
    } else {
      setImagePreview("");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // RESET FORM
  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");

    const fileInput = document.getElementById("product-image");

    if (fileInput) {
      fileInput.value = "";
    }
  }

  // SUBMIT PRODUCT
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category || null,
      };

      // Add image only when a new file is selected
      if (imageFile) {
        payload.image = imageFile;
      }

      if (editingId) {
        await updateProduct(editingId, payload);
        alert("Product updated successfully!");
      } else {
        await createProduct(payload);
        alert("Product added successfully!");
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  // DELETE PRODUCT
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await deleteProduct(id);
      alert("Product deleted successfully!");
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    }
  }

  if (!user?.is_staff) {
    return (
      <section className="admin-denied">
        <h2>Access Denied</h2>
        <p>Only administrators can access this page.</p>
        <button onClick={onBack}>Go Back</button>
      </section>
    );
  }

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="admin-label">STEPUP ADMIN PANEL</p>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user.name || user.email}</p>
        </div>

        <button className="admin-back" onClick={onBack}>
          ← Back to Store
        </button>
      </header>

      <section className="admin-stats">
        <article>
          <span>Total Products</span>
          <strong>{products.length}</strong>
        </article>

        <article>
          <span>Active Products</span>
          <strong>
            {products.filter((item) => item.is_active).length}
          </strong>
        </article>

        <article>
          <span>Out of Stock</span>
          <strong>
            {products.filter((item) => item.stock === 0).length}
          </strong>
        </article>
      </section>

      <section className="admin-form-section">
        <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>

        <form onSubmit={handleSubmit} className="admin-product-form">
          <label>
            Product Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Enter shoe name"
            />
          </label>

          <label>
            Product Slug
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              placeholder="example-shoe"
            />
          </label>

          <label>
            Price (₹)
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Stock
            <input
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Category
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Image URL
            <input
              name="image_url"
              type="url"
              value={form.image_url}
              onChange={handleChange}
              placeholder="https://example.com/shoe.jpg"
            />
          </label>

          {/* IMAGE UPLOAD */}
          <div className="admin-full-width admin-image-upload">
            <label htmlFor="product-image">
              Upload Product Image
            </label>

            <input
              id="product-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            <p>Choose an image from your device (Maximum 5 MB).</p>

            {imagePreview && (
              <div className="admin-image-preview">
                <img
                  src={imagePreview}
                  alt="Product Preview"
                />

                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");

                    const input =
                      document.getElementById("product-image");

                    if (input) input.value = "";
                  }}
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

          <label className="admin-full-width">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="4"
            />
          </label>

          <label className="admin-checkbox">
            <input
              name="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={handleChange}
            />
            Active Product
          </label>

          <div className="admin-form-actions admin-full-width">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                ? "Update Product"
                : "Add Product"}
            </button>

            {editingId && (
              <button
                type="button"
                className="admin-cancel"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {error && <p className="admin-error">{error}</p>}

      <section className="admin-products-section">
        <div className="admin-products-heading">
          <h2>Manage Products</h2>
          <button onClick={loadData}>↻ Refresh</button>
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>₹{product.price}</td>
                    <td>{product.stock}</td>
                    <td>
                      {product.is_active ? "Active" : "Inactive"}
                    </td>
                    <td className="admin-actions">
                      <button onClick={() => startEdit(product)}>
                        Edit
                      </button>

                      <button
                        className="admin-delete"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;

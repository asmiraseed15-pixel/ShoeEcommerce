
import React, { useState } from "react";
import "./ContactUs.css";
import shoe from "./assets/shoe.png";
import { sendContactMessage } from "./api.js";

function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await sendContactMessage(formData);

      setSuccess("Your message has been sent successfully!");

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      setError(err.message || "Unable to send your message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">

      {/* Contact Details and Shoe Image */}
      <section className="contact-top">

        <div className="contact-details">
          <h1>Contact Us</h1>

          <div className="contact-group online-orders">
            <h2>For Online Orders</h2>
            <p>Inquiry/Complaint</p>
            <p>9344418518</p>
          </div>

          <div className="contact-group other-queries">
            <h2>Any Other Queries</h2>
            <p>9344418518</p>
            <p>8220418021</p>
            <p>10.00am-7.00pm</p>
            <p className="contact-email">
              Email: customercarestepup.in@gmail.com
            </p>
          </div>
        </div>

        <div className="contact-image">
          <img src={shoe} alt="StepUp Shoe" />
        </div>

      </section>

      {/* Enquiry Form */}
      <section className="enquiry-section">
        <h2>Enquiry Form</h2>

        <form
          className="enquiry-form"
          onSubmit={handleSubmit}
        >

          {/* Name */}
          <div className="form-group">
            <label htmlFor="contact-name">Name</label>

            <input
              id="contact-name"
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email and Phone */}
          <div className="form-row">

            <div className="form-group">
              <label htmlFor="contact-email">Email</label>

              <input
                id="contact-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-phone">Phone</label>

              <input
                id="contact-phone"
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          {/* Message */}
          <div className="form-group message-group">
            <label htmlFor="contact-message">Message</label>

            <textarea
              id="contact-message"
              name="message"
              placeholder="Write your message..."
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          {/* Success and Error Messages */}
          {success && (
            <p style={{ color: "green" }} role="status">
              {success}
            </p>
          )}

          {error && (
            <p style={{ color: "red" }} role="alert">
              {error}
            </p>
          )}

          {/* Send Button */}
          <button
            type="submit"
            className="contact-send-btn"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send"}
          </button>

        </form>
      </section>

    </div>
  );
}

export default ContactUs;
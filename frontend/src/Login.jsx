

import { useState } from "react";
import "./Login.css";
import { GoogleLogin } from "@react-oauth/google";
import {
  registerUser,
  loginUser,
  googleLoginUser,
} from "./api";

export default function Login({ onLogin, onRegister }) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);

  const passwordStrength = () => {
    if (!password) return "";

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return "Weak";
    if (score <= 4) return "Medium";
    return "Strong";
  };

  // ==============================
  // GOOGLE LOGIN
  // ==============================

  async function handleGoogleSuccess(response) {
    if (!response.credential) {
      alert("Google authentication failed. Please try again.");
      return;
    }

    try {
      setLoading(true);

      const data = await googleLoginUser(response.credential);

      if (onLogin) {
        onLogin(data.user);
      } else if (onRegister) {
        onRegister(data.user);
      }
    } catch (error) {
      console.error("Google login error:", error);
      alert(error.message || "Google login failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleError() {
    alert("Google Sign-In failed. Please try again.");
  }

  // ==============================
  // EMAIL LOGIN / REGISTER
  // ==============================

  async function handleSubmit(e) {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (isRegister) {
      if (!name.trim()) {
        alert("Please enter your full name.");
        return;
      }

      if (!/^[6-9]\d{9}$/.test(phone)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
      }

      const strongPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

      if (!strongPassword.test(password)) {
        alert(
          "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character."
        );
        return;
      }

      if (password !== confirmPassword) {
        alert("Password and Confirm Password do not match.");
        return;
      }

      if (!accepted) {
        alert("Please accept Terms and Conditions.");
        return;
      }

      try {
        setLoading(true);

        await registerUser({
          name: name.trim(),
          email: normalizedEmail,
          phone,
          password,
        });

        alert("Account created successfully! Please Login.");

        switchMode(false);
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    } else {
      if (password.length < 8) {
        alert("Password must contain at least 8 characters.");
        return;
      }

      try {
        setLoading(true);

        const data = await loginUser(
          normalizedEmail,
          password
        );

        if (onLogin) {
          onLogin(data.user);
        } else {
          alert("Login successful!");
        }
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    }
  }

  // ==============================
  // SWITCH LOGIN / REGISTER
  // ==============================

  function switchMode(registerMode) {
    setIsRegister(registerMode);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setAccepted(false);
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>STEPUP</h1>
        <p className="login-welcome">Welcome to StepUp</p>

        <div className="login-tabs">
          <button
            className={!isRegister ? "active" : ""}
            onClick={() => switchMode(false)}
            type="button"
          >
            Login
          </button>

          <button
            className={isRegister ? "active" : ""}
            onClick={() => switchMode(true)}
            type="button"
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="login-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="login-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  maxLength={10}
                  required
                />
              </div>
            </>
          )}

          <div className="login-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label>Password</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {isRegister && password && (
              <p className="password-strength">
                Password Strength:{" "}
                <strong>{passwordStrength()}</strong>
              </p>
            )}

            {isRegister && (
              <small>
                8+ characters, uppercase, lowercase, number and special
                character.
              </small>
            )}
          </div>

          {isRegister && (
            <div className="login-field">
              <label>Confirm Password</label>

              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {confirmPassword && (
                <small>
                  {password === confirmPassword
                    ? "Passwords match."
                    : "Passwords do not match."}
                </small>
              )}
            </div>
          )}

          {!isRegister && (
            <button
              type="button"
              className="forgot-password"
              onClick={() =>
                alert("Password reset requires backend connection.")
              }
            >
              Forgot Password?
            </button>
          )}

          {isRegister && (
            <label className="terms-label">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />

              <span>
                I have read and agreed to the Terms and Conditions and
                Privacy Policy.
              </span>
            </label>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create Account"
                : "Login"}
          </button>
        </form>

        <div className="login-divider">
          <span>OR</span>
        </div>

        {/* GOOGLE SIGN IN */}

        <div className="google-login">
          {loading ? (
            <p>Please wait...</p>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="continue_with"
              theme="outline"
              size="large"
              shape="rectangular"
              width="300"
            />
          )}
        </div>

        <p className="login-switch">
          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={() => switchMode(!isRegister)}
          >
            {isRegister ? " Login" : " Register"}
          </button>
        </p>
      </div>
    </main>
  );
}

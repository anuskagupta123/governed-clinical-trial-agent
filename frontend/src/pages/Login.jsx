import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const users = JSON.parse(
      localStorage.getItem("clinexa_users") || "[]"
    );

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    );

    if (!user) {
      setError("Invalid email or password.");
      return;
    }

    localStorage.setItem("clinexa_user", JSON.stringify(user));

    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-brand">
          <div className="brand-icon">+</div>
          <div>
            <h1>Clinexa</h1>
            <p>Trial Governance</p>
          </div>
        </div>

        <div className="auth-header">
          <span>WELCOME BACK</span>
          <h2>Sign in to Clinexa</h2>
          <p>
            Access your clinical research screening workspace.
          </p>
        </div>

        <form onSubmit={handleLogin}>

          <label>Email address</label>
          <input
            type="email"
            placeholder="you@organization.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="auth-error">
              ⚠ {error}
            </div>
          )}

          <button className="auth-button" type="submit">
            Sign in →
          </button>
        </form>

        <div className="auth-divider">
          <span>NEW TO CLINEXA?</span>
        </div>

        <Link to="/signup" className="secondary-auth-button">
          Create an account
        </Link>

        <div className="auth-footer">
          <span>Privacy-first</span>
          <span>•</span>
          <span>Audit-ready</span>
          <span>•</span>
          <span>Human oversight</span>
        </div>

      </div>
    </div>
  );
}
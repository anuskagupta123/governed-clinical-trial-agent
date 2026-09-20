import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    role: "Researcher",
    password: "",
  });

  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");

    const users = JSON.parse(
      localStorage.getItem("clinexa_users") || "[]"
    );

    const exists = users.some(
      (u) => u.email.toLowerCase() === form.email.toLowerCase()
    );

    if (exists) {
      setError("An account with this email already exists.");
      return;
    }

    const newUser = {
      id: crypto.randomUUID(),
      name: form.name,
      email: form.email,
      organization: form.organization,
      role: form.role,
      password: form.password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    localStorage.setItem(
      "clinexa_users",
      JSON.stringify(users)
    );

    localStorage.setItem(
      "clinexa_user",
      JSON.stringify(newUser)
    );

    localStorage.setItem(
      "clinexa_onboarding_complete",
      "false"
    );

    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-card signup-card">

        <div className="auth-brand">
          <div className="brand-icon">+</div>
          <div>
            <h1>Clinexa</h1>
            <p>Trial Governance</p>
          </div>
        </div>

        <div className="auth-header">
          <span>GET STARTED</span>
          <h2>Create your account</h2>
          <p>
            Set up your clinical research workspace.
          </p>
        </div>

        <form onSubmit={handleSignup}>

          <label>Full name</label>
          <input
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={(e) =>
              updateField("name", e.target.value)
            }
            required
          />

          <label>Work email</label>
          <input
            type="email"
            placeholder="you@organization.com"
            value={form.email}
            onChange={(e) =>
              updateField("email", e.target.value)
            }
            required
          />

          <label>Organization</label>
          <input
            type="text"
            placeholder="Research organization"
            value={form.organization}
            onChange={(e) =>
              updateField("organization", e.target.value)
            }
            required
          />

          <label>Your role</label>

          <select
            value={form.role}
            onChange={(e) =>
              updateField("role", e.target.value)
            }
          >
            <option>Researcher</option>
            <option>Clinical Research Coordinator</option>
            <option>Clinical Data Manager</option>
            <option>Clinical Trial Manager</option>
            <option>Auditor</option>
            <option>Administrator</option>
          </select>

          <label>Password</label>

          <input
            type="password"
            placeholder="Create a password"
            value={form.password}
            onChange={(e) =>
              updateField("password", e.target.value)
            }
            required
            minLength={6}
          />

          <div className="demo-notice">
            🔒 Demo environment
            <p>
              This hackathon application uses synthetic/
              de-identified patient data.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              ⚠ {error}
            </div>
          )}

          <button className="auth-button" type="submit">
            Create account →
          </button>

        </form>

        <div className="auth-switch">
          Already have an account?
          <Link to="/login"> Sign in</Link>
        </div>

      </div>
    </div>
  );
}
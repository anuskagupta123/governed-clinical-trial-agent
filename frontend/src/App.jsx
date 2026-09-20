import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Lock,
  LogIn,
  LogOut,
  Menu,
  Network,
  Play,
  Settings,
  ShieldCheck,
  Stethoscope,
  User,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";

import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";


// ============================================================
// AUTH HELPERS
// ============================================================

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("clinexa_user") || "null");
  } catch {
    return null;
  }
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("clinexa_users") || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem("clinexa_users", JSON.stringify(users));
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem("clinexa_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("clinexa_user");
  }
}

function isAuthenticated() {
  return Boolean(getCurrentUser());
}

function getInitials(name = "User") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";
}


// ============================================================
// APP
// ============================================================

export default function App() {
  return (
    <Routes>

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/signup"
        element={<SignupPage />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate
              to="/dashboard"
              replace
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}


// ============================================================
// PROTECTED ROUTE
// ============================================================

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


// ============================================================
// LOGIN PAGE
// ============================================================

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const users = getUsers();
    const user = users.find(
      (item) =>
        item.email?.toLowerCase() === email.trim().toLowerCase() &&
        item.password === password
    );

    if (!user) {
      setError("Account not found or password is incorrect. Please sign up first.");
      return;
    }

    setCurrentUser(user);
    navigate("/dashboard");
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your clinical trial governance workspace."
    >

      <form
        className="auth-form"
        onSubmit={handleLogin}
      >

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <label>
          Work email
        </label>

        <div className="input-wrap">

          <User size={17} />

          <input
            type="email"
            placeholder="you@organization.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

        </div>

        <label>
          Password
        </label>

        <div className="input-wrap">

          <Lock size={17} />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

        </div>

        <div className="auth-options">

          <label className="checkbox-label">

            <input
              type="checkbox"
            />

            Remember me

          </label>

          <button
            type="button"
            className="text-button"
          >
            Forgot password?
          </button>

        </div>

        <button
          className="primary-auth-button"
          type="submit"
        >

          <LogIn size={17} />

          Sign in

        </button>

      </form>

      <div className="auth-divider">
        <span>DEMO ENVIRONMENT</span>
      </div>

      <div className="demo-note">

        <ShieldCheck size={17} />

        <div>

          <strong>
            Synthetic clinical data
          </strong>

          <span>
            This demonstration uses synthetic /
            de-identified patient records.
          </span>

        </div>

      </div>

      <div className="auth-footer">

        Don't have an account?

        <Link to="/signup">
          Create account
        </Link>

      </div>

    </AuthLayout>
  );
}


// ============================================================
// SIGNUP PAGE
// ============================================================

function SignupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState("Researcher");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !organization.trim() || !password) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((item) => item.email?.toLowerCase() === normalizedEmail)) {
      setError("An account with this email already exists. Please sign in.");
      return;
    }

    const user = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      organization: organization.trim(),
      role,
      password,
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, user]);
    setCurrentUser(user);
    navigate("/dashboard");
  };

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="Set up your clinical research governance workspace."
    >
      <form className="auth-form" onSubmit={handleSignup}>
        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <label>Full name</label>
        <div className="input-wrap">
          <User size={17} />
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <label>Work email</label>
        <div className="input-wrap">
          <UserPlus size={17} />
          <input
            type="email"
            placeholder="you@organization.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <label>Organization</label>
        <div className="input-wrap">
          <Stethoscope size={17} />
          <input
            type="text"
            placeholder="Research organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            required
          />
        </div>

        <label>Role</label>
        <select
          className="auth-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option>Researcher</option>
          <option>Clinical Research Coordinator</option>
          <option>Clinical Data Manager</option>
          <option>Clinical Trial Manager</option>
          <option>Auditor</option>
          <option>Administrator</option>
        </select>

        <label>Password</label>
        <div className="input-wrap">
          <Lock size={17} />
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>

        <button className="primary-auth-button" type="submit">
          <UserPlus size={17} />
          Create workspace
        </button>
      </form>

      <div className="auth-footer">
        Already have an account?
        <Link to="/login">Sign in</Link>
      </div>
    </AuthLayout>
  );
}


// ============================================================
// AUTH LAYOUT
// ============================================================

function AuthLayout({
  children,
  title,
  subtitle,
}) {
  return (
    <div className="auth-page">

      <div className="auth-brand">

        <div className="auth-brand-icon">
          <Stethoscope size={24} />
        </div>

        <div>

          <strong>
            Clinexa
          </strong>

          <span>
            Trial Governance Platform
          </span>

        </div>

      </div>

      <div className="auth-content">

        <div className="auth-visual">

          <div className="visual-badge">
            <ShieldCheck size={15} />
            GOVERNED CLINICAL AI
          </div>

          <h1>
            Safer screening.
            <br />
            <span>Stronger evidence.</span>
          </h1>

          <p>
            A governed workflow for protocol
            interpretation, privacy-aware patient
            screening and regulatory traceability.
          </p>

          <div className="visual-features">

            <Feature
              icon={<ShieldCheck size={17} />}
              title="Privacy-first"
              text="PII detection and scrubbing"
            />

            <Feature
              icon={<Zap size={17} />}
              title="Deterministic"
              text="Rules-based eligibility decisions"
            />

            <Feature
              icon={<FileCheck2 size={17} />}
              title="Audit-ready"
              text="Traceable evidence and citations"
            />

          </div>

        </div>

        <div className="auth-card">

          <div className="auth-heading">

            <h2>
              {title}
            </h2>

            <p>
              {subtitle}
            </p>

          </div>

          {children}

        </div>

      </div>

      <div className="auth-copyright">
        Clinexa · Synthetic demonstration environment
      </div>

    </div>
  );
}


function Feature({
  icon,
  title,
  text,
}) {
  return (
    <div className="visual-feature">

      <div className="visual-feature-icon">
        {icon}
      </div>

      <div>

        <strong>
          {title}
        </strong>

        <span>
          {text}
        </span>

      </div>

    </div>
  );
}


// ============================================================
// APP LAYOUT
// ============================================================

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const currentUser = getCurrentUser() || {
    name: "User",
    role: "Researcher",
  };

  const logout = () => {
    setCurrentUser(null);
    navigate("/login");
  };

  const pageTitle = getPageTitle(
    location.pathname
  );

  return (
    <div className="product-shell">

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`app-sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >

        <div className="product-brand">

          <div className="product-logo">
            <Stethoscope size={22} />
          </div>

          <div>

            <strong>
              Clinexa
            </strong>

            <span>
              Trial Governance
            </span>

          </div>

        </div>

        <div className="workspace-selector">

          <div className="workspace-icon">
            <Activity size={15} />
          </div>

          <div>

            <span>
              WORKSPACE
            </span>

            <strong>
              Clinical Research
            </strong>

          </div>

          <ChevronRight
            size={15}
          />

        </div>

        <div className="nav-group">

          <div className="nav-group-title">
            WORKSPACE
          </div>

          <SidebarLink
            to="/dashboard"
            icon={<LayoutDashboard />}
            label="Dashboard"
            onClick={() =>
              setSidebarOpen(false)
            }
          />

          <SidebarLink
            to="/screening"
            icon={<ClipboardCheck />}
            label="Patient Screening"
            onClick={() =>
              setSidebarOpen(false)
            }
          />

          <SidebarLink
            to="/audits"
            icon={<FileCheck2 />}
            label="Audit Dossiers"
            onClick={() =>
              setSidebarOpen(false)
            }
          />

          <SidebarLink
            to="/protocols"
            icon={<FileText />}
            label="Protocols"
            onClick={() =>
              setSidebarOpen(false)
            }
          />

        </div>

        <div className="nav-group">

          <div className="nav-group-title">
            GOVERNANCE
          </div>

          <SidebarLink
            to="/governance"
            icon={<ShieldCheck />}
            label="Governance Center"
            onClick={() =>
              setSidebarOpen(false)
            }
          />

          <SidebarLink
            to="/settings"
            icon={<Settings />}
            label="Settings"
            onClick={() =>
              setSidebarOpen(false)
            }
          />

          <SidebarLink
            to="/help"
            icon={<HelpCircle />}
            label="Help & Guide"
            onClick={() =>
              setSidebarOpen(false)
            }
          />

        </div>

        <div className="sidebar-bottom">

          <div className="operational-card">

            <div className="operational-top">

              <span className="online-indicator" />

              <strong>
                System operational
              </strong>

            </div>

            <span>
              Synthetic environment
            </span>

          </div>

          <button
            className="logout-button"
            onClick={logout}
          >

            <LogOut size={16} />

            Sign out

          </button>

          <div className="sidebar-version">
            Clinexa v1.0.0
          </div>

        </div>

      </aside>

      {/* MAIN */}

      <div className="app-main">

        <header className="app-header">

          <button
            className="mobile-menu"
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            <Menu />
          </button>

          <div className="header-page">

            <span>
              CLINICAL RESEARCH
            </span>

            <h1>
              {pageTitle}
            </h1>

          </div>

          <div className="header-actions">

            <div className="header-status">

              <span className="online-indicator" />

              API Online

            </div>

            <div className="header-divider" />

            <div className="user-profile">

              <div className="user-avatar">
                {getInitials(currentUser.name)}
              </div>

              <div>
                <strong>
                  {currentUser.name}
                </strong>

                <span>
                  {currentUser.role || "Researcher"}
                </span>
              </div>

            </div>

          </div>

        </header>

        <div className="page-content">

          <Routes>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/screening"
              element={<Screening />}
            />

            <Route
              path="/audits"
              element={<Audits />}
            />

            <Route
              path="/protocols"
              element={<Protocols />}
            />

            <Route
              path="/governance"
              element={<Governance />}
            />

            <Route
              path="/settings"
              element={<SettingsPage />}
            />

            <Route
              path="/help"
              element={<HelpPage />}
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

          </Routes>

        </div>

      </div>

    </div>
  );
}


// ============================================================
// SIDEBAR LINK
// ============================================================

function SidebarLink({
  to,
  icon,
  label,
  onClick,
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `sidebar-link ${
          isActive
            ? "sidebar-link-active"
            : ""
        }`
      }
    >

      <span className="sidebar-link-icon">
        {icon}
      </span>

      <span>
        {label}
      </span>

      <ChevronRight
        className="sidebar-chevron"
        size={14}
      />

    </NavLink>
  );
}


// ============================================================
// DASHBOARD
// ============================================================

function Dashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser() || {
    name: "Researcher",
  };

  const [patients, setPatients] =
    useState([]);

  const [backendOnline, setBackendOnline] =
    useState(false);

  useEffect(() => {
    checkDashboard();
  }, []);

  const checkDashboard = async () => {
    try {
      await axios.get(
        `${API_BASE}/health`
      );

      const response =
        await axios.get(
          `${API_BASE}/patients`
        );

      setBackendOnline(true);

      const list =
        normalizePatients(
          response.data
        );

      setPatients(list);
    } catch {
      setBackendOnline(false);
    }
  };

  return (
    <div className="dashboard-page">

      {/* WELCOME */}

      <section className="welcome-section">

        <div>

          <div className="page-eyebrow">
            CLINICAL RESEARCH WORKSPACE
          </div>

          <h2>
            Good evening, {currentUser.name?.split(" ")[0] || "Researcher"}.
          </h2>

          <p>
            Here's an overview of your active
            clinical screening workspace.
          </p>

        </div>

        <button
          className="primary-button"
          onClick={() =>
            navigate("/screening")
          }
        >

          <Play size={16} />

          Start screening

        </button>

      </section>

      {/* TRIAL */}

      <section className="dashboard-trial">

        <div className="trial-symbol">
          <Activity size={25} />
        </div>

        <div className="dashboard-trial-info">

          <div className="page-eyebrow">
            ACTIVE TRIAL
          </div>

          <div className="dashboard-trial-title">

            <h3>
              SYN-DM-001
            </h3>

            <span className="active-badge">
              ACTIVE
            </span>

          </div>

          <p>
            A Synthetic Phase II Study of an
            Investigational Therapy in Adults
            With Type 2 Diabetes
          </p>

        </div>

        <div className="trial-metric">

          <strong>
            7
          </strong>

          <span>
            criteria
          </span>

        </div>

      </section>

      {/* STATISTICS */}

      <div className="stat-grid">

        <StatCard
          icon={<Users />}
          title="Synthetic patients"
          value={patients.length || 4}
          detail="Available for screening"
          color="blue"
        />

        <StatCard
          icon={<ClipboardCheck />}
          title="Protocol criteria"
          value="7"
          detail="4 inclusion · 3 exclusion"
          color="green"
        />

        <StatCard
          icon={<ShieldCheck />}
          title="Privacy controls"
          value="Active"
          detail="PII scrubbing enabled"
          color="purple"
        />

        <StatCard
          icon={<FileCheck2 />}
          title="Audit readiness"
          value="100%"
          detail="Structured evidence"
          color="orange"
        />

      </div>

      {/* QUICK ACTIONS */}

      <section className="content-grid">

        <div className="panel">

          <PanelHeader
            eyebrow="QUICK ACTIONS"
            title="What would you like to do?"
          />

          <div className="action-list">

            <ActionItem
              icon={<ClipboardCheck />}
              title="Screen a patient"
              description="Evaluate eligibility against the active protocol."
              onClick={() =>
                navigate("/screening")
              }
            />

            <ActionItem
              icon={<FileText />}
              title="Review protocol"
              description="View structured inclusion and exclusion criteria."
              onClick={() =>
                navigate("/protocols")
              }
            />

            <ActionItem
              icon={<FileCheck2 />}
              title="Open audit dossiers"
              description="Review generated regulatory screening records."
              onClick={() =>
                navigate("/audits")
              }
            />

          </div>

        </div>

        <div className="panel">

          <PanelHeader
            eyebrow="SYSTEM STATUS"
            title="Governance controls"
          />

          <div className="status-list">

            <StatusItem
              icon={<ShieldCheck />}
              title="Privacy layer"
              value="Operational"
            />

            <StatusItem
              icon={<Zap />}
              title="Decision engine"
              value="Deterministic"
            />

            <StatusItem
              icon={<FileCheck2 />}
              title="Audit trail"
              value="Enabled"
            />

            <StatusItem
              icon={<Users />}
              title="Human review"
              value="Enabled"
            />

          </div>

        </div>

      </section>

      {/* WORKFLOW */}

      <section className="panel workflow-panel">

        <PanelHeader
          eyebrow="SCREENING WORKFLOW"
          title="How Clinexa works"
          description="A governed pipeline designed to keep protocol interpretation separate from final eligibility decisions."
        />

        <div className="workflow">

          <WorkflowStep
            number="01"
            icon={<FileText />}
            title="Protocol ingestion"
            text="Clinical trial PDF is parsed and structured."
          />

          <WorkflowLine />

          <WorkflowStep
            number="02"
            icon={<Network />}
            title="Criteria extraction"
            text="Lyzr structures inclusion and exclusion criteria."
          />

          <WorkflowLine />

          <WorkflowStep
            number="03"
            icon={<ShieldCheck />}
            title="Privacy screening"
            text="PII is detected and scrubbed."
          />

          <WorkflowLine />

          <WorkflowStep
            number="04"
            icon={<ClipboardCheck />}
            title="Deterministic evaluation"
            text="Rules produce a traceable screening outcome."
          />

          <WorkflowLine />

          <WorkflowStep
            number="05"
            icon={<FileCheck2 />}
            title="Audit dossier"
            text="Evidence and citations are recorded."
          />

        </div>

      </section>

    </div>
  );
}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon,
  title,
  value,
  detail,
  color,
}) {
  return (
    <div className="stat-card">

      <div
        className={`stat-icon ${color}`}
      >
        {icon}
      </div>

      <div>

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {detail}
        </small>

      </div>

    </div>
  );
}


// ============================================================
// SCREENING
// ============================================================

function Screening() {
  const [patients, setPatients] =
    useState([]);

  const [selectedPatient, setSelectedPatient] =
    useState(null);

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [backendOnline, setBackendOnline] =
    useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setError("");

      await axios.get(
        `${API_BASE}/health`
      );

      setBackendOnline(true);

      const response =
        await axios.get(
          `${API_BASE}/patients`
        );

      const list =
        normalizePatients(
          response.data
        );

      setPatients(list);

      if (list.length > 0) {
        await screenPatient(
          list[0]
        );
      }

    } catch (err) {
      console.error(err);

      setBackendOnline(false);

      setError(
        "Unable to connect to the screening backend."
      );
    }
  };

  const screenPatient = async (
    patient
  ) => {

    const id =
      getPatientId(patient);

    const number =
      getPatientNumber(patient);

    if (!number) {
      setError(
        "Invalid synthetic patient identifier."
      );
      return;
    }

    try {

      setSelectedPatient(patient);

      setLoading(true);

      setError("");

      const response =
        await axios.get(
          `${API_BASE}/screen/${number}`
        );

      console.log(
        "SCREENING RESPONSE:",
        response.data
      );

      setResult(response.data);

    } catch (err) {

      console.error(err);

      setError(
        `Unable to screen ${id}.`
      );

      setResult(null);

    } finally {

      setLoading(false);

    }
  };

  const criteria =
    result?.criteria_results ||
    result?.criteria ||
    result?.evidence ||
    result?.criterion_results ||
    [];

  const stats =
    calculateStats(criteria);

  const decision =
    String(
      result?.decision ||
      ""
    ).toUpperCase();

  const decisionClass =
    decision === "ELIGIBLE"
      ? "eligible"
      : decision === "INELIGIBLE"
      ? "ineligible"
      : "review";

  const completeness =
    Math.round(
      Number(
        result?.evidence_completeness ||
        0
      ) * 100
    );

  return (
    <div className="screening-page">

      <div className="screening-intro">

        <div>

          <div className="page-eyebrow">
            PATIENT EVALUATION
          </div>

          <h2>
            Screen a patient
          </h2>

          <p>
            Evaluate a synthetic participant
            against the active clinical trial
            protocol.
          </p>

        </div>

        <div className="backend-chip">

          <span
            className={
              backendOnline
                ? "online-indicator"
                : "offline-indicator"
            }
          />

          {backendOnline
            ? "Screening engine online"
            : "Backend offline"}

        </div>

      </div>

      {error && (
        <div className="error-banner">

          <AlertCircle size={17} />

          {error}

        </div>
      )}

      {/* TRIAL BAR */}

      <div className="trial-context">

        <div className="trial-context-icon">
          <Activity />
        </div>

        <div>

          <span>
            ACTIVE PROTOCOL
          </span>

          <strong>
            SYN-DM-001
          </strong>

          <small>
            Phase II · Type 2 Diabetes
          </small>

        </div>

        <div className="trial-context-right">

          <strong>
            7
          </strong>

          <span>
            criteria
          </span>

        </div>

      </div>

      {/* PATIENT SELECTOR */}

      <section className="panel">

        <PanelHeader
          eyebrow="STEP 1"
          title="Select a synthetic patient"
          description="Choose a study participant to begin governed eligibility evaluation."
        />

        <div className="patient-grid-new">

          {patients.map(
            (patient) => {

              const id =
                getPatientId(
                  patient
                );

              const selected =
                getPatientId(
                  selectedPatient
                ) === id;

              return (

                <button
                  key={id}
                  className={`patient-card-new ${
                    selected
                      ? "patient-selected"
                      : ""
                  }`}
                  onClick={() =>
                    screenPatient(
                      patient
                    )
                  }
                >

                  <div className="patient-number">
                    {String(id).slice(-1)}
                  </div>

                  <div className="patient-card-info">

                    <strong>
                      {id}
                    </strong>

                    <span>
                      Synthetic study participant
                    </span>

                  </div>

                  <ChevronRight />

                </button>

              );
            }
          )}

        </div>

      </section>

      {loading && (

        <div className="screening-loading">

          <div className="large-spinner" />

          <div>

            <strong>
              Evaluating patient...
            </strong>

            <span>
              Applying privacy controls and
              deterministic protocol rules.
            </span>

          </div>

        </div>

      )}

      {!loading && result && (

        <>

          {/* RESULT */}

          <section className="screen-result-grid">

            <div
              className={`screen-decision ${decisionClass}`}
            >

              <div className="result-heading">

                <div>

                  <span>
                    SCREENING DECISION
                  </span>

                  <h2>
                    {getPatientId(
                      selectedPatient
                    )}
                  </h2>

                </div>

                <div className="result-symbol">

                  {decision ===
                  "ELIGIBLE" ? (
                    <Check />
                  ) : decision ===
                    "INELIGIBLE" ? (
                    <X />
                  ) : (
                    <AlertCircle />
                  )}

                </div>

              </div>

              <div className="big-decision">
                {decision}
              </div>

              <p>

                {decision ===
                  "ELIGIBLE" &&
                  "All required protocol criteria are satisfied based on available evidence."}

                {decision ===
                  "INELIGIBLE" &&
                  "One or more protocol criteria are not satisfied."}

                {decision.includes(
                  "HUMAN"
                ) &&
                  "Required evidence is incomplete or ambiguous. Human review is required."}

              </p>

              <div className="completeness">

                <div>

                  <span>
                    Evidence completeness
                  </span>

                  <strong>
                    {completeness}%
                  </strong>

                </div>

                <div className="progress">

                  <div
                    style={{
                      width: `${completeness}%`,
                    }}
                  />

                </div>

              </div>

            </div>

            <div className="privacy-panel">

              <div className="privacy-heading">

                <div className="privacy-icon">
                  <ShieldCheck />
                </div>

                <div>

                  <span>
                    GOVERNANCE CONTROL
                  </span>

                  <h3>
                    Privacy & Safety
                  </h3>

                </div>

              </div>

              <div className="privacy-status">

                <Check size={16} />

                <div>

                  <strong>
                    {result.privacy?.status ||
                      "SCRUBBED"}
                  </strong>

                  <span>
                    Patient data processed through
                    the privacy layer.
                  </span>

                </div>

              </div>

              <GovernanceRow
                label="PII detected"
                value={
                  result.privacy
                    ?.pii_detected
                    ? "Yes"
                    : "No"
                }
              />

              <GovernanceRow
                label="Decision engine"
                value="Deterministic"
              />

              <GovernanceRow
                label="Human review"
                value="Enabled"
              />

            </div>

          </section>

          {/* HUMAN REVIEW */}

          {decision.includes(
            "HUMAN"
          ) && (

            <div className="human-review">

              <div className="human-review-icon">
                !
              </div>

              <div>

                <strong>
                  Human review required
                </strong>

                <p>
                  The system does not have
                  sufficient evidence to make
                  a complete determination.
                  No missing clinical value was
                  inferred.
                </p>

              </div>

              <span>
                HITL
              </span>

            </div>

          )}

          {/* EVIDENCE */}

          <section className="panel">

            <PanelHeader
              eyebrow="STEP 2"
              title="Review eligibility evidence"
              description="Each criterion is evaluated independently and linked to protocol evidence."
            />

            <div className="evidence-summary">

              <EvidenceCount
                value={stats.passed}
                label="Passed"
                type="pass"
              />

              <EvidenceCount
                value={stats.failed}
                label="Failed"
                type="fail"
              />

              <EvidenceCount
                value={stats.unknown}
                label="Unknown"
                type="unknown"
              />

              <EvidenceCount
                value={stats.total}
                label="Total"
                type="total"
              />

            </div>

            <div className="evidence-list">

              {criteria.map(
                (criterion, index) => {

                  const status =
                    String(
                      criterion.result ||
                      criterion.status ||
                      criterion.outcome ||
                      "UNKNOWN"
                    ).toUpperCase();

                  const pass =
                    status.includes(
                      "PASS"
                    );

                  const fail =
                    status.includes(
                      "FAIL"
                    );

                  const statusClass =
                    pass
                      ? "pass"
                      : fail
                      ? "fail"
                      : "unknown";

                  return (

                    <div
                      className="evidence-row"
                      key={
                        criterion.id ||
                        index
                      }
                    >

                      <div
                        className={`evidence-status ${statusClass}`}
                      >

                        {pass ? (
                          <Check />
                        ) : fail ? (
                          <X />
                        ) : (
                          "?"
                        )}

                      </div>

                      <div className="evidence-body">

                        <div className="evidence-meta">

                          <strong>
                            {criterion.id ||
                              `CRITERION-${index + 1}`}
                          </strong>

                          <span>
                            {String(
                              criterion.criterion_type ||
                              criterion.type ||
                              "INCLUSION"
                            ).toUpperCase()}
                          </span>

                        </div>

                        <h4>
                          {criterion.description ||
                            criterion.criterion ||
                            "Protocol criterion"}
                        </h4>

                        <div className="evidence-values">

                          <div>

                            <span>
                              EXPECTED
                            </span>

                            <strong>
                              {formatValue(
                                criterion.expected ??
                                criterion.expected_value ??
                                criterion.value
                              )}
                            </strong>

                          </div>

                          <div>

                            <span>
                              OBSERVED
                            </span>

                            <strong>
                              {formatValue(
                                criterion.patient_value ??
                                criterion.patientValue ??
                                criterion.actual_value ??
                                criterion.observed_value
                              )}
                            </strong>

                          </div>

                        </div>

                        <div className="evidence-citation">

                          <FileText size={13} />

                          {criterion.citation ||
                            criterion.source ||
                            "Protocol source"}

                        </div>

                      </div>

                      <span
                        className={`evidence-label ${statusClass}`}
                      >
                        {pass
                          ? "PASS"
                          : fail
                          ? "FAIL"
                          : "UNKNOWN"}
                      </span>

                    </div>

                  );
                }
              )}

            </div>

          </section>

          {/* NEXT STEP */}

          <section className="next-step-card">

            <div className="next-step-icon">
              <FileCheck2 />
            </div>

            <div>

              <span>
                STEP 3
              </span>

              <h3>
                Create the audit dossier
              </h3>

              <p>
                Generate a regulatory-ready
                record containing the decision,
                evidence, citations and
                governance metadata.
              </p>

            </div>

            <button
              onClick={() =>
                generateAudit(
                  selectedPatient
                )
              }
              className="primary-button"
            >

              Generate dossier

              <ArrowRight size={16} />

            </button>

          </section>

        </>

      )}

    </div>
  );
}


// ============================================================
// AUDITS
// ============================================================

function Audits() {
  const [selectedPatient, setSelectedPatient] =
    useState("SYN-001");

  const [generating, setGenerating] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const patients = [
    "SYN-001",
    "SYN-002",
    "SYN-003",
    "SYN-004",
  ];

  const createAudit = async () => {

    const number =
      selectedPatient.match(
        /(\d+)$/
      )?.[1];

    if (!number) return;

    try {

      setGenerating(true);
      setMessage("");

      await axios.get(
        `${API_BASE}/audit/${number}`
      );

      setMessage(
        `Audit dossier generated successfully for ${selectedPatient}.`
      );

    } catch (err) {

      console.error(err);

      setMessage(
        "Unable to generate the audit dossier."
      );

    } finally {

      setGenerating(false);

    }
  };

  return (
    <div>

      <PageHero
        eyebrow="REGULATORY TRACEABILITY"
        title="Audit dossiers"
        description="Generate and review structured screening records for regulatory traceability."
      />

      {message && (
        <div className="success-banner">

          <Check size={17} />

          {message}

        </div>
      )}

      <section className="panel">

        <PanelHeader
          eyebrow="GENERATE REPORT"
          title="Create an audit dossier"
          description="Select a synthetic participant to generate their JSON and PDF audit record."
        />

        <div className="audit-generator">

          <div className="audit-select">

            <label>
              Study participant
            </label>

            <select
              value={selectedPatient}
              onChange={(e) =>
                setSelectedPatient(
                  e.target.value
                )
              }
            >

              {patients.map(
                (patient) => (
                  <option
                    key={patient}
                    value={patient}
                  >
                    {patient}
                  </option>
                )
              )}

            </select>

          </div>

          <button
            className="primary-button"
            onClick={
              createAudit
            }
            disabled={
              generating
            }
          >

            {generating
              ? "Generating..."
              : "Generate audit dossier"}

            <ArrowRight size={16} />

          </button>

        </div>

      </section>

      <section className="panel">

        <PanelHeader
          eyebrow="AVAILABLE REPORTS"
          title="Audit history"
        />

        <div className="audit-table">

          {patients.map(
            (patient, index) => (

              <div
                className="audit-row"
                key={patient}
              >

                <div className="audit-file-icon">
                  <FileCheck2 />
                </div>

                <div className="audit-file-info">

                  <strong>
                    {patient}_audit
                  </strong>

                  <span>
                    SYN-DM-001 · Screening dossier
                  </span>

                </div>

                <span className="audit-date">
                  Synthetic record
                </span>

                <span className="audit-ready">
                  READY
                </span>

                <button
                  className="icon-button"
                  onClick={() => {
                    setSelectedPatient(
                      patient
                    );
                  }}
                >
                  <ChevronRight />
                </button>

              </div>

            )
          )}

        </div>

      </section>

    </div>
  );
}


// ============================================================
// PROTOCOLS
// ============================================================

function Protocols() {
  const criteria = [
    {
      id: "INC-1",
      type: "INCLUSION",
      title:
        "Participant must be 18 to 65 years old",
      field: "age",
      operator: "BETWEEN",
      value: "18 – 65 years",
    },
    {
      id: "INC-2",
      type: "INCLUSION",
      title:
        "eGFR must be greater than 60",
      field: "labs.egfr",
      operator: ">",
      value: "60 mL/min/1.73m²",
    },
    {
      id: "INC-3",
      type: "INCLUSION",
      title:
        "HbA1c must be between 6.5% and 9.0%",
      field: "labs.hba1c",
      operator: "BETWEEN",
      value: "6.5 – 9.0%",
    },
    {
      id: "INC-4",
      type: "INCLUSION",
      title:
        "Documented Type 2 Diabetes",
      field: "medical_history",
      operator: "CONTAINS",
      value: "Type 2 Diabetes",
    },
    {
      id: "EXC-1",
      type: "EXCLUSION",
      title:
        "Recent chemotherapy within 6 months",
      field: "recent_chemotherapy",
      operator: "EQUALS",
      value: "TRUE",
    },
    {
      id: "EXC-2",
      type: "EXCLUSION",
      title:
        "Pregnancy",
      field: "pregnant",
      operator: "EQUALS",
      value: "TRUE",
    },
    {
      id: "EXC-3",
      type: "EXCLUSION",
      title:
        "Severe hepatic impairment",
      field:
        "severe_hepatic_impairment",
      operator: "EQUALS",
      value: "TRUE",
    },
  ];

  return (
    <div>

      <PageHero
        eyebrow="PROTOCOL MANAGEMENT"
        title="Clinical trial protocol"
        description="Structured protocol criteria extracted from the active trial document."
      />

      <section className="protocol-header-card">

        <div className="protocol-main-icon">
          <FileText />
        </div>

        <div>

          <span>
            SYN-DM-001
          </span>

          <h2>
            A Synthetic Phase II Study of an
            Investigational Therapy in Adults
            With Type 2 Diabetes
          </h2>

          <div className="protocol-tags">

            <span>
              Phase II
            </span>

            <span>
              Diabetes
            </span>

            <span>
              Synthetic protocol
            </span>

          </div>

        </div>

        <div className="protocol-count">

          <strong>
            7
          </strong>

          <span>
            criteria
          </span>

        </div>

      </section>

      <div className="protocol-summary">

        <div>
          <strong>4</strong>
          <span>Inclusion</span>
        </div>

        <div>
          <strong>3</strong>
          <span>Exclusion</span>
        </div>

        <div>
          <strong>1</strong>
          <span>Source document</span>
        </div>

        <div>
          <strong>100%</strong>
          <span>Structured</span>
        </div>

      </div>

      <section className="panel">

        <PanelHeader
          eyebrow="STRUCTURED CRITERIA"
          title="Eligibility requirements"
          description="Normalized protocol rules used by the deterministic screening engine."
        />

        <div className="protocol-list">

          {criteria.map(
            (criterion) => (

              <div
                className="protocol-row"
                key={criterion.id}
              >

                <div className="protocol-id">
                  {criterion.id}
                </div>

                <div className="protocol-description">

                  <div>

                    <span
                      className={
                        criterion.type ===
                        "EXCLUSION"
                          ? "type-exclusion"
                          : "type-inclusion"
                      }
                    >
                      {criterion.type}
                    </span>

                  </div>

                  <strong>
                    {criterion.title}
                  </strong>

                </div>

                <div className="protocol-field">

                  <span>
                    FIELD
                  </span>

                  <strong>
                    {criterion.field}
                  </strong>

                </div>

                <div className="protocol-operator">

                  <span>
                    OPERATOR
                  </span>

                  <strong>
                    {criterion.operator}
                  </strong>

                </div>

                <div className="protocol-value">

                  <span>
                    EXPECTED
                  </span>

                  <strong>
                    {criterion.value}
                  </strong>

                </div>

              </div>

            )
          )}

        </div>

      </section>

    </div>
  );
}


// ============================================================
// GOVERNANCE
// ============================================================

function Governance() {
  return (
    <div>

      <PageHero
        eyebrow="RESPONSIBLE AI"
        title="Governance center"
        description="Visibility into privacy, deterministic decision controls, human oversight and auditability."
      />

      <div className="governance-grid">

        <GovernanceCard
          icon={<ShieldCheck />}
          title="Privacy layer"
          status="ACTIVE"
          description="Patient records are processed through the privacy layer before eligibility evaluation."
        />

        <GovernanceCard
          icon={<Zap />}
          title="Decision engine"
          status="DETERMINISTIC"
          description="Final eligibility outcomes are produced by explicit protocol rules rather than free-form model judgment."
        />

        <GovernanceCard
          icon={<Users />}
          title="Human oversight"
          status="ENABLED"
          description="Missing or ambiguous evidence routes the case to human review."
        />

        <GovernanceCard
          icon={<FileCheck2 />}
          title="Auditability"
          status="ENABLED"
          description="Criterion-level evidence, source citations and decision metadata are captured."
        />

      </div>

      <section className="panel">

        <PanelHeader
          eyebrow="GOVERNANCE ARCHITECTURE"
          title="Controlled screening pipeline"
          description="The system separates language-model assistance from final clinical eligibility logic."
        />

        <div className="architecture">

          <ArchitectureStep
            number="01"
            title="Protocol PDF"
            description="Clinical trial document"
          />

          <ArrowRight />

          <ArchitectureStep
            number="02"
            title="Lyzr Agent"
            description="Criteria extraction"
          />

          <ArrowRight />

          <ArchitectureStep
            number="03"
            title="Privacy layer"
            description="PII scrubbing"
          />

          <ArrowRight />

          <ArchitectureStep
            number="04"
            title="Rule engine"
            description="Deterministic evaluation"
          />

          <ArrowRight />

          <ArchitectureStep
            number="05"
            title="Audit dossier"
            description="Evidence + citations"
          />

        </div>

      </section>

      <section className="governance-note">

        <ShieldCheck />

        <div>

          <strong>
            Governance principle
          </strong>

          <p>
            Missing clinical evidence is never
            silently inferred. When required
            evidence is unavailable or ambiguous,
            the system returns a human-review
            outcome.
          </p>

        </div>

      </section>

    </div>
  );
}


// ============================================================
// SETTINGS
// ============================================================

function SettingsPage() {
  const currentUser = getCurrentUser() || {
    name: "Researcher",
    role: "Researcher",
    organization: "Clinical Research",
  };

  const [privacy, setPrivacy] =
    useState(true);

  const [humanReview, setHumanReview] =
    useState(true);

  const [audit, setAudit] =
    useState(true);

  return (
    <div>

      <PageHero
        eyebrow="WORKSPACE CONFIGURATION"
        title="Settings"
        description="Configure the demonstration workspace and governance controls."
      />

      <section className="panel settings-panel">

        <PanelHeader
          eyebrow="GOVERNANCE CONTROLS"
          title="Screening safeguards"
        />

        <ToggleRow
          icon={<ShieldCheck />}
          title="Privacy scrubbing"
          description="Detect and redact identifying information before screening."
          value={privacy}
          setValue={setPrivacy}
        />

        <ToggleRow
          icon={<Users />}
          title="Human review routing"
          description="Route incomplete or ambiguous cases for human overview."
          value={humanReview}
          setValue={setHumanReview}
        />

        <ToggleRow
          icon={<FileCheck2 />}
          title="Audit dossier generation"
          description="Maintain structured audit records for screening decisions."
          value={audit}
          setValue={setAudit}
        />

      </section>

      <section className="panel">

        <PanelHeader
          eyebrow="ACCOUNT"
          title="Profile"
        />

        <div className="profile-settings">

          <div className="large-avatar">
            {getInitials(currentUser.name)}
          </div>

          <div>
            <strong>
              {currentUser.name}
            </strong>

            <span>
              {currentUser.role || "Researcher"}
            </span>

            <small>
              {currentUser.organization || "Clinical Research"}
            </small>
          </div>

        </div>

      </section>

    </div>
  );
}


// ============================================================
// HELP
// ============================================================

function HelpPage() {
  return (
    <div>

      <PageHero
        eyebrow="GETTING STARTED"
        title="Help & guide"
        description="Follow this workflow to demonstrate the governed clinical screening system."
      />

      <section className="panel">

        <PanelHeader
          eyebrow="QUICK START"
          title="How to use Clinexa"
        />

        <div className="help-steps">

          <HelpStep
            number="01"
            title="Open Patient Screening"
            text="Choose one of the four synthetic study participants."
          />

          <HelpStep
            number="02"
            title="Review the screening result"
            text="Inspect the eligibility decision, evidence completeness and privacy status."
          />

          <HelpStep
            number="03"
            title="Review every criterion"
            text="Check expected values, observed evidence and protocol citations."
          />

          <HelpStep
            number="04"
            title="Handle human review"
            text="SYN-003 intentionally contains missing eGFR evidence and should route to human review."
          />

          <HelpStep
            number="05"
            title="Generate an audit dossier"
            text="Create the JSON and PDF screening record from the Audit Dossiers page."
          />

        </div>

      </section>

      <section className="faq-grid">

        <Faq
          question="What data is being used?"
          answer="The demonstration uses synthetic/de-identified clinical trial data."
        />

        <Faq
          question="What does Human Review mean?"
          answer="Required evidence is missing or ambiguous, so the system does not invent a value."
        />

        <Faq
          question="Does the Lyzr agent make the final decision?"
          answer="The architecture uses Lyzr for protocol criteria structuring while deterministic rules evaluate patient eligibility."
        />

        <Faq
          question="What is the audit dossier?"
          answer="A structured record containing the screening decision, evidence, citations and governance metadata."
        />

      </section>

    </div>
  );
}


// ============================================================
// COMMON COMPONENTS
// ============================================================

function PageHero({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="page-hero">

      <div>

        <div className="page-eyebrow">
          {eyebrow}
        </div>

        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>

      </div>

    </div>
  );
}


function PanelHeader({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="panel-header">

      <div>

        <div className="page-eyebrow">
          {eyebrow}
        </div>

        <h3>
          {title}
        </h3>

        {description && (
          <p>
            {description}
          </p>
        )}

      </div>

    </div>
  );
}


function ActionItem({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      className="action-item"
      onClick={onClick}
    >

      <div className="action-icon">
        {icon}
      </div>

      <div>

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>

      <ArrowRight />

    </button>
  );
}


function StatusItem({
  icon,
  title,
  value,
}) {
  return (
    <div className="status-item">

      <div className="status-item-icon">
        {icon}
      </div>

      <div>

        <strong>
          {title}
        </strong>

        <span>
          {value}
        </span>

      </div>

      <Check className="status-check" />

    </div>
  );
}


function WorkflowStep({
  number,
  icon,
  title,
  text,
}) {
  return (
    <div className="workflow-step">

      <span>
        {number}
      </span>

      <div className="workflow-icon">
        {icon}
      </div>

      <strong>
        {title}
      </strong>

      <p>
        {text}
      </p>

    </div>
  );
}


function WorkflowLine() {
  return (
    <div className="workflow-line">
      <ArrowRight size={15} />
    </div>
  );
}


function GovernanceRow({
  label,
  value,
}) {
  return (
    <div className="governance-row-new">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


function EvidenceCount({
  value,
  label,
  type,
}) {
  return (
    <div
      className={`evidence-count-new ${type}`}
    >

      <strong>
        {value}
      </strong>

      <span>
        {label}
      </span>

    </div>
  );
}


function GovernanceCard({
  icon,
  title,
  status,
  description,
}) {
  return (
    <div className="governance-card-new">

      <div className="governance-card-icon">
        {icon}
      </div>

      <div className="governance-card-title">

        <h3>
          {title}
        </h3>

        <span>
          {status}
        </span>

      </div>

      <p>
        {description}
      </p>

      <div className="governance-active">
        <Check size={13} />
        Control active
      </div>

    </div>
  );
}


function ArchitectureStep({
  number,
  title,
  description,
}) {
  return (
    <div className="architecture-step">

      <span>
        {number}
      </span>

      <strong>
        {title}
      </strong>

      <small>
        {description}
      </small>

    </div>
  );
}


function ToggleRow({
  icon,
  title,
  description,
  value,
  setValue,
}) {
  return (
    <div className="toggle-row">

      <div className="toggle-icon">
        {icon}
      </div>

      <div className="toggle-text">

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>

      <button
        className={`toggle ${
          value ? "toggle-on" : ""
        }`}
        onClick={() =>
          setValue(!value)
        }
      >

        <span />

      </button>

    </div>
  );
}


function HelpStep({
  number,
  title,
  text,
}) {
  return (
    <div className="help-step">

      <div className="help-number">
        {number}
      </div>

      <div>

        <strong>
          {title}
        </strong>

        <p>
          {text}
        </p>

      </div>

    </div>
  );
}


function Faq({
  question,
  answer,
}) {
  return (
    <div className="faq-card">

      <HelpCircle />

      <div>

        <strong>
          {question}
        </strong>

        <p>
          {answer}
        </p>

      </div>

    </div>
  );
}


// ============================================================
// UTILITIES
// ============================================================

function normalizePatients(data) {

  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(
      data?.patients
    )
  ) {
    return data.patients;
  }

  if (
    Array.isArray(
      data?.data
    )
  ) {
    return data.data;
  }

  if (
    Array.isArray(
      data?.items
    )
  ) {
    return data.items;
  }

  return [];
}


function getPatientId(patient) {

  if (!patient) {
    return "";
  }

  if (
    typeof patient === "string"
  ) {
    return patient;
  }

  return (
    patient.patient_id ||
    patient.id ||
    patient.case_id ||
    patient.identifier ||
    "Synthetic Patient"
  );
}


function getPatientNumber(patient) {

  const id =
    getPatientId(patient);

  const match =
    String(id).match(
      /(\d+)$/
    );

  return match
    ? match[1]
    : null;
}


function calculateStats(
  criteria
) {

  let passed = 0;
  let failed = 0;
  let unknown = 0;

  criteria.forEach(
    (criterion) => {

      const status =
        String(
          criterion.result ||
          criterion.status ||
          criterion.outcome ||
          "UNKNOWN"
        ).toUpperCase();

      if (
        status.includes("PASS")
      ) {
        passed++;
      } else if (
        status.includes("FAIL")
      ) {
        failed++;
      } else {
        unknown++;
      }

    }
  );

  return {
    passed,
    failed,
    unknown,
    total: criteria.length,
  };
}


function formatValue(value) {

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "Not available";
  }

  if (
    Array.isArray(value)
  ) {
    return value.join(
      " – "
    );
  }

  if (
    typeof value ===
    "boolean"
  ) {
    return value
      ? "Yes"
      : "No";
  }

  if (
    typeof value ===
    "object"
  ) {
    return JSON.stringify(
      value
    );
  }

  return String(value);
}


function getPageTitle(
  path
) {

  if (
    path.includes(
      "/screening"
    )
  ) {
    return "Patient Screening";
  }

  if (
    path.includes(
      "/audits"
    )
  ) {
    return "Audit Dossiers";
  }

  if (
    path.includes(
      "/protocols"
    )
  ) {
    return "Protocols";
  }

  if (
    path.includes(
      "/governance"
    )
  ) {
    return "Governance Center";
  }

  if (
    path.includes(
      "/settings"
    )
  ) {
    return "Settings";
  }

  if (
    path.includes(
      "/help"
    )
  ) {
    return "Help & Guide";
  }

  return "Dashboard";
}


async function generateAudit(
  patient
) {

  const number =
    getPatientNumber(
      patient
    );

  if (!number) {
    return;
  }

  try {

    await axios.get(
      `${API_BASE}/audit/${number}`
    );

    alert(
      "Audit dossier generated successfully."
    );

  } catch (error) {

    console.error(error);

    alert(
      "Unable to generate audit dossier."
    );

  }
}
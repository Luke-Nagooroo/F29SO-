import React from "react";
import { Link, Navigate, Route, Routes } from "react-router";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

const ShellLayout = ({ title, description, children }) => (
  <div className="app-shell">
    <header className="shell-header">
      <div>
        <p className="eyebrow">Virtual Health Companion</p>
        <h1>{title}</h1>
        <p className="shell-copy">{description}</p>
      </div>
      <nav className="shell-nav">
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/forgot-password">Forgot password</Link>
      </nav>
    </header>

    <main>{children}</main>
  </div>
);

const HomePage = () => (
  <ShellLayout
    title="Authentication flow is expanding"
    description="This step adds the first pass of password recovery screens so the auth area feels more complete before backend token handling is wired up."
  >
    <section className="hero-card">
      <h2>Password recovery pages are now in place</h2>
      <p>
        Users can move from sign in to a recovery request screen and into a reset form.
        The forms currently focus on layout, local state, and route flow. API integration can be added later.
      </p>
      <div className="button-row">
        <Link className="primary-button" to="/forgot-password">
          Forgot password
        </Link>
        <Link className="secondary-button" to="/reset-password/demo-token">
          Open reset form
        </Link>
      </div>
    </section>
  </ShellLayout>
);

const NotFoundPage = () => (
  <ShellLayout
    title="Page not found"
    description="The requested route does not exist in this early project stage."
  >
    <section className="placeholder-card">
      <h2>404</h2>
      <p>Return to the home route and continue building from there.</p>
      <Link className="primary-button" to="/">
        Back home
      </Link>
    </section>
  </ShellLayout>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;

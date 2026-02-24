import React, { useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import PatientDashboard from "./pages/PatientDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Appointments from "./pages/Appointments";
import NotFound from "./pages/NotFound";
import ChatbotButton from "./components/chatbot/ChatbotButton";
import ChatbotWidget from "./components/chatbot/ChatbotWidget";

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
        <Link to="/patient">Patient</Link>
        <Link to="/provider">Provider</Link>
        <Link to="/appointments">Appointments</Link>
        <Link to="/admin">Admin</Link>
      </nav>
    </header>

    <main>{children}</main>
  </div>
);

const dashboardCards = [
  {
    title: "Patient dashboard",
    description:
      "Early patient-facing landing area for health summaries, alerts, appointments, and future tracking widgets.",
    to: "/patient",
  },
  {
    title: "Provider dashboard",
    description:
      "First provider workspace with quick counts, patient overview placeholders, and appointment monitoring.",
    to: "/provider",
  },
  {
    title: "Appointments",
    description:
      "Scheduling now has its own page with booking, calendar browsing, and upcoming visit cards.",
    to: "/appointments",
  },
  {
    title: "Admin dashboard",
    description:
      "Initial admin surface for platform stats, audit placeholders, and system management sections.",
    to: "/admin",
  },
];

const HomePage = () => (
  <ShellLayout
    title="Role-based dashboard pages are now taking shape"
    description="This step adds the first pass of patient, provider, and admin dashboard routes so the app starts to feel like a multi-role platform instead of only an auth prototype."
  >
    <section className="hero-card">
      <h2>Dashboard foundations are in place</h2>
      <p>
        The routes below are still intentionally lightweight. They focus on layout,
        navigation, and role-based page separation. Rich data widgets, protected routes,
        and live API-backed content can be layered in later commits.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
          >
            <h3 className="mb-2 text-lg font-semibold text-slate-900">{card.title}</h3>
            <p className="text-sm leading-6 text-slate-600">{card.description}</p>
          </Link>
        ))}
      </div>

      <div className="button-row">
        <Link className="primary-button" to="/patient">
          Open patient dashboard
        </Link>
        <Link className="secondary-button" to="/appointments">
          Review appointments
        </Link>
      </div>
    </section>
  </ShellLayout>
);

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/provider" element={<ProviderDashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ChatbotButton onClick={() => setIsChatOpen((current) => !current)} />
      <ChatbotWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}

export default App;

import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router";

function ResetPassword() {
  const { token } = useParams();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [status, setStatus] = useState("");
  const tokenPreview = useMemo(() => token?.slice(0, 10) ?? "missing-token", [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.password.length < 8) {
      setStatus("Choose a password with at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setStatus("Passwords do not match yet.");
      return;
    }

    setStatus(`Password reset handling for token ${tokenPreview}… will be connected to the backend later.`);
  };

  return (
    <div className="app-shell">
      <section className="auth-card">
        <div className="auth-copy-block">
          <p className="eyebrow">Reset password</p>
          <h1>Create a new password</h1>
          <p className="shell-copy">
            This early page sets up the route shape, form fields, and light validation.
            Full token verification and submission wiring can be added in a later commit.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field-group">
            <span>New password</span>
            <input
              name="password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </label>

          <label className="field-group">
            <span>Confirm password</span>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={handleChange}
              minLength={8}
              required
            />
          </label>

          <div className="auth-actions">
            <button className="primary-button" type="submit">
              Reset password
            </button>
            <Link className="text-link" to="/login">
              Back to login
            </Link>
          </div>

          {status ? <p className="status-note">{status}</p> : null}
        </form>
      </section>
    </div>
  );
}

export default ResetPassword;

import React, { useState } from "react";
import { Link } from "react-router";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus(`A reset link request would be sent for ${email || "this email address"} in a later commit.`);
  };

  return (
    <div className="app-shell">
      <section className="auth-card">
        <div className="auth-copy-block">
          <p className="eyebrow">Password recovery</p>
          <h1>Forgot your password?</h1>
          <p className="shell-copy">
            This early page captures the user&apos;s email and introduces the recovery route.
            The actual reset email request can be connected later.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field-group">
            <span>Email address</span>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <div className="auth-actions">
            <button className="primary-button" type="submit">
              Send reset link
            </button>
            <Link className="text-link" to="/login">
              Back to login
            </Link>
          </div>

          {status ? <p className="status-note">{status}</p> : null}
        </form>

        <p className="auth-footer">
          Remembered your password?{' '}
          <Link className="text-link" to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </div>
  );
}

export default ForgotPassword;

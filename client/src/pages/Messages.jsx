import React, { useMemo } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PatientMessagesTab from "../components/patient/MessagesTab";
import ProviderMessagesTab from "../components/provider/MessagesTab";

const MessagesPage = () => {
  const { user } = useAuth?.() || {};

  const role = useMemo(() => {
    if (user?.role === "provider" || user?.role === "doctor") return "provider";
    if (user?.role === "admin") return "provider";
    return "patient";
  }, [user?.role]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to={role === "provider" ? "/provider" : "/dashboard"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">
                <MessageSquare size={14} />
                Care Messaging
              </div>
              <h1 className="text-2xl font-semibold">Messages</h1>
              <p className="text-sm text-slate-400">
                Secure conversations between patients and providers.
              </p>
            </div>
          </div>
        </div>

        {role === "provider" ? <ProviderMessagesTab /> : <PatientMessagesTab />}
      </div>
    </div>
  );
};

export default MessagesPage;

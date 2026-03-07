import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PatientDashboard from "./pages/PatientDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Appointments from "./pages/Appointments";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import ChatbotButton from "./components/chatbot/ChatbotButton";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<PatientDashboard />} />
        <Route path="/provider" element={<ProviderDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ChatbotButton />
    </>
  );
};

export default App;

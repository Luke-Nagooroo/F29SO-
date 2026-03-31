import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Activity,
  CalendarCheck,
  MessageSquare,
  Watch,
  Bell,
  Trophy,
  Pill,
  Palette,
  LogOut,
  User,
  Sun,
  Moon,
  Check,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { Dock, DockItem, DockIcon, DockLabel } from "@/components/ui/dock";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "@/lib/utils";

const PATIENT_NAV = [
  { id: "overview", label: "Home", icon: Home },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "appointments", label: "Appointments", icon: CalendarCheck },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "medications", label: "Meds", icon: Pill },
  { id: "wearables", label: "Wearables", icon: Watch },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "progress", label: "Progress", icon: Trophy },
  { id: "resources", label: "Learn", icon: BookOpen },
  { id: "help", label: "Help", icon: HelpCircle },
];

const PROVIDER_NAV = [
  { id: "overview", label: "Home", icon: Home },
  { id: "patients", label: "Patients", icon: Activity },
  { id: "appointments", label: "Appointments", icon: CalendarCheck },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "help", label: "Help", icon: HelpCircle },
];

const THEME_META = {
  crimson: { label: "Crimson", color: "#be123c", darkColor: "#e11d48" },
  medical: { label: "Medical", color: "#2563eb", darkColor: "#3b82f6" },
  midnight: { label: "Midnight", color: "#7c3aed", darkColor: "#8b5cf6" },
  emerald: { label: "Emerald", color: "#059669", darkColor: "#34d399" },
};

export default function DashboardDock({
  activeTab,
  onTabChange,
  role = "patient",
  className,
}) {
  const navItems = role === "provider" ? PROVIDER_NAV : PATIENT_NAV;
  const { user, logout } = useAuth();
  const { theme, mode, themes, setTheme, setMode } = useTheme();
  const navigate = useNavigate();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const pickerRef = useRef(null);
  const toggleRef = useRef(null);

  const initials =
    `${(user?.profile?.firstName || "U")[0]}${(user?.profile?.lastName || "")[0] || ""}`.toUpperCase();

  const handleNavClick = (id) => {
    if (id === "alerts") {
      navigate("/alerts");
    } else if (id === "progress") {
      navigate("/progress");
    } else if (id === "resources") {
      navigate("/resources");
    } else if (id === "help") {
      navigate("/help");
    } else {
      onTabChange(id);
    }
  };

  // Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(e.target)
      ) {
        setShowThemePicker(false);
      }
    };
    if (showThemePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showThemePicker]);

  return (
    <div
      className={`hidden md:block fixed bottom-4 left-1/2 -translate-x-1/2 z-50 ${className || ""}`}
    >
      {/* Theme Picker Popup */}
      <AnimatePresence>
        {showThemePicker && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-56 rounded-xl bg-background/90 backdrop-blur-xl border border-border/50 shadow-2xl p-3 z-[60]"
          >
            {/* Light/Dark toggle */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Mode
              </span>
              <button
                onClick={() => setMode(mode === "dark" ? "light" : "dark")}
                className={cn(
                  "relative flex items-center w-14 h-7 rounded-full transition-colors duration-300 p-0.5",
                  mode === "dark" ? "bg-primary/30" : "bg-muted",
                )}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground shadow-sm",
                    mode === "dark" ? "ml-auto" : "ml-0",
                  )}
                >
                  {mode === "dark" ? (
                    <Moon className="w-3.5 h-3.5" />
                  ) : (
                    <Sun className="w-3.5 h-3.5" />
                  )}
                </motion.div>
              </button>
            </div>

            <div className="h-px bg-border/50 mb-3" />

            {/* Theme swatches */}
            <div className="space-y-1">
              {themes.map((t) => {
                const meta = THEME_META[t] || {
                  label: t,
                  color: "#888",
                  darkColor: "#aaa",
                };
                const isActive = theme === t;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setTheme(t);
                      setShowThemePicker(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 w-full px-2.5 py-2 rounded-lg transition-all text-sm",
                      isActive
                        ? "bg-primary/15 text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <span
                      className="w-5 h-5 rounded-full border-2 border-background shadow-sm shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${meta.color}, ${meta.darkColor})`,
                      }}
                    />
                    <span className="font-medium flex-1 text-left">
                      {meta.label}
                    </span>
                    {isActive && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dock
        magnification={60}
        distance={100}
        panelHeight={56}
        className="bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl"
      >
        {/* Profile */}
        <DockItem
          className="cursor-pointer rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground"
          onClick={() => navigate("/profile")}
        >
          <DockIcon>
            <span className="text-xs font-bold">{initials}</span>
          </DockIcon>
          <DockLabel>Profile</DockLabel>
        </DockItem>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <DockItem
              key={item.id}
              className={`relative cursor-pointer rounded-full transition-colors ${
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => handleNavClick(item.id)}
            >
              <DockIcon>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </DockIcon>
              <DockLabel>{item.label}</DockLabel>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </DockItem>
          );
        })}

        {/* Theme toggle */}
        <DockItem
          className={cn(
            "cursor-pointer rounded-full transition-colors",
            showThemePicker
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={(e) => {
            toggleRef.current = e.currentTarget;
            setShowThemePicker((v) => !v);
          }}
        >
          <DockIcon>
            <Palette className="w-5 h-5" strokeWidth={2} />
          </DockIcon>
          <DockLabel>Theme</DockLabel>
        </DockItem>

        {/* Logout */}
        <DockItem
          className="cursor-pointer rounded-full text-muted-foreground hover:text-red-500"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <DockIcon>
            <LogOut className="w-5 h-5" strokeWidth={2} />
          </DockIcon>
          <DockLabel>Sign Out</DockLabel>
        </DockItem>
      </Dock>
    </div>
  );
}

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import {
  Activity,
  Calendar,
  Clock,
  Heart,
  Menu,
  MessageCircle,
  Shield,
  X,
} from "lucide-react";
import { Link } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SplineScene, preloadSplineScene } from "@/components/ui/splite";
import { cn } from "@/lib/utils";

const ScrollReveal = ({ children, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

const stats = [
  { label: "Patients Monitored", value: 10000, suffix: "+", countUp: true },
  { label: "Healthcare Providers", value: 500, suffix: "+", countUp: true },
  { label: "Uptime Reliability", value: "99.9%", countUp: false },
  { label: "Support Available", value: "24/7", countUp: false },
];

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "AI-powered appointment booking that works around your life",
  },
  {
    icon: MessageCircle,
    title: "Secure Messaging",
    description:
      "HIPAA-compliant communication between patients and providers",
  },
  {
    icon: Activity,
    title: "Health Monitoring",
    description: "Real-time vitals tracking with intelligent alerts",
  },
  {
    icon: Shield,
    title: "Data Security",
    description: "Enterprise-grade encryption for all your health records",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Access your health dashboard anytime, anywhere",
  },
  {
    icon: Heart,
    title: "Personalized Care",
    description:
      "Tailored health insights powered by advanced analytics",
  },
];

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "Cardiologist",
    initials: "SC",
    quote:
      "MEDXI has transformed how I monitor my patients' cardiac health. The real-time alerts have genuinely saved lives.",
  },
  {
    name: "James Wilson",
    role: "Patient",
    initials: "JW",
    quote:
      "Managing my diabetes has never been easier. I can track everything and communicate with my doctor instantly.",
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "General Practitioner",
    initials: "ER",
    quote:
      "The scheduling system alone has saved our clinic hours every week. The whole platform just works.",
  },
];

const footerColumns = [
  {
    title: "Product",
    links: ["Features", "Scheduling", "Monitoring", "Messaging"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "HIPAA Compliance"],
  },
];

const auroraBlobs = [
  {
    className: "absolute -left-24 top-16 h-[28rem] w-[28rem] lg:-left-10 lg:top-10",
    color: "var(--bg-effect-1)",
    animation: "aurora-1 15s ease-in-out infinite",
  },
  {
    className: "absolute right-[-4rem] top-[-2rem] h-[26rem] w-[26rem] lg:right-8 lg:top-10",
    color: "var(--bg-effect-2)",
    animation: "aurora-2 18s ease-in-out infinite",
  },
  {
    className: "absolute bottom-[-6rem] left-1/3 h-[32rem] w-[32rem] lg:bottom-[-8rem] lg:left-1/2",
    color: "var(--bg-effect-3)",
    animation: "aurora-3 22s ease-in-out infinite",
  },
];

function CountUpStat({ value, suffix = "" }) {
  const statRef = useRef(null);
  const isInView = useInView(statRef, { once: true, amount: 0.6 });
  const motionValue = useMotionValue(0);
  const roundedValue = useTransform(motionValue, (latest) =>
    Math.round(latest),
  );
  const [displayValue, setDisplayValue] = useState(0);

  useMotionValueEvent(roundedValue, "change", (latest) => {
    setDisplayValue(latest);
  });

  useEffect(() => {
    if (!isInView) return undefined;

    const controls = animate(motionValue, value, {
      duration: 1.4,
      ease: "easeOut",
    });

    return () => controls.stop();
  }, [isInView, motionValue, value]);

  return (
    <div ref={statRef} className="text-4xl font-black text-primary">
      {displayValue.toLocaleString()}
      {suffix}
    </div>
  );
}

export default function LandingPage() {
  const heroContainer = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isSceneReady, setIsSceneReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updatePreference);
      return () => mediaQuery.removeEventListener("change", updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    preloadSplineScene().catch(() => {});

    // Timeout: if Spline hasn't loaded in 15s, show it anyway (scene may have loaded without triggering onLoad)
    const timer = setTimeout(() => {
      setIsSceneReady((prev) => {
        if (!prev) return true;
        return prev;
      });
    }, 15000);

    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  const handleMouseMove = useCallback(
    (event) => {
      if (prefersReducedMotion || !heroContainer.current) return;

      const rect = heroContainer.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      setMousePos({ x, y });
    },
    [prefersReducedMotion],
  );

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  const splineTranslateX = mousePos.x * 30;
  const splineTranslateY = mousePos.y * 20;
  const splineRotateY = mousePos.x * 8;
  const splineRotateX = -mousePos.y * 5;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "About", href: "#cta" },
  ];

  const handleNavClick = useCallback((e, href) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Floating pill navbar */}
      <header
        className={cn(
          "fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center px-8 py-3.5 backdrop-blur-xl border border-border/40 bg-card/60 w-[calc(100%-2rem)] md:w-auto transition-[border-radius] duration-300",
          mobileMenuOpen ? "rounded-2xl" : "rounded-full",
        )}
      >
        <div className="flex items-center justify-between w-full gap-x-10">
          <Link to="/" className="text-2xl font-black tracking-tighter">
            <span className="text-primary">MED</span>
            <span className="text-foreground">XI</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-muted-foreground hover:text-primary-foreground hover:bg-primary px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-medium border border-border/60 bg-transparent text-muted-foreground rounded-full hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-200"
            >
              Sign In
            </Link>
            <div className="relative group">
              <div className="absolute inset-0 -m-1.5 rounded-full bg-primary opacity-25 blur-lg pointer-events-none transition-all duration-300 group-hover:opacity-50 group-hover:blur-xl group-hover:-m-2.5" />
              <Link
                to="/register"
                className="relative z-10 px-5 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-full hover:bg-primary-foreground hover:text-primary transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <motion.button
            className="md:hidden flex items-center justify-center w-9 h-9 text-muted-foreground"
            onClick={() => setMobileMenuOpen((v) => !v)}
            whileTap={{ scale: 0.9 }}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden flex flex-col items-center w-full pt-4 pb-2 gap-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary-foreground hover:bg-primary px-4 py-2 rounded-full transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 w-full pt-2">
                <Link
                  to="/login"
                  className="w-full text-center px-5 py-2.5 text-sm font-medium border border-border/60 text-muted-foreground rounded-full hover:bg-foreground hover:text-background transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center px-5 py-2.5 text-sm font-semibold text-primary-foreground bg-primary rounded-full hover:bg-primary-foreground hover:text-primary transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section
          ref={heroContainer}
          className="relative min-h-screen overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
            {auroraBlobs.map((blob) => (
              <div
                key={blob.animation}
                className={blob.className}
              >
                <div
                  className="h-full w-full rounded-full"
                  style={{
                    backgroundColor: blob.color,
                    filter: "blur(80px)",
                    animation: blob.animation,
                    opacity: 0.6,
                  }}
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-background/10 to-background/60" />
          </div>

          {/* Spline robot — full-width background layer, scaled up to fill viewport */}
          {!prefersReducedMotion && (
            <div
              className="absolute inset-0 hidden lg:block"
              style={{
                transform: `scale(1.8) translate(8%, 10%) translate3d(${splineTranslateX}px, ${splineTranslateY}px, 0) rotateY(${splineRotateY}deg) rotateX(${splineRotateX}deg)`,
                transformOrigin: "center 35%",
                transition: "transform 0.15s ease-out",
                perspective: "1000px",
              }}
            >
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: isSceneReady ? 1 : 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="h-full w-full"
                  onLoad={() => setIsSceneReady(true)}
                />
              </motion.div>
            </div>
          )}

          {/* CTA card — floats on top-left over the robot */}
          <div className="relative z-10 flex min-h-screen items-center px-6 lg:px-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="w-full max-w-xl lg:ml-6 xl:ml-16"
            >
              <div className="rounded-[2rem] border border-border/60 bg-background/60 p-8 shadow-xl shadow-primary/5 backdrop-blur-xl sm:p-10">
                <div className="inline-flex rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium tracking-wide text-primary">
                  Virtual Care Platform
                </div>
                <h1 className="mt-6 text-5xl font-black leading-[1.1] tracking-tight text-foreground lg:text-7xl">
                  Your Health, <span className="text-primary">Reimagined</span>
                </h1>
                <p className="mt-6 max-w-lg text-lg text-muted-foreground">
                  Smart monitoring, seamless appointments, and AI-powered
                  insights - all in one platform built for modern healthcare.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/register"
                    className={buttonVariants({ size: "lg" })}
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className={buttonVariants({ variant: "outline", size: "lg" })}
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <motion.section
          className="border-y border-border/50 bg-muted/30 py-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                {stat.countUp ? (
                  <CountUpStat value={stat.value} suffix={stat.suffix} />
                ) : (
                  <motion.div
                    className="text-4xl font-black text-primary"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                  >
                    {stat.value}
                  </motion.div>
                )}
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <ScrollReveal>
          <section id="features" className="px-6 py-24">
            <div className="mx-auto max-w-6xl">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-center text-4xl font-bold text-foreground">
                  Everything You Need
                </h2>
                <p className="mt-3 text-center text-muted-foreground">
                  Comprehensive tools for modern healthcare management
                </p>
              </div>

              <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => {
                  const Icon = feature.icon;

                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ duration: 0.55, delay: index * 0.1 }}
                    >
                      <Card className="h-full border border-border/60 bg-card/80 transition-all duration-300 hover:border-primary/20 hover:shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="mt-4 text-lg font-semibold text-foreground">
                            {feature.title}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section id="testimonials" className="bg-muted/20 px-6 py-24">
            <div className="mx-auto max-w-6xl">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-4xl font-bold text-foreground">
                  Trusted by Healthcare Professionals
                </h2>
              </div>

              <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                  <ScrollReveal key={testimonial.name} delay={index * 0.1}>
                    <Card className="h-full border border-border/60 bg-card/90">
                      <CardContent className="flex h-full flex-col gap-6 p-6">
                        <p className="text-muted-foreground italic">
                          "{testimonial.quote}"
                        </p>

                        <div className="mt-auto flex items-center gap-4">
                          <Avatar className="border border-border/60">
                            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                              {testimonial.initials}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {testimonial.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        <section id="cta" className="px-6 py-24 overflow-hidden">
          <motion.div
            className="mx-auto max-w-3xl"
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-12 text-center">
              <h2 className="text-3xl font-bold text-foreground">
                Ready to Transform Your Healthcare?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Join thousands of patients and providers already using MEDXI
              </p>

              <motion.div
                className="mt-8 flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              >
                <Link to="/register" className={buttonVariants({})}>
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Sign In
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <ScrollReveal>
          <footer className="border-t border-border bg-muted/10 px-6 py-12">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Link to="/" className="text-2xl font-black tracking-tighter">
                    <span className="text-primary">MED</span>
                    <span className="text-foreground">XI</span>
                  </Link>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Smarter care for modern healthcare teams
                  </p>
                </div>

                {footerColumns.map((column) => (
                  <div key={column.title}>
                    <h3 className="text-sm font-semibold text-foreground">
                      {column.title}
                    </h3>
                    <div className="mt-4 flex flex-col gap-3">
                      {column.links.map((link) => (
                        <a
                          key={link}
                          href="#"
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
                <p className="text-sm text-muted-foreground">
                  &copy; 2026 MEDXI. All rights reserved.
                </p>

                <div className="flex items-center gap-6">
                  {["Twitter", "LinkedIn", "GitHub"].map((social) => (
                    <a
                      key={social}
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {social}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </footer>
        </ScrollReveal>
      </main>
    </div>
  );
}

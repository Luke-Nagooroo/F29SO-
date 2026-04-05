import { Component, Suspense, lazy, useState } from "react";

const loadSpline = () => import("@splinetool/react-spline");
const Spline = lazy(loadSpline);

export function preloadSplineScene() {
  return loadSpline();
}

function SplineFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary/10 via-background/40 to-primary/5">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading assistant...</p>
      </div>
    </div>
  );
}

class SplineErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn("Spline scene failed to load:", error);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export function SplineScene({ scene, className, onLoad }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  return (
    <SplineErrorBoundary onError={() => setHasError(true)}>
      <Suspense fallback={<SplineFallback />}>
        <Spline scene={scene} className={className} onLoad={onLoad} />
      </Suspense>
    </SplineErrorBoundary>
  );
}

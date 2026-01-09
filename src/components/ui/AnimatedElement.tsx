import { ReactNode, useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedElementProps {
  children: ReactNode;
  animation?: "fade-up" | "fade-in" | "slide-in-right" | "scale-in";
  delay?: number;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

export const AnimatedElement = ({
  children,
  animation = "fade-up",
  delay = 0,
  className,
  threshold = 0.1,
  rootMargin = "0px",
}: AnimatedElementProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay sonrası animasyonu başlat
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, delay);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [delay, threshold, rootMargin, hasAnimated]);

  const animationClasses = {
    "fade-up": "animate-fade-up",
    "fade-in": "animate-fade-in",
    "slide-in-right": "animate-slide-in-right",
    "scale-in": "animate-scale-in",
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        !isVisible && "opacity-0",
        isVisible && animationClasses[animation],
        className
      )}
    >
      {children}
    </div>
  );
};

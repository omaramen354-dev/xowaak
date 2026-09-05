"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

export const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------------------------------- scroll progress --------------------------------- */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 170, damping: 34, mass: 0.22 });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

/* ----------------------------------- reveal block ----------------------------------- */

export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 38,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: "blur(10px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* --------------------- word-by-word reveal (Arabic-safe, whole words) --------------------- */

export function WordReveal({
  text,
  className = "",
  delay = 0,
  stagger = 0.085,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ").filter(Boolean);
  return (
    <motion.span
      className={`word-reveal ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {words.map((word, index) => (
        <span className="word-mask" key={`${word}-${index}`}>
          <motion.span
            className="word-slide"
            variants={{
              hidden: { y: "115%", rotate: 3, opacity: 0 },
              show: {
                y: "0%",
                rotate: 0,
                opacity: 1,
                transition: { duration: 0.85, ease: EASE },
              },
            }}
          >
            {word}
          </motion.span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </motion.span>
  );
}

/* --------------------------------------- tilt card --------------------------------------- */

export function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 220, damping: 28 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 220, damping: 28 });

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - bounds.left) / bounds.width - 0.5);
    y.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`tilt-wrap ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------- magnetic hover ------------------------------------- */

export function Magnetic({
  children,
  className = "",
  strength = 0.32,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 180, damping: 15, mass: 0.4 });
  const y = useSpring(0, { stiffness: 180, damping: 15, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      className={`magnetic ${className}`}
      style={{ x, y }}
      onMouseMove={(event) => {
        const bounds = ref.current?.getBoundingClientRect();
        if (!bounds) return;
        x.set((event.clientX - (bounds.left + bounds.width / 2)) * strength);
        y.set((event.clientY - (bounds.top + bounds.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------------- count up ---------------------------------------- */

export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const startedAt = performance.now();
    const duration = 1500;
    let frame = 0;
    const update = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref} dir="ltr" className="count-digits">
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/* ------------------------------ circular progress (SVG ring) ------------------------------ */

export function RingGauge({ value, tone }: { value: number; tone: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg ref={ref} className="ring-gauge" viewBox="0 0 84 84" aria-hidden="true">
      <circle cx="42" cy="42" r={radius} className="ring-track" />
      <motion.circle
        cx="42"
        cy="42"
        r={radius}
        className="ring-value"
        style={{ stroke: tone }}
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={inView ? { strokeDashoffset: circumference * (1 - value / 100) } : undefined}
        transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
        transform="rotate(-90 42 42)"
      />
    </svg>
  );
}

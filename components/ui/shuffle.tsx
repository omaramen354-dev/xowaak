"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

/**
 * Shuffle — react-bits (@react-bits/Shuffle-JS-CSS), ported to TypeScript.
 *
 * Characters slide in from off-cell before settling. Simplified from upstream:
 * only the horizontal directions are kept (the vertical branch needed ~60
 * lines of canvas font metrics that this design never uses).
 *
 * SplitText became free in GSAP 3.13, so this needs no Club licence.
 *
 * The headline is ALWAYS visible. Upstream keeps it `visibility: hidden`
 * until GSAP is ready, so a JS failure, a slow load or a crawler sees no
 * headline at all. The shuffle is decorative, so here it enhances text that
 * has already rendered.
 *
 * IMPORTANT for this codebase: SplitText rewrites the element's DOM into
 * per-character spans. That breaks Arabic, where letters must stay joined —
 * so the component renders plain text and skips all animation under RTL.
 */

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

export type ShuffleProps = {
  text: string;
  className?: string;
  shuffleDirection?: "left" | "right";
  duration?: number;
  maxDelay?: number;
  ease?: string | ((t: number) => number);
  threshold?: number;
  rootMargin?: string;
  tag?: "p" | "h1" | "h2" | "h3" | "span";
  shuffleTimes?: number;
  animationMode?: "evenodd" | "random";
  stagger?: number;
  scrambleCharset?: string;
  triggerOnce?: boolean;
  respectReducedMotion?: boolean;
  triggerOnHover?: boolean;
  onShuffleComplete?: () => void;
};

export function Shuffle({
  text,
  className,
  shuffleDirection = "right",
  duration = 0.35,
  maxDelay = 0,
  ease = "power3.out",
  threshold = 0.1,
  rootMargin = "-100px",
  tag: Tag = "p",
  shuffleTimes = 1,
  animationMode = "evenodd",
  stagger = 0.03,
  scrambleCharset = "",
  triggerOnce = true,
  respectReducedMotion = true,
  triggerOnHover = true,
  onShuffleComplete,
}: ShuffleProps) {
  const ref = useRef<HTMLElement>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const splitRef = useRef<GSAPSplitText | null>(null);
  const wrappersRef = useRef<HTMLElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const playingRef = useRef(false);
  const hoverHandlerRef = useRef<(() => void) | null>(null);

  // Splitting into per-character spans severs Arabic letter joining, so the
  // effect is disabled for RTL and the text renders normally.
  const [isRTL, setIsRTL] = useState(false);
  useEffect(() => {
    // Must run after mount: `document` does not exist during SSR, and reading
    // it lazily in useState would desync the server and client markup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsRTL(document.documentElement.dir === "rtl");
  }, []);

  useEffect(() => {
    // Same reason: the font-loading state is only knowable on the client.
    if ("fonts" in document) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (document.fonts.status === "loaded") setFontsLoaded(true);
      else document.fonts.ready.then(() => setFontsLoaded(true));
    } else setFontsLoaded(true);
  }, []);

  const scrollTriggerStart = useMemo(() => {
    const startPct = (1 - threshold) * 100;
    const mm = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin || "");
    const mv = mm ? parseFloat(mm[1]) : 0;
    const mu = mm ? mm[2] || "px" : "px";
    const sign = mv === 0 ? "" : mv < 0 ? `-=${Math.abs(mv)}${mu}` : `+=${mv}${mu}`;
    return `top ${startPct}%${sign}`;
  }, [threshold, rootMargin]);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;
      if (isRTL) {
        return;
      }
      if (respectReducedMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        onShuffleComplete?.();
        return;
      }

      const el = ref.current;

      const removeHover = () => {
        if (hoverHandlerRef.current && ref.current) {
          ref.current.removeEventListener("mouseenter", hoverHandlerRef.current);
          hoverHandlerRef.current = null;
        }
      };

      const teardown = () => {
        if (tlRef.current) {
          tlRef.current.kill();
          tlRef.current = null;
        }
        if (wrappersRef.current.length) {
          wrappersRef.current.forEach((wrap) => {
            const inner = wrap.firstElementChild;
            const orig = inner?.querySelector('[data-orig="1"]');
            if (orig && wrap.parentNode) wrap.parentNode.replaceChild(orig, wrap);
          });
          wrappersRef.current = [];
        }
        try {
          splitRef.current?.revert();
        } catch {
          /* noop */
        }
        splitRef.current = null;
        playingRef.current = false;
      };

      const build = () => {
        teardown();

        splitRef.current = new GSAPSplitText(el, {
          type: "chars",
          charsClass: "shuffle-char",
          wordsClass: "shuffle-word",
          linesClass: "shuffle-line",
          smartWrap: true,
          reduceWhiteSpace: false,
        });

        const chars = splitRef.current.chars || [];
        wrappersRef.current = [];

        const rolls = Math.max(1, Math.floor(shuffleTimes));
        const rand = (set: string) => set.charAt(Math.floor(Math.random() * set.length)) || "";

        chars.forEach((ch) => {
          const parent = ch.parentElement;
          if (!parent) return;
          const w = ch.getBoundingClientRect().width;
          if (!w) return;

          const wrap = document.createElement("span");
          Object.assign(wrap.style, {
            display: "inline-block",
            overflow: "hidden",
            width: `${w}px`,
            height: "auto",
            verticalAlign: "bottom",
          });

          const inner = document.createElement("span");
          Object.assign(inner.style, {
            display: "inline-block",
            whiteSpace: "nowrap",
            willChange: "transform",
          });

          // Build the strip of cells this character slides through.
          const cells: HTMLElement[] = [];
          for (let k = 0; k < rolls; k++) {
            const c = document.createElement("span");
            c.className = "shuffle-char";
            c.style.display = "inline-block";
            c.style.width = `${w}px`;
            c.style.textAlign = "center";
            c.textContent = scrambleCharset ? rand(scrambleCharset) : ch.textContent || "";
            cells.push(c);
          }

          const orig = document.createElement("span");
          orig.className = "shuffle-char";
          orig.setAttribute("data-orig", "1");
          orig.style.display = "inline-block";
          orig.style.width = `${w}px`;
          orig.style.textAlign = "center";
          orig.textContent = ch.textContent || "";

          // "right" means the glyph arrives from the right, so the real
          // character sits at the END of the strip and the strip slides back.
          const seq = shuffleDirection === "right" ? [...cells, orig] : [orig, ...cells];
          seq.forEach((c) => inner.appendChild(c));

          const startX = shuffleDirection === "right" ? -(seq.length - 1) * w : 0;
          const endX = shuffleDirection === "right" ? 0 : -(seq.length - 1) * w;
          inner.style.transform = `translateX(${startX}px)`;
          inner.setAttribute("data-end-x", String(endX));

          parent.replaceChild(wrap, ch);
          wrap.appendChild(inner);
          wrappersRef.current.push(wrap);
        });

        const inners = wrappersRef.current.map((w) => w.firstElementChild as HTMLElement);

        const tl = gsap.timeline({
          onComplete: () => {
            playingRef.current = false;
            onShuffleComplete?.();
          },
        });

        // evenodd offsets alternating characters so the line ripples rather
        // than moving as one block.
        const delayFor = (i: number) =>
          animationMode === "evenodd"
            ? (i % 2) * stagger + Math.floor(i / 2) * stagger * 0.5
            : Math.random() * (maxDelay || stagger * inners.length);

        inners.forEach((inner, i) => {
          const endX = Number(inner.getAttribute("data-end-x") || 0);
          tl.to(inner, { x: endX, duration, ease }, delayFor(i));
        });

        tlRef.current = tl;
        playingRef.current = true;
      };

      const play = () => {
        if (playingRef.current) return;
        build();
      };

      build();

      if (triggerOnHover) {
        const handler = () => {
          if (!playingRef.current) play();
        };
        hoverHandlerRef.current = handler;
        el.addEventListener("mouseenter", handler);
      }

      const st = ScrollTrigger.create({
        trigger: el,
        start: scrollTriggerStart,
        once: triggerOnce,
        onEnter: () => play(),
      });

      return () => {
        st.kill();
        removeHover();
        teardown();
      };
    },
    { dependencies: [text, fontsLoaded, isRTL, scrollTriggerStart], scope: ref },
  );

  return (
    <Tag
      ref={ref as React.Ref<HTMLHeadingElement>}
      className={cn("inline-block", className)}
      style={{ lineHeight: 1.08 }}
    >
      {text}
    </Tag>
  );
}

export default Shuffle;

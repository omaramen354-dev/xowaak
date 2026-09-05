"use client";

import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowUpLeft,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Globe2,
  Menu,
  MousePointer2,
  Play,
  Plus,
  Radio,
  Rocket,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { CustomCursor } from "./custom-cursor";
import {
  CountUp,
  EASE,
  Magnetic,
  Reveal,
  RingGauge,
  ScrollProgress,
  TiltCard,
  WordReveal,
} from "./motion-primitives";
import { Preloader } from "./preloader";
import { ProjectLauncher } from "./project-launcher";
import { SceneMount } from "./scene-mount";
import { SmoothScroll } from "./smooth-scroll";

/* ------------------------------------------------------------------ */
/* data                                                                */
/* ------------------------------------------------------------------ */

const navItems = [
  { href: "#manifesto", label: "الفلسفة" },
  { href: "#services", label: "القدرات" },
  { href: "#work", label: "الأعمال" },
  { href: "#process", label: "المنهج" },
];

const services = [
  {
    index: "01",
    title: "هويات تتحرك",
    category: "BRAND SYSTEMS",
    tone: "cyan",
    description:
      "نصمم هوية تنبض بالحياة — من الاستراتيجية والصوت، إلى شعار يتحرك، ونظام بصري يعمل باتساق عبر كل نقطة تماس رقمية وفعلية.",
    tags: ["Brand Strategy", "Motion Identity", "Art Direction", "Guidelines"],
    deliverables: ["استراتيجية العلامة", "النظام البصري الحركي", "دليل التطبيق الشامل"],
  },
  {
    index: "02",
    title: "تجارب غامرة",
    category: "DIGITAL EXPERIENCES",
    tone: "violet",
    description:
      "مواقع وتجارب ويب استعراضية بمحركات ثلاثية الأبعاد وحركة فيزيائية سلسة — سريعة بما يكفي لتبهر، وواضحة بما يكفي لتبيع.",
    tags: ["UX/UI", "WebGL & 3D", "Creative Dev", "Micro-interactions"],
    deliverables: ["بحث المستخدم ونمذجة الرحلات", "واجهات تفاعلية عالية الأداء", "مكتبة مكوّنات مخصصة"],
  },
  {
    index: "03",
    title: "منتجات ذكية",
    category: "PRODUCT ENGINEERING",
    tone: "magenta",
    description:
      "نبني منصات SaaS ومنتجات مدعومة بالذكاء الاصطناعي من الصفر: هندسة متينة، واجهات بسيطة، وأنظمة تنمو مع طموحك.",
    tags: ["SaaS Platforms", "AI Integration", "Full-stack", "Design Systems"],
    deliverables: ["هندسة المنتج والبنية", "واجهات ذكاء اصطناعي جاهزة", "خارطة إطلاق ونمو"],
  },
  {
    index: "04",
    title: "نمو بلا احتكاك",
    category: "GROWTH & PERFORMANCE",
    tone: "emerald",
    description:
      "نحوّل الجمال إلى أرقام: قياس دقيق، اختبارات مستمرة، وتحسين للتحويل والسرعة حتى يصبح التصميم استثمارًا لا تكلفة.",
    tags: ["CRO", "Analytics", "SEO", "Performance"],
    deliverables: ["تدقيق الأداء والتحويل", "لوحات قياس مخصصة", "برنامج تحسين مستمر"],
  },
];

const projects = [
  {
    id: "nebula",
    index: "01",
    title: "NEBULA FINANCE",
    arabicTitle: "الثروة، بواجهة جديدة تمامًا",
    category: "FINTECH / PRODUCT",
    year: "2026",
    role: "استراتيجية · تصميم · تطوير",
    metric: "+214%",
    metricLabel: "نمو التفاعل الأسبوعي",
    image: "/images/project-finance.jpg",
    accent: "#35efff",
    description:
      "منصة استثمار تجعل البيانات المعقدة قرارات هادئة وواضحة — تنبؤ ذكي، لوحات قيادة حية، وثقة تُبنى منذ الشاشة الأولى.",
    chips: ["Product Strategy", "UX/UI System", "Frontend Engineering"],
  },
  {
    id: "sora",
    index: "02",
    title: "SORA MOBILITY",
    arabicTitle: "الحركة كإحساس لم يسبق له مثيل",
    category: "MOBILITY / BRAND",
    year: "2025",
    role: "هوية · تجربة · منصة",
    metric: "4.8×",
    metricLabel: "مضاعفة معدل التحويل",
    image: "/images/project-mobility.jpg",
    accent: "#d84dff",
    description:
      "هوية ومنظومة حجز لمستقبل التنقل الحضري — شبكة حيّة تتنفس مع المدينة، من أول نظرة على الشاشة إلى آخر متر في الرحلة.",
    chips: ["Brand Identity", "Motion System", "Booking Platform"],
  },
  {
    id: "terra",
    index: "03",
    title: "TERRA GRID",
    arabicTitle: "طاقة تُرى بوضوح وتُدار بثقة",
    category: "CLIMATE / DATA",
    year: "2025",
    role: "تصور بيانات · غرفة قيادة",
    metric: "-38%",
    metricLabel: "تقليص زمن اتخاذ القرار",
    image: "/images/project-climate.jpg",
    accent: "#64ffba",
    description:
      "مركز قيادة حيّ لشبكات الطاقة المتجددة — يحوّل ملايين القراءات كل ثانية إلى إشارات مرئية قابلة للفهم والتصرف الفوري.",
    chips: ["Data Visualization", "Realtime Systems", "3D Interfaces"],
  },
];

const processSteps = [
  {
    number: "01",
    title: "نلتقط الإشارة",
    description: "ورشة استكشاف مركزة: الهدف، السوق، الجمهور، وما الذي يجعل القصة تستحق أن تُروى.",
    output: "خريطة اكتشاف",
  },
  {
    number: "02",
    title: "نصمّم النظام",
    description: "لغة بصرية ونموذج تفاعلي حي يختبر الفكرة قبل أن نكتب سطرًا واحدًا من الإنتاج.",
    output: "نموذج تفاعلي",
  },
  {
    number: "03",
    title: "نبني ونربط",
    description: "تطوير بدورات أسبوعية — نسخة تعمل أمامك كل جمعة، وجودة تقنية من أول commit.",
    output: "منتج قابل للإطلاق",
  },
  {
    number: "04",
    title: "نطلق ونطوّر",
    description: "إطلاق مراقَب، قياس مستمر، وتحسينات دورية تجعل المنتج أسرع وأذكى مع الوقت.",
    output: "نظام نمو",
  },
];

/* ------------------------------------------------------------------ */
/* atoms                                                               */
/* ------------------------------------------------------------------ */

function Logo() {
  return (
    <a className="logo" href="#top" aria-label="AWWA — العودة إلى البداية">
      <svg viewBox="0 0 42 42" aria-hidden="true">
        <path d="M5 30 14 10l7 20 7-20 9 20" />
        <path className="logo-spark" d="M10 25h22" />
      </svg>
      <span className="logo-word">AWWA<span className="logo-dot">.</span></span>
    </a>
  );
}

function LiveClock() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(
          new Date(),
        ),
      );
    update();
    const timer = window.setInterval(update, 20_000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <span className="live-clock" dir="ltr">
      <Clock size={13} /> {time}
    </span>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={scrolled ? "site-header scrolled" : "site-header"}>
      <div className="header-inner">
        <div className="header-side">
          <Logo />
        </div>
        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-side header-actions">
          <LiveClock />
          <span className="availability" dir="ltr">
            <i /> OPEN — 1 SLOT
          </span>
          <button className="language-button" type="button" aria-label="اللغة الحالية: العربية">
            <Globe2 size={15} /> <span dir="ltr">AR</span>
          </button>
          <Magnetic strength={0.25}>
            <a className="header-cta" href="#contact">
              دعنا نتحدث <ArrowUpLeft size={16} />
            </a>
          </Magnetic>
          <button
            className="menu-button"
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            className="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            aria-label="التنقل للهاتف"
          >
            {[...navItems, { href: "#contact", label: "ابدأ مشروعك" }].map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.06 }}
              >
                <span dir="ltr">0{index + 1}</span>
                {item.label}
                <ArrowUpLeft />
              </motion.a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* hero                                                                */
/* ------------------------------------------------------------------ */

function HeroLine({
  words,
  booted,
  offset,
  outline = false,
}: {
  words: string[];
  booted: boolean;
  offset: number;
  outline?: boolean;
}) {
  return (
    <span className={`title-line${outline ? " title-line-outline" : ""}`}>
      {words.map((word, index) => (
        <span className="word-mask" key={`${word}-${index}`}>
          <motion.span
            className="word-slide"
            initial={{ y: "118%", rotate: outline ? 0 : 2.5 }}
            animate={booted ? { y: "0%", rotate: 0 } : undefined}
            transition={{ duration: 1, delay: offset + index * 0.09, ease: EASE }}
          >
            {word}
          </motion.span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

function Hero({ booted }: { booted: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.78], [1, 0]);
  const stageY = useTransform(scrollYProgress, [0, 1], [0, 190]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 0.76]);

  return (
    <section className="hero" id="top" ref={sectionRef}>
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-beam beam-one" aria-hidden="true" />
      <div className="hero-beam beam-two" aria-hidden="true" />
      <div className="hero-aurora" aria-hidden="true" />
      <div className="hero-noise" aria-hidden="true" />

      <motion.div className="hero-copy" style={{ y: copyY, opacity: copyOpacity }}>
        <motion.div
          className="hero-kicker"
          initial={{ opacity: 0, y: 16 }}
          animate={booted ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <span className="live-signal" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          استوديو تجارب رقمية مستقل
          <span className="kicker-coords" dir="ltr">
            RIYADH — WORLDWIDE
          </span>
        </motion.div>

        <h1 className="hero-title">
          <HeroLine words={["لا", "ننتظر"]} booted={booted} offset={0.25} />
          <HeroLine words={["المستقبل."]} booted={booted} offset={0.45} outline />
          <HeroLine words={["نصنعه."]} booted={booted} offset={0.62} />
        </h1>

        <motion.p
          className="hero-description"
          initial={{ opacity: 0, y: 26 }}
          animate={booted ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.85, delay: 0.95, ease: EASE }}
        >
          نبني علامات ومنصات ومنتجات ذكية تجمع بين وضوح الفكرة، جرأة التصميم، ودقة التقنية — حتى
          يشعر جمهورك بالمستقبل من أول ثانية.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 22 }}
          animate={booted ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
        >
          <Magnetic>
            <a className="button button-primary" href="#contact">
              <span>ابدأ الرحلة</span>
              <Rocket size={18} />
            </a>
          </Magnetic>
          <Magnetic>
            <a className="button button-ghost" href="#work">
              <Play size={15} fill="currentColor" />
              <span>شاهد ما نبنيه</span>
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>

      <motion.div className="hero-stage" style={{ y: stageY, scale: stageScale }}>
        <SceneMount />
        <motion.div
          className="telemetry-card telemetry-a"
          initial={{ opacity: 0, x: -20, y: 15 }}
          animate={booted ? { opacity: 1, x: 0, y: 0 } : undefined}
          transition={{ delay: 1.35, duration: 0.8, ease: EASE }}
        >
          <span>CREATIVE VELOCITY</span>
          <strong dir="ltr">98.7%</strong>
          <div className="telemetry-bars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </motion.div>
        <motion.div
          className="telemetry-card telemetry-b"
          initial={{ opacity: 0, x: 20 }}
          animate={booted ? { opacity: 1, x: 0 } : undefined}
          transition={{ delay: 1.5, duration: 0.8, ease: EASE }}
        >
          <span className="radar" aria-hidden="true">
            <i />
          </span>
          <div>
            <strong>SYSTEM</strong>
            <small dir="ltr">ALL SIGNALS NOMINAL</small>
          </div>
        </motion.div>
        <div className="coordinate coordinate-a" dir="ltr">
          24°42&apos;N — 46°40&apos;E
        </div>
        <div className="coordinate coordinate-b" dir="ltr">
          CORE_01 / ONLINE
        </div>
      </motion.div>

      <motion.div
        className="hero-bottom"
        initial={{ opacity: 0 }}
        animate={booted ? { opacity: 1 } : undefined}
        transition={{ duration: 1, delay: 1.75 }}
      >
        <div className="hero-stats">
          <div className="hero-stat">
            <strong>
              <CountUp value={47} suffix="+" />
            </strong>
            <span>منتجًا أطلقناه</span>
          </div>
          <div className="hero-stat">
            <strong>
              <CountUp value={12} />
            </strong>
            <span>سوقًا عالميًا</span>
          </div>
          <div className="hero-stat">
            <strong>
              <CountUp value={96} suffix="%" />
            </strong>
            <span>شراكات مستمرة</span>
          </div>
        </div>
        <a className="scroll-cue" href="#manifesto">
          <MousePointer2 size={15} />
          <span>مرّر لاكتشاف العالم</span>
          <ChevronDown size={16} />
        </a>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* manifesto                                                           */
/* ------------------------------------------------------------------ */

function Manifesto() {
  return (
    <section className="manifesto section-shell" id="manifesto">
      <div className="manifesto-orbit" aria-hidden="true">
        <div className="orbit-ring">
          <span>IDEA</span>
          <span>DESIGN</span>
          <span>CODE</span>
          <span>IMPACT</span>
        </div>
        <div className="orbit-core">A</div>
      </div>
      <div className="manifesto-copy">
        <p className="section-index">00 — الفلسفة</p>
        <h2>
          <WordReveal text="المنتج العظيم" />
          <br />
          <WordReveal text="لا يُشرح." delay={0.35} />
          <br />
          <span className="gradient-line">
            <WordReveal text="يُشعَر به." delay={0.6} />
          </span>
        </h2>
        <Reveal delay={0.3}>
          <p className="manifesto-body">
            لهذا لا نزيّن الأفكار من الخارج. ندخل إلى قلبها، نفهم نبضها، ثم نبني حولها نظامًا
            رقميًا حيًا يختصر المسافة بين الإنسان والاحتمال.
          </p>
        </Reveal>
      </div>
      <div className="manifesto-side-note" dir="ltr">
        <span>AWWA / PRINCIPLE 001</span>
        <i />
        EMOTION × FUNCTION
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* signal belt                                                         */
/* ------------------------------------------------------------------ */

function SignalBelt() {
  const items = [
    { value: 92, label: "معدل أداء الصفحات", tone: "#36efff" },
    { value: 96, label: "استمرارية الشراكات", tone: "#8f6bff" },
    { value: 88, label: "رضا مستخدمي التجارب", tone: "#e04dff" },
    { value: 100, label: "التزام بتسليم دقيق", tone: "#64ffba" },
  ];
  return (
    <section className="signal-belt" aria-label="مؤشرات الأداء">
      <div className="signal-belt-inner">
        {items.map((item, index) => (
          <Reveal key={item.label} delay={index * 0.08}>
            <div className="signal-item">
              <div className="signal-ring">
                <RingGauge value={item.value} tone={item.tone} />
                <strong dir="ltr">
                  {item.value}
                  <span>%</span>
                </strong>
              </div>
              <p>{item.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="belt-marquee" aria-hidden="true">
        <div>
          {Array.from({ length: 2 }, (_, copy) => (
            <span key={copy}>
              STRATEGY <i /> IDENTITY <i /> EXPERIENCE <i /> TECHNOLOGY <i /> MOTION <i /> AI
              SYSTEMS <i /> IMPACT <i />{" "}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* services accordion                                                  */
/* ------------------------------------------------------------------ */

function Services() {
  const [open, setOpen] = useState<number | null>(1);

  return (
    <section className="services section-shell" id="services">
      <div className="section-heading">
        <div>
          <p className="section-index">01 — القدرات</p>
          <h2>
            <WordReveal text="كل ما تحتاجه الفكرة" />
            <br />
            <span className="gradient-line">
              <WordReveal text="لتصبح عالمًا." delay={0.3} />
            </span>
          </h2>
        </div>
        <Reveal delay={0.15} className="section-intro">
          فريق واحد متعدد التخصصات، من أول سؤال استراتيجي وحتى آخر تفصيلة في الإطلاق. انقر على كل
          قدرة لاستكشافها.
        </Reveal>
      </div>

      <div className="service-rows">
        {services.map((service, index) => {
          const isOpen = open === index;
          return (
            <Reveal key={service.title} delay={index * 0.06}>
              <div
                className={`service-row tone-${service.tone}${isOpen ? " open" : ""}`}
                data-open={isOpen}
              >
                <button
                  type="button"
                  className="service-row-head"
                  onClick={() => setOpen(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="service-index" dir="ltr">
                    {service.index}
                  </span>
                  <span className="service-title">{service.title}</span>
                  <span className="service-category" dir="ltr">
                    {service.category}
                  </span>
                  <span className="service-toggle" aria-hidden="true">
                    <Plus size={20} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="service-panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.55, ease: EASE }}
                    >
                      <div className="service-panel-grid">
                        <p className="service-description">{service.description}</p>
                        <div className="service-tags">
                          {service.tags.map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                        <ul className="service-deliverables">
                          {service.deliverables.map((item) => (
                            <li key={item}>
                              <CheckCircle2 size={15} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <span className="service-ghost" aria-hidden="true" dir="ltr">
                        {service.index}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* work — sticky stacked cards                                         */
/* ------------------------------------------------------------------ */

type Project = (typeof projects)[number];

function ProjectCard({
  project,
  index,
  total,
  progress,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const segment = 1 / total;
  const start = index * segment;
  const end = Math.min(start + segment, 1);
  const isLast = index === total - 1;
  const scale = useTransform(progress, [start, end], [1, isLast ? 1 : 0.94]);
  const y = useTransform(progress, [start, end], [0, isLast ? 0 : -18]);
  const dimOpacity = useTransform(progress, [start, end], [0, isLast ? 0 : 0.55]);

  return (
    <div
      className="stack-item"
      style={
        {
          top: `${88 + index * 14}px`,
          zIndex: index + 1,
          "--project-accent": project.accent,
        } as CSSProperties
      }
    >
      <motion.article className="project-card" style={{ scale, y }}>
        <motion.div className="card-dim" style={{ opacity: dimOpacity }} aria-hidden="true" />
        <div className="project-visual">
          <div className="project-frame">
            <Image
              className="project-frame-img"
              src={project.image}
              alt={`عرض بصري لمشروع ${project.arabicTitle}`}
              fill
              sizes="(max-width: 900px) 100vw, 55vw"
            />
            <div className="project-frame-grid" aria-hidden="true" />
          </div>
          <div className="project-float project-float-a" dir="ltr">
            <Radio size={13} />
            <span>LIVE INDEX</span>
            <strong>{project.metric}</strong>
          </div>
          <div className="project-float project-float-b" dir="ltr">
            <span>INTERFACE</span>
            <strong>{project.index}</strong>
          </div>
          <div className="project-scanline" aria-hidden="true" />
        </div>
        <div className="project-info">
          <div className="project-meta" dir="ltr">
            <span>{project.category}</span>
            <span>{project.year}</span>
          </div>
          <h3>{project.arabicTitle}</h3>
          <p>{project.description}</p>
          <div className="project-result">
            <strong dir="ltr">{project.metric}</strong>
            <span>{project.metricLabel}</span>
          </div>
          <div className="tag-list">
            {project.chips.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </div>
          <div className="project-footer-row">
            <span className="project-role">{project.role}</span>
            <a href="#contact" className="project-link">
              اكتشف الحالة <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

function Work() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  return (
    <section className="work section-shell" id="work">
      <div className="section-heading work-heading">
        <div>
          <p className="section-index">02 — الأعمال المختارة</p>
          <h2>
            <WordReveal text="أعمال صنعت" />
            <br />
            <span className="gradient-line">
              <WordReveal text="فرقًا يُقاس." delay={0.3} />
            </span>
          </h2>
        </div>
        <Reveal delay={0.15}>
          <a href="#contact" className="text-link">
            شاركنا قصتك القادمة <ArrowLeft size={16} />
          </a>
        </Reveal>
      </div>

      <div className="stack-wrap" ref={wrapRef}>
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            total={projects.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* process                                                             */
/* ------------------------------------------------------------------ */

function Process() {
  return (
    <section className="process section-shell" id="process">
      <div className="process-ambient" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="section-heading">
        <div>
          <p className="section-index">03 — المنهج</p>
          <h2>
            <WordReveal text="من إشارة صغيرة" />
            <br />
            <span className="gradient-line">
              <WordReveal text="إلى أثر كبير." delay={0.3} />
            </span>
          </h2>
        </div>
        <Reveal delay={0.15} className="section-intro">
          مسار واضح وسريع — مساحة كافية للتجريب، وانضباط لا يترك النجاح للصدفة.
        </Reveal>
      </div>

      <div className="process-grid">
        <div className="process-line" aria-hidden="true">
          <span />
        </div>
        {processSteps.map((step, index) => (
          <Reveal key={step.number} className="process-item" delay={index * 0.1}>
            <div className="process-node">
              <span dir="ltr">{step.number}</span>
              <i />
            </div>
            <TiltCard className="process-card-wrap">
              <div className="process-card">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <div className="process-output">
                  <CheckCircle2 size={14} /> المخرج: {step.output}
                </div>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <Reveal className="partnership-panel">
        <div className="partner-rings" aria-hidden="true">
          <span />
          <span />
          <span />
          <i>A</i>
        </div>
        <div className="partnership-copy">
          <p className="eyebrow">
            <ShieldCheck size={14} /> شراكة لا تسليم
          </p>
          <h3>فريقنا يصبح امتدادًا لفريقك.</h3>
          <p>تواصل مباشر، قرارات واضحة، ونسخة تعمل أمامك كل أسبوع — بلا صناديق سوداء.</p>
        </div>
        <div className="partnership-stats">
          <span>
            <strong dir="ltr">24h</strong>زمن الاستجابة
          </span>
          <span>
            <strong dir="ltr">1:1</strong>تواصل مباشر
          </span>
          <span>
            <strong dir="ltr">∞</strong>فضول مستمر
          </span>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* contact                                                             */
/* ------------------------------------------------------------------ */

function Contact() {
  return (
    <section className="contact section-shell" id="contact">
      <div className="contact-aura" aria-hidden="true" />
      <div className="contact-rings" aria-hidden="true">
        <span />
        <span />
      </div>
      <Reveal className="contact-heading">
        <p className="section-index section-index-center">04 — ابدأ</p>
        <h2>
          <WordReveal text="هل فكرتك جاهزة" />
          <br />
          <span className="gradient-line-alt">
            <WordReveal text="لعبور البوابة؟" delay={0.3} />
          </span>
        </h2>
        <p className="contact-sub">
          شاركنا الإشارة الأولى. سنعود إليك خلال يوم عمل برؤية واضحة للخطوة التالية.
        </p>
      </Reveal>
      <Reveal className="launcher-container" delay={0.15}>
        <ProjectLauncher />
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* footer                                                              */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Logo />
          <p>
            نصنع تجارب رقمية تجعل المستقبل
            <br />
            أقرب، أوضح، وأكثر إنسانية.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <span>استكشف</span>
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
          <div>
            <span>تواصل</span>
            <a href="mailto:hello@awwa.studio" dir="ltr">
              hello@awwa.studio
            </a>
            <a href="#contact">الرياض · حول العالم</a>
          </div>
        </div>
      </div>
      <div className="footer-signal" aria-hidden="true">
        <span>A</span>
        <span>W</span>
        <span>W</span>
        <span>A</span>
      </div>
      <div className="footer-bottom">
        <span dir="ltr">© 2026 AWWA STUDIO</span>
        <span className="system-online" dir="ltr">
          <i /> ALL SYSTEMS ONLINE
        </span>
        <a href="#top">
          إلى البداية <ArrowUpLeft size={14} />
        </a>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* root experience                                                     */
/* ------------------------------------------------------------------ */

export function AwwaExperience() {
  const [booted, setBooted] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const markBooted = useCallback(() => setBooted(true), []);

  useEffect(() => {
    if (!booted) {
      document.documentElement.style.overflow = "hidden";
      window.scrollTo(0, 0);
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [booted]);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        انتقل إلى المحتوى
      </a>
      <SmoothScroll />
      <CustomCursor />
      <ScrollProgress />
      {mounted &&
        createPortal(
          <AnimatePresence>{!booted && <Preloader onDone={markBooted} />}</AnimatePresence>,
          document.body,
        )}
      <Header />
      <main id="main">
        <Hero booted={booted} />
        <Manifesto />
        <SignalBelt />
        <Services />
        <Work />
        <Process />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

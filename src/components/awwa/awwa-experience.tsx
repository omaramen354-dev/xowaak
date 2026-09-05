"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpLeft,
  Boxes,
  CheckCircle2,
  ChevronDown,
  Code2,
  ExternalLink,
  Gauge,
  Globe2,
  Layers3,
  Menu,
  MousePointer2,
  Palette,
  Play,
  Radio,
  Rocket,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState, type CSSProperties } from "react";
import { CountUp, CursorGlow, Reveal, ScrollProgress, TiltCard } from "./motion-primitives";
import { ProjectLauncher } from "./project-launcher";
import { SceneMount } from "./scene-mount";

const navItems = [
  { href: "#services", label: "القدرات" },
  { href: "#work", label: "الأعمال" },
  { href: "#process", label: "المنهج" },
  { href: "#contact", label: "ابدأ مشروعك" },
];

const services: Array<{
  icon: LucideIcon;
  index: string;
  title: string;
  description: string;
  tags: string[];
  className: string;
}> = [
  {
    icon: Palette,
    index: "01",
    title: "هويات تتحرك",
    description: "نصنع نظامًا بصريًا حيًا، من الاستراتيجية وحتى كل لحظة يلمس فيها جمهورك العلامة.",
    tags: ["Brand Strategy", "Motion ID", "Art Direction"],
    className: "service-wide service-cyan",
  },
  {
    icon: Layers3,
    index: "02",
    title: "تجارب رقمية",
    description: "واجهات غامرة، واضحة وسريعة، مصممة لتبقى في الذاكرة لا لتملأ شاشة فقط.",
    tags: ["UX/UI", "WebGL", "Prototyping"],
    className: "service-tall service-violet",
  },
  {
    icon: Code2,
    index: "03",
    title: "منتجات ذكية",
    description: "منصات قابلة للتوسع تجمع هندسة قوية مع تفاصيل استخدام شديدة البساطة.",
    tags: ["SaaS", "AI Products", "Full-stack"],
    className: "service-magenta",
  },
  {
    icon: Gauge,
    index: "04",
    title: "نمو بلا احتكاك",
    description: "نقيس، نختبر، ونحسّن حتى تتحول التجربة الجميلة إلى نتائج أعمال حقيقية.",
    tags: ["CRO", "Analytics", "Growth"],
    className: "service-emerald",
  },
];

const projects = [
  {
    id: "nebula",
    index: "01",
    title: "NEBULA FINANCE",
    arabicTitle: "الثروة، بواجهة جديدة",
    category: "FINTECH / PRODUCT",
    year: "2026",
    metric: "+214%",
    metricLabel: "تفاعل أسبوعي",
    accent: "#35efff",
    secondary: "#725cff",
    description: "منصة استثمار تتنبأ وتبسّط وتحوّل البيانات المعقدة إلى قرارات هادئة وواضحة.",
    chips: ["Product strategy", "UX/UI", "Development"],
  },
  {
    id: "sora",
    index: "02",
    title: "SORA MOBILITY",
    arabicTitle: "الحركة كإحساس",
    category: "MOBILITY / BRAND",
    year: "2025",
    metric: "4.8×",
    metricLabel: "نمو التحويل",
    accent: "#d84dff",
    secondary: "#ff3f81",
    description: "هوية ومنظومة حجز لمستقبل التنقل الحضري؛ سريعة، مرنة، وإنسانية من أول لمسة.",
    chips: ["Brand system", "Motion", "Digital platform"],
  },
  {
    id: "terra",
    index: "03",
    title: "TERRA GRID",
    arabicTitle: "طاقة تُرى بوضوح",
    category: "CLIMATE / DATA",
    year: "2025",
    metric: "-38%",
    metricLabel: "وقت اتخاذ القرار",
    accent: "#64ffba",
    secondary: "#20bdf2",
    description: "غرفة قيادة حيّة تجعل أداء شبكات الطاقة مفهومًا وقابلًا للتصرف في الوقت الحقيقي.",
    chips: ["Data experience", "3D systems", "Engineering"],
  },
];

const processSteps = [
  {
    number: "01",
    icon: Radio,
    title: "نلتقط الإشارة",
    description: "نغوص في الهدف، السوق، والجمهور حتى نرى الفرصة الحقيقية خلف الفكرة.",
    output: "خريطة الاكتشاف",
  },
  {
    number: "02",
    icon: Boxes,
    title: "نصمّم النظام",
    description: "نحوّل الرؤية إلى لغة بصرية وتجربة أولية يمكن لمسها واختبارها مبكرًا.",
    output: "نموذج تفاعلي",
  },
  {
    number: "03",
    icon: Workflow,
    title: "نبني ونربط",
    description: "نطوّر المنتج في دورات قصيرة، مع جودة تقنية وحركة دقيقة منذ أول سطر.",
    output: "منتج قابل للإطلاق",
  },
  {
    number: "04",
    icon: Rocket,
    title: "نطلق ونطوّر",
    description: "إطلاق مراقَب، قياس مستمر، وتحسينات تجعل المنتج أسرع وأذكى مع الوقت.",
    output: "نظام نمو",
  },
];

function Logo() {
  return (
    <a className="logo" href="#top" aria-label="AWWA — العودة إلى البداية">
      <svg viewBox="0 0 42 42" aria-hidden="true">
        <path d="M5 30 14 10l7 20 7-20 9 20" />
        <path className="logo-spark" d="M10 25h22" />
      </svg>
      <span>AWWA<span className="logo-dot">.</span></span>
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>
        <div className="header-actions">
          <span className="availability"><i /> متاحون لمشروع واحد</span>
          <button className="language-button" type="button" aria-label="اللغة الحالية: العربية">
            <Globe2 size={15} /> AR
          </button>
          <a className="header-cta" href="#contact">دعنا نتحدث <ArrowUpLeft size={16} /></a>
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
            aria-label="التنقل للهاتف"
          >
            {navItems.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <span>0{index + 1}</span>{item.label}<ArrowUpLeft />
              </motion.a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.76], [1, 0]);
  const stageY = useTransform(scrollYProgress, [0, 1], [0, 170]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 0.78]);

  return (
    <section className="hero" id="top" ref={sectionRef}>
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-beam beam-one" aria-hidden="true" />
      <div className="hero-beam beam-two" aria-hidden="true" />
      <div className="hero-noise" aria-hidden="true" />

      <motion.div className="hero-copy" style={{ y: copyY, opacity: copyOpacity }}>
        <motion.div
          className="hero-kicker"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <span className="live-signal"><i /><i /><i /></span>
          استوديو تجارب رقمية مستقل
          <span dir="ltr">RIYADH — WORLDWIDE</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          لا ننتظر<br />
          <span className="outline-word">المستقبل.</span>
          <br />نصنعه.
        </motion.h1>
        <motion.p
          className="hero-description"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.52 }}
        >
          نبني علامات ومنصات ومنتجات ذكية تجمع بين وضوح الفكرة، جرأة التصميم، ودقة التقنية.
        </motion.p>
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.66 }}
        >
          <a className="button button-primary" href="#contact">
            <span>ابدأ الرحلة</span><Rocket size={18} />
          </a>
          <a className="button button-ghost" href="#work">
            <Play size={16} fill="currentColor" /><span>شاهد ما نبنيه</span>
          </a>
        </motion.div>
      </motion.div>

      <motion.div className="hero-stage" style={{ y: stageY, scale: stageScale }}>
        <SceneMount />
        <motion.div
          className="telemetry-card telemetry-a"
          initial={{ opacity: 0, x: -20, y: 15 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
        >
          <span>CREATIVE VELOCITY</span>
          <strong dir="ltr">98.7%</strong>
          <div className="telemetry-bars"><i /><i /><i /><i /><i /><i /></div>
        </motion.div>
        <motion.div
          className="telemetry-card telemetry-b"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.15, duration: 0.7 }}
        >
          <span className="radar"><i /></span>
          <div><strong>SYSTEM</strong><small>ALL SIGNALS NOMINAL</small></div>
        </motion.div>
        <div className="coordinate coordinate-a" dir="ltr">34°03&apos;N / 118°15&apos;W</div>
        <div className="coordinate coordinate-b" dir="ltr">CORE_01 / ONLINE</div>
      </motion.div>

      <div className="hero-bottom">
        <div className="hero-stats">
          <div><strong><CountUp value={47} suffix="+" /></strong><span>منتجًا أطلقناه</span></div>
          <div><strong><CountUp value={12} /></strong><span>سوقًا عالميًا</span></div>
          <div><strong><CountUp value={96} suffix="%" /></strong><span>شراكات مستمرة</span></div>
        </div>
        <a className="scroll-cue" href="#manifesto">
          <MousePointer2 size={15} /><span>مرّر لاكتشاف العالم</span><ChevronDown size={16} />
        </a>
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <section className="manifesto section-shell" id="manifesto">
      <div className="manifesto-orbit" aria-hidden="true">
        <div className="orbit-ring"><span>IDEA</span><span>DESIGN</span><span>CODE</span><span>IMPACT</span></div>
        <div className="orbit-core">A</div>
      </div>
      <Reveal className="manifesto-copy">
        <p className="section-index">00 / THE BELIEF</p>
        <h2>
          المنتج العظيم لا يُشرح.<br />
          <span>يُشعَر به.</span>
        </h2>
        <p>
          لهذا لا نزيّن الأفكار من الخارج. ندخل إلى قلبها، نفهم نبضها، ثم نبني حولها نظامًا رقميًا
          حيًا يختصر المسافة بين الإنسان والاحتمال.
        </p>
      </Reveal>
      <div className="manifesto-side-note" dir="ltr">
        <span>AWWA / PRINCIPLE 001</span>
        <i /> EMOTION × FUNCTION
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="services section-shell" id="services">
      <div className="section-heading">
        <Reveal>
          <p className="section-index">01 / CAPABILITIES</p>
          <h2>كل ما تحتاجه الفكرة<br /><span>لتصبح عالمًا.</span></h2>
        </Reveal>
        <Reveal delay={0.12} className="section-intro">
          فريق واحد متعدد التخصصات، من أول سؤال استراتيجي وحتى آخر تفصيلة في الإطلاق.
        </Reveal>
      </div>

      <div className="services-grid">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <Reveal key={service.title} className={service.className} delay={index * 0.07}>
              <TiltCard className="service-card">
                <div className="card-scan" aria-hidden="true" />
                <div className="service-top"><span>{service.index}</span><Icon size={25} strokeWidth={1.45} /></div>
                <div className="service-visual" aria-hidden="true">
                  <span /><span /><span /><i />
                </div>
                <div className="service-content">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <div className="tag-list">
                    {service.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                </div>
                <ArrowUpLeft className="service-arrow" size={22} />
              </TiltCard>
            </Reveal>
          );
        })}
      </div>

      <div className="capability-marquee" aria-hidden="true">
        <div>
          <span>STRATEGY</span><i /> <span>IDENTITY</span><i /> <span>EXPERIENCE</span><i />
          <span>TECHNOLOGY</span><i /> <span>MOTION</span><i /> <span>AI SYSTEMS</span><i />
          <span>STRATEGY</span><i /> <span>IDENTITY</span><i /> <span>EXPERIENCE</span><i />
          <span>TECHNOLOGY</span><i /> <span>MOTION</span><i /> <span>AI SYSTEMS</span><i />
        </div>
      </div>
    </section>
  );
}

function ProjectVisual({ project }: { project: (typeof projects)[number] }) {
  return (
    <div
      className={`project-visual project-${project.id}`}
      style={{ "--project-accent": project.accent, "--project-secondary": project.secondary } as CSSProperties}
      aria-hidden="true"
    >
      <div className="project-horizon" />
      <div className="project-device">
        <div className="device-top"><span /><span /><span /><small>{project.title}</small></div>
        <div className="device-layout">
          <div className="device-sidebar"><i /><i /><i /><i /></div>
          <div className="device-content">
            <div className="device-metric"><small>LIVE INDEX</small><strong>{project.metric}</strong><span /></div>
            <div className="device-chart">
              {Array.from({ length: 16 }, (_, index) => <i key={index} style={{ height: `${24 + ((index * 31) % 68)}%` }} />)}
            </div>
            <div className="device-cards"><span /><span /><span /></div>
          </div>
        </div>
      </div>
      <div className="project-float project-float-a"><Radio size={14} /><span>LIVE DATA</span><strong>SYNC</strong></div>
      <div className="project-float project-float-b"><span>INTERFACE</span><strong>{project.index}</strong></div>
      <div className="visual-coordinate" dir="ltr">X:{project.index}17 / Y:804</div>
    </div>
  );
}

function Work() {
  const [active, setActive] = useState(0);
  const project = projects[active];

  return (
    <section className="work section-shell" id="work">
      <div className="section-heading work-heading">
        <Reveal>
          <p className="section-index">02 / SELECTED WORK</p>
          <h2>أعمال صنعت<br /><span>فرقًا حقيقيًا.</span></h2>
        </Reveal>
        <Reveal delay={0.12}>
          <a href="#contact" className="text-link">استعرض كل الحالات <ArrowLeft size={17} /></a>
        </Reveal>
      </div>

      <Reveal className="project-showcase">
        <div className="project-tabs" role="tablist" aria-label="المشاريع المختارة">
          {projects.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={active === index ? "project-tab active" : "project-tab"}
              onClick={() => setActive(index)}
              role="tab"
              aria-selected={active === index}
            >
              <span>{item.index}</span>
              <strong>{item.title}</strong>
              <small>{item.category}</small>
              <ArrowLeft size={17} />
            </button>
          ))}
        </div>

        <div className="project-stage">
          <AnimatePresence mode="wait">
            <motion.div
              key={project.id}
              className="project-stage-inner"
              initial={{ opacity: 0, y: 22, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 1.01 }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProjectVisual project={project} />
              <div className="project-info">
                <div className="project-meta"><span>{project.category}</span><span>{project.year}</span></div>
                <h3>{project.arabicTitle}</h3>
                <p>{project.description}</p>
                <div className="project-result"><strong dir="ltr">{project.metric}</strong><span>{project.metricLabel}</span></div>
                <div className="tag-list">{project.chips.map((chip) => <span key={chip}>{chip}</span>)}</div>
                <a href="#contact" className="project-link">اكتشف الحالة <ExternalLink size={16} /></a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}

function Process() {
  return (
    <section className="process section-shell" id="process">
      <div className="process-ambient" aria-hidden="true"><i /><i /><i /></div>
      <div className="section-heading">
        <Reveal>
          <p className="section-index">03 / THE PROTOCOL</p>
          <h2>من إشارة صغيرة<br /><span>إلى أثر كبير.</span></h2>
        </Reveal>
        <Reveal delay={0.12} className="section-intro">
          مسار واضح وسريع، يمنح مساحة كافية للتجريب ولا يترك النجاح للصدفة.
        </Reveal>
      </div>

      <div className="process-grid">
        <div className="process-line" aria-hidden="true"><span /></div>
        {processSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Reveal key={step.number} className="process-item" delay={index * 0.1}>
              <div className="process-node"><span>{step.number}</span><i /></div>
              <TiltCard className="process-card">
                <div className="process-icon"><Icon size={24} strokeWidth={1.5} /></div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <div className="process-output"><CheckCircle2 size={14} /> المخرج: {step.output}</div>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="partnership-panel">
        <div className="partner-rings" aria-hidden="true"><span /><span /><span /><i>A</i></div>
        <div>
          <p className="eyebrow"><ShieldCheck size={14} /> شراكة لا تسليم</p>
          <h3>فريقنا يصبح امتدادًا لفريقك.</h3>
          <p>تواصل مباشر، قرارات واضحة، ونسخة تعمل أمامك كل أسبوع — بلا صناديق سوداء.</p>
        </div>
        <div className="partnership-stats">
          <span><strong>24h</strong>زمن الاستجابة</span>
          <span><strong>1:1</strong>تواصل مباشر</span>
          <span><strong>∞</strong>فضول مستمر</span>
        </div>
      </Reveal>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact section-shell" id="contact">
      <div className="contact-aura" aria-hidden="true" />
      <Reveal className="contact-heading">
        <p className="section-index">04 / INITIATE</p>
        <h2>هل فكرتك جاهزة<br />لعبور <span>البوابة؟</span></h2>
        <p>شاركنا الإشارة الأولى. سنعود إليك خلال يوم عمل برؤية واضحة للخطوة التالية.</p>
      </Reveal>
      <Reveal className="launcher-container" delay={0.14}>
        <ProjectLauncher />
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Logo />
          <p>نصنع تجارب رقمية تجعل المستقبل<br />أقرب، أوضح، وأكثر إنسانية.</p>
        </div>
        <div className="footer-links">
          <div><span>استكشف</span>{navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</div>
          <div><span>تواصل</span><a href="mailto:hello@awwa.studio" dir="ltr">hello@awwa.studio</a><a href="#contact">Riyadh · Worldwide</a></div>
        </div>
      </div>
      <div className="footer-signal" aria-hidden="true">
        <span>A</span><span>W</span><span>W</span><span>A</span>
      </div>
      <div className="footer-bottom">
        <span>© 2026 AWWA STUDIO</span>
        <span className="system-online"><i /> ALL SYSTEMS ONLINE</span>
        <a href="#top">إلى البداية <ArrowUpLeft size={14} /></a>
      </div>
    </footer>
  );
}

export function AwwaExperience() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">انتقل إلى المحتوى</a>
      <ScrollProgress />
      <CursorGlow />
      <Header />
      <main id="main">
        <Hero />
        <Manifesto />
        <Services />
        <Work />
        <Process />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

import type { Dictionary } from "./en";

const nl: Dictionary = {
  brand: { name: "AAKWHX", product: "AWWA", tagline: "Wij bouwen de digitale voorsprong." },
  nav: { home: "Home", services: "Diensten", portfolio: "Portfolio", process: "Werkwijze", quote: "Offerte", portal: "Klantportaal", admin: "Beheer / ERP", contact: "Contact" },
  common: {
    language: "Taal", theme: "Thema", dark: "Donker", light: "Licht", all: "Alles", public: "Openbaar", private: "Privé",
    viewCase: "Bekijk case study", learnMore: "Meer info", send: "Verzenden", cancel: "Annuleren", search: "Zoeken",
    status: "Status", progress: "Voortgang", client: "Klant", budget: "Budget", deadline: "Deadline", team: "Team",
    open: "Openen", close: "Sluiten", download: "Downloaden", upload: "Bestand uploaden", back: "Terug",
    loading: "Laden…", empty: "Nog niets hier.", confidential: "Vertrouwelijk — beschermd door NDA",
  },
  hero: {
    badge: "Full-stack productstudio · Sinds 2016",
    title: "Wij bouwen de systemen die uw concurrenten gaan kopiëren.",
    subtitle: "AAKWHX is een hightech agency dat platformen, AI-systemen en premium interfaces levert voor teams die geen genoegen nemen met middelmatige software.",
    ctaPrimary: "Start een project", ctaSecondary: "Bekijk ons werk",
    stats: [
      { value: "180+", label: "Opgeleverde producten" },
      { value: "31", label: "Landen bediend" },
      { value: "99,98%", label: "Platform-uptime" },
      { value: "7", label: "Ondersteunde talen" },
    ],
  },
  services: {
    title: "Expertise",
    subtitle: "Eén team, de volledige leverketen — van discovery tot een live, gemonitord productiesysteem.",
    items: [
      { title: "Product Engineering", desc: "Webplatformen, dashboards en SaaS op Next.js, TypeScript en edge-infrastructuur.", tags: ["Next.js", "TypeScript", "Edge"] },
      { title: "Mobiele apps", desc: "iOS- en Android-apps van native kwaliteit met gedeelde designsystemen en offline sync.", tags: ["React Native", "Swift", "Kotlin"] },
      { title: "AI & automatisering", desc: "RAG-assistenten, documentpijplijnen en workflow-agents in uw bestaande stack.", tags: ["LLM", "RAG", "Agents"] },
      { title: "Cloud & DevOps", desc: "Infrastructure as code, CI/CD, observability en kostenoptimalisatie op AWS en Vercel.", tags: ["Terraform", "K8s", "CI/CD"] },
      { title: "Merk & UI-systemen", desc: "Designtalen, motion systems en toegankelijke componentbibliotheken in 7 talen.", tags: ["Designsysteem", "Motion", "a11y"] },
      { title: "Security & compliance", desc: "Threat modelling, pentesting, AVG- en ISO-conforme datagovernance.", tags: ["AVG", "Pentest", "RLS"] },
    ],
  },
  portfolio: { title: "Geselecteerd werk", subtitle: "Filter op sector. Private trajecten tonen we geanonimiseerd onder NDA.", filters: { industry: "Sector", visibility: "Zichtbaarheid" } },
  process: {
    title: "Zo leveren wij", subtitle: "Een transparante pijplijn van vijf fases, live zichtbaar in uw klantportaal.",
    steps: [
      { title: "Planning", desc: "Discovery-workshops, scope, architectuurkeuzes en een vaste roadmap." },
      { title: "Design", desc: "Wireframes, designsysteem, prototypes en gevalideerde user flows." },
      { title: "Ontwikkeling", desc: "Sprints van twee weken, wekelijkse demo's en continue deployment naar staging." },
      { title: "Testen", desc: "Geautomatiseerde tests, load testing, security review en toegankelijkheidsaudits." },
      { title: "Review", desc: "Akkoord van de klant, overdracht, documentatie, training en support." },
    ],
  },
  quote: {
    title: "Projectcalculator", subtitle: "Stel uw scope samen en ontvang binnen een minuut een indicatief budget en tijdlijn.",
    fields: { name: "Volledige naam", email: "Zakelijk e-mailadres", company: "Bedrijf", type: "Projecttype", features: "Modules & functies", timeline: "Levertempo", budget: "Budgetrange", notes: "Nog iets dat we moeten weten?" },
    types: { web: "Webplatform", mobile: "Mobiele app", ai: "AI-systeem", ecommerce: "E-commerce", erp: "ERP / interne tools", brand: "Merk & design" },
    speeds: { relaxed: "Rustig (beste prijs)", standard: "Standaard", rush: "Spoed (+40%)" },
    features: { auth: "Authenticatie & rollen", payments: "Betalingen & facturatie", dashboard: "Analytics-dashboard", i18n: "Meertalig (7)", cms: "Contentbeheer", api: "Publieke API", ai: "AI-assistent", realtime: "Realtime & chat" },
    estimate: "Indicatieve schatting", weeks: "weken", submit: "Vraag een voorstel aan",
    success: "Aanvraag ontvangen. We reageren binnen één werkdag.", disclaimer: "Schattingen zijn indicatief en worden bevestigd na een discovery-gesprek.",
  },
  portal: {
    title: "Klantportaal", welcome: "Welkom terug",
    tabs: { overview: "Overzicht", files: "Opleveringen", feedback: "Feedback", messages: "Berichten" },
    milestones: "Projecttijdlijn", completion: "Voltooiing", nextDelivery: "Volgende oplevering",
    filesTitle: "Beveiligde bestandslevering", filesSubtitle: "Designbronnen, documenten en contracten. Elke download wordt gelogd.",
    feedbackTitle: "Revisies & feedback", feedbackPlaceholder: "Beschrijf de gewenste wijziging…", postFeedback: "Feedback plaatsen",
    categories: { design: "Design", content: "Content", bug: "Bug", scope: "Scopewijziging" },
  },
  admin: {
    title: "Operations & ERP",
    tabs: { dashboard: "Dashboard", projects: "Projecten", tasks: "Taken", team: "Team", clients: "Klanten" },
    kpis: { revenue: "Omzet (YTD)", active: "Actieve projecten", utilisation: "Teambezetting", overdue: "Te late taken" },
    workflow: "Delivery-workflow", assign: "Toegewezen aan", roleLabel: "Weergave als",
    roles: { super_admin: "Super Admin", admin: "Beheerder", pm: "Projectmanager", employee: "Medewerker", client: "Klant" },
    permissionDenied: "Uw rol heeft geen toegang tot deze module.", directory: "Klantenoverzicht",
  },
  status: { planning: "Planning", design: "Design", development: "Ontwikkeling", testing: "Testen", review: "Review", completed: "Afgerond", todo: "Te doen", in_progress: "Bezig", blocked: "Geblokkeerd", done: "Klaar" },
  footer: { rights: "Alle rechten voorbehouden.", built: "Ontworpen en gebouwd door AAKWHX.", offices: "Amsterdam · Istanboel · Riyad" },
};

export default nl;

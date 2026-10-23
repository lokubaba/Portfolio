/**
 * Lokesh Deswal - Product Manager Portfolio
 * Application UI Logic, Porter Funnel Simulator, ATS CV Modal & Clipboard
 */

document.addEventListener('DOMContentLoaded', () => {
  initAudioToggle();
  initPorterSimulator();
  initAtsModal();
  initSmoothScroll();
});

// Sound Toggle
function initAudioToggle() {
  const btnMute = document.getElementById('btnToggleSound');
  if (!btnMute) return;

  btnMute.addEventListener('click', () => {
    const isMuted = window.sfx.toggleMute();
    btnMute.innerHTML = isMuted 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
    btnMute.title = isMuted ? 'Unmute Sound' : 'Mute Sound';
  });
}

// Porter Interactive Funnel & GMV Simulator
function initPorterSimulator() {
  const slider = document.getElementById('conversionSlider');
  const rateVal = document.getElementById('simRateVal');
  const tripsVal = document.getElementById('simTripsVal');
  const gmvVal = document.getElementById('simGmvVal');
  const revVal = document.getElementById('simRevVal');

  if (!slider || !rateVal) return;

  const baseRate = 0.41; // 41% baseline
  const monthlyUsers = 100000;
  const aov = 8000; // Rs. 8,000 blended AOV
  const takeRate = 0.169; // ~16.9% platform take rate (2.3Cr / 13.6Cr)

  const updateSim = () => {
    const currentRate = parseFloat(slider.value) / 100;
    rateVal.textContent = `${slider.value}%`;

    const deltaRate = Math.max(0, currentRate - baseRate);
    const incTrips = Math.round(monthlyUsers * deltaRate);
    const incGmv = incTrips * aov; // In rupees
    const incGmvCrores = (incGmv / 10000000).toFixed(1);
    const incRevCrores = ((incGmv * takeRate) / 10000000).toFixed(1);

    if (tripsVal) tripsVal.textContent = `+${incTrips.toLocaleString()} trips/mo`;
    if (gmvVal) gmvVal.textContent = `₹${incGmvCrores} Cr/mo`;
    if (revVal) revVal.textContent = `₹${incRevCrores} Cr/mo`;
  };

  slider.addEventListener('input', updateSim);
  updateSim();
}

// ATS Resume Modal & One-Click Copy
function initAtsModal() {
  const modalOverlay = document.getElementById('atsModalOverlay');
  const openBtns = document.querySelectorAll('.open-ats-btn');
  const closeBtn = document.getElementById('closeAtsModal');
  const copyBtn = document.getElementById('copyAtsBtn');
  const printBtn = document.getElementById('printAtsBtn');

  if (!modalOverlay) return;

  const openModal = (e) => {
    if (e) e.preventDefault();
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // Print button
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Copy Plain Text Resume to Clipboard
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const plainTextResume = getAtsPlainTextContent();
      navigator.clipboard.writeText(plainTextResume).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `✓ Copied Plain Text!`;
        copyBtn.classList.add('btn-primary');
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.classList.remove('btn-primary');
        }, 2200);
      });
    });
  }
}

// Clean Plain Text Resume Format for Application Portals
function getAtsPlainTextContent() {
  return `LOKESH DESWAL
Product Manager | Enterprise SaaS, PropTech & AI Workflows
Pune, Maharashtra, India | +91-9738920466 | d.lokesh45@gmail.com
LinkedIn: https://linkedin.com/in/lokeshdeswal

PROFESSIONAL SUMMARY
Results-driven Product Manager with 10+ years of cross-functional leadership spanning product discovery, MVP scoping, user journey optimization, and enterprise digital solutions across PropTech and B2B SaaS. Proven track record of translating complex enterprise sales and operational bottlenecks into high-adoption digital products—including architecting an enterprise PropTech sales platform delivered as an MVP 2 months ahead of schedule and scaling it across 13+ towers for House of Hiranandani. Built and shipped 3 production SaaS tools and deployed internal AI-assisted workflows that compressed operational turnaround times by 30%–35%. Graduate of IIT Guwahati (B.Tech Mechanical Engineering, Minor in Product Design) with advanced Product Management specialization from Airtribe.

CORE COMPETENCIES
- Product Strategy & Scoping: Product Discovery, PRD & User Story Specification, MVP Definition, RICE Prioritization, Build vs. Buy Decisioning, Roadmap Planning.
- Product Execution & Delivery: Agile / Scrum Sprint Execution, Tech Feasibility Coordination, Cross-Functional Alignment (Engineering, Design, Enterprise Sales), Release Management.
- Growth & Product Analytics: Funnel Teardown & Conversion Optimization, User Journey Mapping, JTBD Framework, A/B Testing, North Star & Guardrail Metrics, GA4, Tableau, Looker.
- Domain Specialization: Enterprise B2B SaaS, PropTech, Spatial & 360° Digital Experiences, Workflow Automation, AI-Assisted Operations.

PROFESSIONAL EXPERIENCE

ZENTRA VISUALS | Pune, India
Business Head / Product & Operations Lead | Jan 2026 – Present
- Spearheaded the end-to-end productization and operational vertical from ground zero, defining delivery roadmaps, unit pricing models, and SLA benchmarks.
- Led discovery interviews across cross-functional internal stakeholders (architects, production engineers, client PMs) to diagnose production bottlenecks, leading to the deployment of 4 specialized internal tools.
- Product-managed internal tooling suite including:
  * 360° Review & Annotation Viewer (viewer.zentravisuals.com): Streamlined spatial draft feedback directly on-cloud, eliminating multi-day back-and-forth review cycles and safeguarding proprietary project data in-house.
  * 360° Image & Superimposition Editor (editor.zentravisuals.com): Designed proprietary workflow tooling for multi-layer spatial overlays, reducing manual asset preparation time by 40%.
  * Client Data Ingestion & Project Portal (portal.zentravisuals.com): Product-managed an onboarding and asset ingestion platform built for getting data from clients directly, eliminating email/WeTransfer friction and automating multi-gigabyte uploads.
- Scoped PRD and technical requirements for a Local-First Team Drive (zero-trust private vaults, peer sharing, expiring links) currently in MVP development.
- Introduced AI-assisted production workflows that compressed project turnaround times by 30% while maintaining zero defect slippage.

RELATA | Pune, India
Product & Experience Lead (Vistaire / Immerse) | Apr 2023 – Dec 2025
- Collaborated directly with CPO, VP of Engineering, UI/UX, and Enterprise Sales to evolve Relata’s enterprise PropTech sales enablement platform.
- Enterprise Client Win & Discovery — House of Hiranandani:
  * Diagnosed critical enterprise sales friction: onsite sales reps were juggling 8–10 disparate browser tabs, walkthrough videos, PDFs, and static floorplans to pitch premium properties, forcing buyers to blindly "imagine" views and layouts.
  * Formulated the product vision for a unified 4-pillar digital sales journey: Neighbourhood, Inventory, Amenities, and Collateral.
  * Authored detailed PRDs, wireframes, and navigational user journeys; aligned technical architecture with Engineering.
  * Re-scoped an initial 6-month monolithic development estimate into a lean 4-month MVP through rigorous RICE prioritization, releasing core value 60 days early with subsequent 2-month phased enhancements.
  * Shipped the platform to enable sales reps to conduct end-to-end presentations via 1 laptop and 1 URL; drove rapid sales-team adoption and expanded deployment across 4 major residential/commercial estates spanning 13+ towers.
- Conducted discovery interviews with 20+ real-estate enterprise developers and 300+ end-users, driving backlog prioritization that lifted client delivery velocity by 32%.
- Partnered with product marketing and enterprise sales on GTM collateral, enterprise pilot onboarding, and renewal retention.

RELATA | Pune, India
Marketing & GTM Head | Aug 2020 – Mar 2023
- Formulated product-led growth (PLG) and B2B go-to-market strategies for Relata’s visualization and digital sales software suite.
- Doubled qualified inbound enterprise B2B sales pipeline within 18 months by instrumenting customer intent funnels and product-centric landing experiences.
- Acted as the feedback bridge between enterprise buyers and engineering to establish feature feasibility, contract SLAs, and onboarding documentation.

SHUTTER DIARIES | India
Founder & Business Head | Jun 2016 – Mar 2023
- Founded, bootstrapped, and scaled a digital production enterprise to ₹6Cr+ cumulative revenue, serving 350+ corporate/individual clients across 1,000+ completed projects with full P&L ownership.
- Engineered repeatable standard operating procedures (SOPs) and delivery automation workflows that cut client delivery cycles by 35% and drove 63% repeat business rate.
- Hired, trained, and managed cross-functional squads of 20+ operations managers, visual engineers, and external vendors.

SELECTED PRODUCT CASE STUDIES

1. Porter: Building First-Trip Goods Transport Confidence (Airtribe PM Capstone)
- Problem Statement: First-time individual logistics customers experienced high quote-to-booking drop-off due to acute trust deficit during high-anxiety relocation days.
- Research & Discovery: Executed 5-method research synthesis across 12 structured surveys, 8 deep customer interviews, 9-stage booking funnel teardown, and 7-competitor benchmark.
- Prioritization (RICE Framework): Scored 8 drop-off themes; prioritized two root-cause barriers: 1) Untrustworthy quote requiring manual callback (RICE 0.266); 2) Post-payment blackout with zero driver/vehicle visibility (RICE 0.163).
- Product Solutions Shipped (v1 Additive Scope):
  * Inline Itemized Price Breakdown + Guaranteed Price-Lock Badge (RICE 0.425) eliminating surprise charges.
  * Pre-Move Driver & Vehicle Reveal Card + 3-Stage Milestone Tracking (Packed -> Loaded -> In-Transit) (RICE 0.298).
- Business Impact & Metrics:
  * Projected first-trip completion rate lift from 41% to 58% (+17 percentage points) within 2 quarters.
  * Unlocked estimated ₹13.6 Cr monthly GMV and ₹2.3 Cr incremental monthly platform revenue (₹31.3 Cr lifetime GMV at 2.3x LTV).
  * Designed gated 5-stage cohort GTM rollout (Bengaluru & Pune 10% holdout -> 50% expansion -> full rollout).

2. Relata Unified Sales Experience (House of Hiranandani)
- Consolidated 10+ disconnected sales documents into a single URL interactive journey.
- Reduced time-to-MVP by 33% (from 6 months to 4 months) by carving out a high-impact MVP.
- Scaled adoption across 13+ towers, resulting in 100% sales team active usage during client pitches.

EDUCATION & CREDENTIALS
- Indian Institute of Technology (IIT) Guwahati: B.Tech in Mechanical Engineering | Minor in Product Design
- Airtribe Product Management Launchpad: AI & Modern Product Management Certification

TOOLS & METHODOLOGIES
- Product Management: PRD/BRD Writing, User Stories & Acceptance Criteria, Jira, Linear, Confluence, Notion, Wireframing (Figma).
- Analytics & Data: GA4, Mixpanel, Tableau, Looker, SQL Fundamentals, Funnel Drop-off Analysis, Cohort Retention.
- Frameworks: RICE Prioritization, Jobs-To-Be-Done (JTBD), MoSCoW, Opportunity Solution Trees, Agile/Scrum, Design Thinking.
- Technical & AI: AI Workflow Automation, REST API principles, Build-vs-Buy Financial Modeling, System Architecture Basics.`;
}

// Smooth scrolling with offset for fixed header
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

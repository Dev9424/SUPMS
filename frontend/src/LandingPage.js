import React, { useEffect, useState } from 'react';
import './LandingPage.css';

function LandingPage({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  const [counters, setCounters] = useState({ hospitals: 0, patients: 0, doctors: 0, records: 0 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate counters
  useEffect(() => {
    const targets = { hospitals: 120, patients: 50000, doctors: 3400, records: 2000000 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounters({
        hospitals: Math.round(targets.hospitals * ease),
        patients: Math.round(targets.patients * ease),
        doctors: Math.round(targets.doctors * ease),
        records: Math.round(targets.records * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const formatNum = (n) => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M+' : n >= 1000 ? (n / 1000).toFixed(0) + 'K+' : n + '+';

  return (
    <div className="landing">
      {/* NAV */}
      <nav className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
        <div className="lp-nav__inner">
          <div className="lp-nav__logo">
            <span className="lp-nav__logo-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="7" fill="#1a6fd4"/>
                <path d="M14 6v16M6 14h16" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="lp-nav__logo-text">SUPMS<span className="lp-nav__logo-dot">.</span></span>
          </div>
          <div className="lp-nav__links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#security">Security</a>
            <a href="#roles">Roles</a>
          </div>
          <div className="lp-nav__actions">
            <button className="lp-btn lp-btn--ghost" onClick={onGetStarted}>Sign In</button>
            <button className="lp-btn lp-btn--primary" onClick={onGetStarted}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero__bg-grid"></div>
        <div className="lp-hero__glow lp-hero__glow--1"></div>
        <div className="lp-hero__glow lp-hero__glow--2"></div>
        <div className="lp-hero__content">
          <div className="lp-hero__badge">
            <span className="lp-badge__dot"></span>
            Trusted by 120+ Hospitals Nationwide
          </div>
          <h1 className="lp-hero__title">
            Unified Patient Records<br />
            <span className="lp-hero__title-accent">Across Every Hospital</span>
          </h1>
          <p className="lp-hero__subtitle">
            SUPMS empowers doctors, hospitals, and patients with a single, secure platform 
            to access complete medical histories—regardless of where care was received.
          </p>
          <div className="lp-hero__cta">
            <button className="lp-btn lp-btn--hero" onClick={onGetStarted}>
              Access the System
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9h12M9 3l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <a href="#how-it-works" className="lp-btn lp-btn--outline">See How It Works</a>
          </div>
          <div className="lp-hero__trust">
            <span className="lp-trust__badge lp-trust__badge--green">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1l1.5 3.5L12 5l-2.5 2.5.5 3.5L7 9.5 4 11l.5-3.5L2 5l3.5-.5L7 1z" fill="#22c55e"/>
              </svg>
              HIPAA Compliant
            </span>
            <span className="lp-trust__badge lp-trust__badge--blue">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="#1a6fd4" strokeWidth="1.5"/>
                <path d="M5 6V4.5a2 2 0 014 0V6" stroke="#1a6fd4" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              End-to-End Encrypted
            </span>
            <span className="lp-trust__badge lp-trust__badge--slate">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="#64748b" strokeWidth="1.5"/>
                <path d="M7 4.5V7l1.5 1.5" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              24 / 7 Uptime
            </span>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="lp-hero__visual">
          <div className="lp-dashboard-preview">
            <div className="ldp-header">
              <div className="ldp-title">Patient Dashboard</div>
              <div className="ldp-status ldp-status--live">● Live</div>
            </div>
            <div className="ldp-stats">
              <div className="ldp-stat">
                <div className="ldp-stat__value" style={{color:'#1a6fd4'}}>247</div>
                <div className="ldp-stat__label">Total Patients</div>
              </div>
              <div className="ldp-stat">
                <div className="ldp-stat__value" style={{color:'#22c55e'}}>1,892</div>
                <div className="ldp-stat__label">Records Synced</div>
              </div>
              <div className="ldp-stat">
                <div className="ldp-stat__value" style={{color:'#f59e0b'}}>34</div>
                <div className="ldp-stat__label">Pending Reviews</div>
              </div>
            </div>
            <div className="ldp-records">
              {[
                { name: 'Priya Sharma', tag: 'Cardiology', color: '#dbeafe', tc: '#1d4ed8' },
                { name: 'Arjun Mehta', tag: 'Orthopedics', color: '#dcfce7', tc: '#166534' },
                { name: 'Kavya Nair', tag: 'Neurology', color: '#fce7f3', tc: '#9d174d' },
                { name: 'Rohit Gupta', tag: 'Pediatrics', color: '#fef3c7', tc: '#92400e' },
              ].map((r, i) => (
                <div key={i} className="ldp-record">
                  <div className="ldp-record__avatar" style={{background: r.color, color: r.tc}}>{r.name[0]}</div>
                  <div className="ldp-record__name">{r.name}</div>
                  <div className="ldp-record__tag" style={{background: r.color, color: r.tc}}>{r.tag}</div>
                  <div className="ldp-record__dot"></div>
                </div>
              ))}
            </div>
            <div className="ldp-bar-chart">
              {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
                <div key={i} className="ldp-bar" style={{height: `${h}%`, animationDelay: `${i * 0.1}s`}}></div>
              ))}
            </div>
          </div>

          {/* Floating badges */}
          <div className="lp-float-card lp-float-card--1">
            <div className="lfc-icon" style={{background:'#dbeafe'}}>🔒</div>
            <div>
              <div className="lfc-title">Secure Access</div>
              <div className="lfc-sub">Role-based permissions</div>
            </div>
          </div>
          <div className="lp-float-card lp-float-card--2">
            <div className="lfc-icon" style={{background:'#dcfce7'}}>✓</div>
            <div>
              <div className="lfc-title">Record Updated</div>
              <div className="lfc-sub">Just now · Apollo Hospital</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="lp-stats">
        <div className="lp-container">
          <div className="lp-stats__grid">
            {[
              { value: formatNum(counters.hospitals), label: 'Partner Hospitals' },
              { value: formatNum(counters.patients), label: 'Patients Registered' },
              { value: formatNum(counters.doctors), label: 'Healthcare Providers' },
              { value: formatNum(counters.records), label: 'Records Secured' },
            ].map((s, i) => (
              <div key={i} className="lp-stat-card">
                <div className="lp-stat-card__value">{s.value}</div>
                <div className="lp-stat-card__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="lp-features" id="features">
        <div className="lp-container">
          <div className="lp-section-header">
            <div className="lp-section-tag">Features</div>
            <h2 className="lp-section-title">Everything You Need for Seamless Patient Care</h2>
            <p className="lp-section-sub">Built for hospitals, doctors, and patients — a single source of truth for all medical data.</p>
          </div>
          <div className="lp-features__grid">
            {[
              {
                icon: '🏥',
                color: '#dbeafe',
                title: 'Cross-Hospital Access',
                desc: 'Access complete patient histories from any partner hospital. No more siloed records or data gaps.',
              },
              {
                icon: '🔒',
                color: '#dcfce7',
                title: 'Advanced Security',
                desc: 'End-to-end encryption, role-based access control, and full audit trails for every record viewed.',
              },
              {
                icon: '📊',
                color: '#fce7f3',
                title: 'Analytics Dashboard',
                desc: 'Hospital admins get real-time disease trend analysis, patient growth charts, and performance metrics.',
              },
              {
                icon: '📅',
                color: '#fef3c7',
                title: 'Appointment Management',
                desc: 'Doctors can schedule, approve, and manage appointments with integrated patient notifications.',
              },
              {
                icon: '👤',
                color: '#e0e7ff',
                title: 'Patient Self-Service',
                desc: 'Patients can register, view their own medical history, and track visit progress in real-time.',
              },
              {
                icon: '⚡',
                color: '#d1fae5',
                title: 'Instant Search',
                desc: 'Quickly find any patient by name or ID across the full hospital network in milliseconds.',
              },
            ].map((f, i) => (
              <div key={i} className="lp-feature-card">
                <div className="lp-feature-card__icon" style={{background: f.color}}>{f.icon}</div>
                <h3 className="lp-feature-card__title">{f.title}</h3>
                <p className="lp-feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-how" id="how-it-works">
        <div className="lp-container">
          <div className="lp-section-header">
            <div className="lp-section-tag">How It Works</div>
            <h2 className="lp-section-title">Simple, Secure, Seamless</h2>
            <p className="lp-section-sub">From login to complete medical access in three steps.</p>
          </div>
          <div className="lp-how__steps">
            {[
              { num: '01', title: 'Authenticate', desc: 'Login with your hospital-issued credentials. Role-based access automatically unlocks the appropriate dashboard — Doctor, Hospital Admin, or Patient.' },
              { num: '02', title: 'Search & Access', desc: 'Search for any patient across the SUPMS network. Full visit history, diagnoses, prescriptions, and reports are available instantly.' },
              { num: '03', title: 'Update & Sync', desc: 'Add new visits, diagnoses, and treatment plans. Changes sync in real-time across all authorized hospitals and the patient\'s own record.' },
            ].map((s, i) => (
              <div key={i} className="lp-how__step">
                <div className="lp-how__step-num">{s.num}</div>
                <div className="lp-how__step-content">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
                {i < 2 && <div className="lp-how__step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY SECTION */}
      <section className="lp-security" id="security">
        <div className="lp-container">
          <div className="lp-security__inner">
            <div className="lp-security__text">
              <div className="lp-section-tag lp-section-tag--light">Security</div>
              <h2 className="lp-section-title lp-section-title--light">Your Data, Fortified</h2>
              <p className="lp-section-sub lp-section-sub--light">
                We apply the highest standards of healthcare data security to ensure patient information 
                is safe, compliant, and accessible only to authorized personnel.
              </p>
              <div className="lp-security__checks">
                {[
                  'HIPAA-compliant data handling',
                  'AES-256 encryption at rest',
                  'TLS 1.3 in transit',
                  'Role-based access control (RBAC)',
                  'Complete audit trail logging',
                  'Multi-hospital approval workflows',
                ].map((item, i) => (
                  <div key={i} className="lp-security__check">
                    <span className="lp-check__icon">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="lp-security__visual">
              <div className="lp-shield">
                <svg width="100" height="120" viewBox="0 0 100 120" fill="none">
                  <path d="M50 5L10 22v38c0 24 18 45 40 52 22-7 40-28 40-52V22L50 5z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                  <path d="M35 58l10 10 20-20" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="lp-shield__label">Secured</div>
              </div>
              <div className="lp-security__stats-grid">
                {[
                  { val: '99.99%', label: 'Uptime SLA' },
                  { val: '<50ms', label: 'Response Time' },
                  { val: '0', label: 'Data Breaches' },
                  { val: 'ISO 27001', label: 'Certified' },
                ].map((s, i) => (
                  <div key={i} className="lp-sec-stat">
                    <div className="lp-sec-stat__val">{s.val}</div>
                    <div className="lp-sec-stat__label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="lp-roles" id="roles">
        <div className="lp-container">
          <div className="lp-section-header">
            <div className="lp-section-tag">User Roles</div>
            <h2 className="lp-section-title">Built for Every Stakeholder</h2>
            <p className="lp-section-sub">One platform, three roles — each with a tailored experience.</p>
          </div>
          <div className="lp-roles__grid">
            {[
              {
                icon: '🩺',
                role: 'Doctor',
                color: '#1a6fd4',
                bg: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
                perms: [
                  'View complete patient history',
                  'Add visits & diagnoses',
                  'Manage prescriptions & reports',
                  'Approve appointments',
                  'Track patient progress',
                ],
              },
              {
                icon: '🏥',
                role: 'Hospital Admin',
                color: '#7c3aed',
                bg: 'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)',
                perms: [
                  'Full analytics dashboard',
                  'Disease trend analysis',
                  'Patient growth metrics',
                  'Hospital performance stats',
                  'Cross-hospital oversight',
                ],
              },
              {
                icon: '👤',
                role: 'Patient',
                color: '#059669',
                bg: 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)',
                perms: [
                  'View personal medical history',
                  'Track visit progress',
                  'See prescriptions & diagnoses',
                  'Book appointments',
                  'Receive health notifications',
                ],
              },
            ].map((r, i) => (
              <div key={i} className="lp-role-card" style={{background: r.bg}}>
                <div className="lp-role-card__icon" style={{fontSize: '2.5rem'}}>{r.icon}</div>
                <h3 className="lp-role-card__title" style={{color: r.color}}>{r.role}</h3>
                <ul className="lp-role-card__list">
                  {r.perms.map((p, j) => (
                    <li key={j}>
                      <span style={{color: r.color}}>✓</span> {p}
                    </li>
                  ))}
                </ul>
                <button className="lp-btn lp-btn--role" style={{color: r.color, borderColor: r.color}} onClick={onGetStarted}>
                  Login as {r.role}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="lp-cta">
        <div className="lp-container">
          <div className="lp-cta__inner">
            <h2 className="lp-cta__title">Ready to Transform Patient Care?</h2>
            <p className="lp-cta__sub">Join 120+ hospitals already using SUPMS to deliver better, faster, and safer healthcare.</p>
            <button className="lp-btn lp-btn--hero" onClick={onGetStarted}>
              Access the System
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9h12M9 3l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer__inner">
            <div className="lp-footer__brand">
              <div className="lp-nav__logo">
                <span className="lp-nav__logo-icon">
                  <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                    <rect width="28" height="28" rx="7" fill="#1a6fd4"/>
                    <path d="M14 6v16M6 14h16" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </span>
                <span className="lp-nav__logo-text" style={{fontSize:'1.1rem'}}>SUPMS<span className="lp-nav__logo-dot">.</span></span>
              </div>
              <p className="lp-footer__tagline">Secure Unified Patient Medical History System</p>
            </div>
            <div className="lp-footer__copy">
              © 2025 SUPMS. All rights reserved. Built for secure, unified healthcare.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

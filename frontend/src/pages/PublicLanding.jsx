import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Sparkles,
  BarChart3,
} from 'lucide-react';

export default function PublicLanding() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* HERO SECTION */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '90px 24px 70px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 50,
          alignItems: 'center',
        }}
      >
        {/* LEFT CONTENT */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--accent-bg)',
              border: '1px solid var(--border)',
              padding: '8px 14px',
              borderRadius: 999,
              marginBottom: 22,
              fontSize: 14,
              color: 'var(--text2)'
            }}
          >
            <Sparkles size={16} color="var(--accent)" />
            Modern Multi-Brand Loyalty Platform
          </div>

          <h1 style={{ fontSize: 'clamp(42px, 7vw, 68px)', lineHeight: 1.1, marginBottom: 20, fontWeight: 800 }}>
            Build Better
            <br />
            Customer Relationships
          </h1>

          <p style={{ fontSize: 18, color: 'var(--text2)', lineHeight: 1.8, maxWidth: 620 }}>
            A modern loyalty and rewards platform designed for retail brands.
            Manage customer engagement, campaigns, rewards, and analytics from
            one powerful dashboard experience.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 32,
              flexWrap: 'wrap',
            }}
          >
            <Link to="/register" className="btn btn-primary">
              Get Started
              <ArrowRight size={18} />
            </Link>

            <Link to="/login" className="btn btn-ghost">
              Sign In
            </Link>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div>
          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 28,
              padding: 30,
              backdropFilter: 'blur(8px)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="cat-container" style={{ marginBottom: 12 }}>
              <svg width="140" height="120" viewBox="0 0 140 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g className="sleep-breathe">
                  {/* head */}
                  <circle cx="70" cy="56" r="36" fill="#ffffff" stroke="#e6e6e9" strokeWidth="1" />
                  {/* ears */}
                  <path d="M46 34 L36 16 L56 30 Z" fill="#ffffff" stroke="#e6e6e9" strokeWidth="1" />
                  <path d="M94 34 L104 16 L84 30 Z" fill="#ffffff" stroke="#e6e6e9" strokeWidth="1" />

                  {/* closed eyes (sleeping) */}
                  <path d="M52 58 q6 6 16 0" stroke="#111827" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9" />
                  <path d="M92 58 q-6 6 -16 0" stroke="#111827" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9" />

                  {/* tiny nose/mouth */}
                  <path d="M70 68 q2 2 4 0" stroke="#f472b6" strokeWidth="1.6" fill="none" strokeLinecap="round" />

                  {/* paws */}
                  <ellipse cx="48" cy="92" rx="9" ry="6" fill="#ffffff" stroke="#e6e6e9" />
                  <ellipse cx="92" cy="92" rx="9" ry="6" fill="#ffffff" stroke="#e6e6e9" />
                </g>

                {/* snoring Z's */}
                <text className="snore" x="88" y="22" fontSize="14" fontWeight="700">Z</text>
                <text className="snore" x="98" y="10" fontSize="16" fontWeight="700">Z</text>
                <text className="snore" x="110" y="2" fontSize="18" fontWeight="700">Z</text>
              </svg>
            </div>
            <div
              style={{
                display: 'grid',
                gap: 18,
              }}
            >
              {[
                {
                  icon: <Users color="var(--info)" />,
                  title: 'Customer Management',
                  desc: 'Manage users, profiles, and engagement activity.',
                },
                {
                  icon: <LayoutDashboard color="var(--success)" />,
                  title: 'Admin Dashboard',
                  desc: 'Centralized controls for brands and campaigns.',
                },
                {
                  icon: <BarChart3 color="var(--accent)" />,
                  title: 'Analytics & Insights',
                  desc: 'Track growth, engagement, and platform performance.',
                },
                {
                  icon: <ShieldCheck color="var(--warn)" />,
                  title: 'Secure Access',
                  desc: 'Authentication and protected role-based routes.',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: 'var(--bg3)',
                    borderRadius: 18,
                    padding: 18,
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ minWidth: 48, height: 48, borderRadius: 14, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </div>

                  <div>
                    <h3 style={{ margin: 0, marginBottom: 6 }}>
                      {item.title}
                    </h3>

                    <p style={{ margin: 0, color: 'var(--text2)', lineHeight: 1.6 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px 90px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 55 }}>
          <h2
            style={{
              fontSize: 42,
              marginBottom: 16,
            }}
          >
            Powerful Features
          </h2>

          <p style={{ color: 'var(--text2)', maxWidth: 700, margin: '0 auto', lineHeight: 1.7 }}>
            Everything needed to manage a scalable customer loyalty ecosystem
            with modern tools and a seamless user experience.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 24,
          }}
        >
          {[
            {
              title: 'Multi-Brand Support',
              desc: 'Support multiple retail brands within one platform.',
            },
            {
              title: 'Responsive Design',
              desc: 'Optimized experience across desktop, tablet, and mobile.',
            },
            {
              title: 'Protected Routes',
              desc: 'Role-based access for admins, managers, and customers.',
            },
            {
              title: 'Modern Dashboard',
              desc: 'Clean dashboards with tables, analytics, and controls.',
            },
          ].map((item, index) => (
            <div
              key={index}
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 22, padding: 28 }}
            >
              <h3 style={{ marginTop: 0 }}>{item.title}</h3>

              <p style={{ color: 'var(--text2)', lineHeight: 1.7, marginBottom: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
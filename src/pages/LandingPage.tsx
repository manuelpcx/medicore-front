import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../components/ui/Icon';
import { PLANS } from '../utils/plans';

// Página de bienvenida pública en "/" (sin sesión). Traducción 1:1 del
// Artifact HTML aprobado por el usuario — ver specs/landing-page-frontend/.
// Página de un solo tema (claro), sin llamadas a api/ ni hooks de React
// Query: es contenido estático de marketing.
export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingPlans />
      <LandingFooter />
    </div>
  );
}

// ── Nav ──────────────────────────────────────────────────────────────────
function LandingNav() {
  return (
    <nav className="landing-nav">
      <div style={navInnerStyle}>
        <a href="#top" style={brandStyle}>
          <span style={brandMarkStyle}>M</span>
          <span style={brandWordStyle}>MediHistory</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <a className="landing-nav-link" href="#resuelve" style={navLinkStyle}>Qué puedes hacer</a>
          <a className="landing-nav-link" href="#planes" style={navLinkStyle}>Planes</a>
          <Link to="/login" style={{ ...navLinkStyle, color: 'var(--text)', fontWeight: 700 }}>
            Iniciar sesión
          </Link>
          <Link to="/register" style={btnPrimaryStyle}>Crear cuenta</Link>
        </div>
      </div>
    </nav>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────
function LandingHero() {
  return (
    <div style={containerStyle}>
      <section id="top" style={heroSectionStyle} className="landing-hero">
        <div>
          <span style={eyebrowStyle}>
            <span style={eyebrowDotStyle} />
            Historial médico personal
          </span>
          <h1 style={heroTitleStyle}>
            Tu historial médico,
            <br />
            <span style={{ color: 'var(--accent)' }}>siempre contigo</span>
          </h1>
          <p style={heroSubStyle}>
            Consultas, medicamentos, exámenes, alergias y vacunas en un solo
            lugar — y un acceso seguro para compartir con tu médico o con tu
            familia cuando lo necesites.
          </p>
          <div style={heroCtasStyle}>
            <Link to="/register" style={btnPrimaryLgStyle}>Crear cuenta gratis</Link>
            <a href="#planes" style={btnGhostLgStyle}>Ver los planes</a>
          </div>
          <div style={heroTrustStyle}>
            Tus datos médicos, cifrados y solo tuyos
          </div>
        </div>

        <div style={previewCardStyle}>
          <span style={previewBadgeStyle}>
            <Icon name="user" size={12} color="#fff" />
            Plan Familiar
          </span>
          <div style={previewTopbarStyle}>
            <span style={{ ...previewDotStyle, background: '#E4736B' }} />
            <span style={{ ...previewDotStyle, background: '#E8B85B' }} />
            <span style={{ ...previewDotStyle, background: '#6FBF8C' }} />
          </div>
          <div style={previewGreetingStyle}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>Hola, Camila</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
              Aquí está el resumen de tu historial médico.
            </div>
            <div style={previewApptStyle}>
              <Icon name="calendar" size={13} color="#fff" />
              Próxima cita · 14 de agosto
            </div>
          </div>
          <div style={previewGridStyle}>
            <div style={previewTileStyle}>
              <div style={previewTileValStyle}>62</div>
              <div style={previewTileLblStyle}>Peso kg</div>
            </div>
            <div style={previewTileStyle}>
              <div style={previewTileValStyle}>120/80</div>
              <div style={previewTileLblStyle}>Presión</div>
            </div>
            <div style={previewTileStyle}>
              <div style={previewTileValStyle}>2</div>
              <div style={previewTileLblStyle}>Alergias</div>
            </div>
          </div>
          <div style={previewRowStyle}>
            <span style={{ ...previewRowIcStyle, background: 'var(--accent2)' }}>
              <Icon name="pill" size={15} color="var(--accent3)" />
            </span>
            <div>
              <div style={previewRowTxtStyle}>Losartán 50mg</div>
              <div style={previewRowSubStyle}>08:00 y 20:00</div>
            </div>
          </div>
          <div style={{ ...previewRowStyle, marginBottom: 0 }}>
            <span style={{ ...previewRowIcStyle, background: 'var(--purple2)' }}>
              <Icon name="qr" size={15} color="var(--purple)" />
            </span>
            <div>
              <div style={previewRowTxtStyle}>Acceso médico QR</div>
              <div style={previewRowSubStyle}>Válido por 10 minutos</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Qué resuelve ─────────────────────────────────────────────────────────
interface FeatureItem {
  title: string;
  desc: string;
  icon: IconName;
  bg: string;
  color: string;
}

const FEATURES: readonly FeatureItem[] = [
  {
    title: 'Historial médico',
    desc: 'Consultas, diagnósticos y notas de cada especialidad, con la fecha de tu próximo control.',
    icon: 'clipboard', bg: 'var(--accent2)', color: 'var(--accent3)',
  },
  {
    title: 'Medicamentos',
    desc: 'Dosis, frecuencia y recordatorios — para ti y para quienes cuidas.',
    icon: 'pill', bg: 'var(--purple2)', color: 'var(--purple)',
  },
  {
    title: 'Exámenes',
    desc: 'Sube el resultado en PDF o foto y guárdalo junto al resto de tu historial.',
    icon: 'flask', bg: 'var(--blue2)', color: 'var(--blue)',
  },
  {
    title: 'Alergias',
    desc: 'Tipo y severidad siempre a la vista, para ti y para quien te atienda.',
    icon: 'alert', bg: 'var(--amber2)', color: 'var(--amber)',
  },
  {
    title: 'Vacunas',
    desc: 'Registro de dosis aplicadas y la fecha de la próxima, sin adivinar.',
    icon: 'syringe', bg: 'var(--accent2)', color: 'var(--accent3)',
  },
  {
    title: 'Acceso médico',
    desc: 'Genera un código temporal para que tu médico vea un resumen seguro, sin crear cuenta.',
    icon: 'qr', bg: 'var(--purple2)', color: 'var(--purple)',
  },
] as const;

function LandingFeatures() {
  return (
    <div style={containerStyle}>
      <section id="resuelve" style={sectionStyle}>
        <div style={sectionHeadCenterStyle}>
          <div style={sectionEyebrowStyle}>Qué puedes hacer</div>
          <h2 style={sectionHeadH2Style}>Todo tu historial médico, ordenado</h2>
          <p style={sectionHeadPStyle}>
            Registra lo importante una vez y encuéntralo siempre — sin
            cartolas sueltas, ni WhatsApps con exámenes perdidos.
          </p>
        </div>

        <div style={featuresGridStyle} className="landing-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} style={featureCardStyle} className="landing-feature-card">
              <span style={{ ...featureIconStyle, background: f.bg }}>
                <Icon name={f.icon} size={21} color={f.color} />
              </span>
              <h3 style={featureCardH3Style}>{f.title}</h3>
              <p style={featureCardPStyle}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={familyStripStyle}>
          <span style={familyStripIcStyle}>
            <Icon name="user" size={24} color="#fff" />
          </span>
          <div>
            <h3 style={familyStripH3Style}>Y si administras el historial de tu familia</h3>
            <p style={familyStripPStyle}>
              Con el Plan Familiar puedes ayudar a tus familiares a gestionar
              el suyo, e incluso agregar a los menores a tu cargo — sin
              mezclar los datos de nadie.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Planes ───────────────────────────────────────────────────────────────
function LandingPlans() {
  return (
    <div id="planes" style={sectionAltStyle}>
      <div style={containerStyle}>
        <section style={sectionStyle}>
          <div style={sectionHeadCenterStyle}>
            <div style={sectionEyebrowStyle}>Planes</div>
            <h2 style={sectionHeadH2Style}>Elige el plan que más te convenga</h2>
            <p style={sectionHeadPStyle}>
              Empieza gratis. Cambia de plan cuando quieras, sin compromisos.
            </p>
          </div>

          <div style={plansGridStyle} className="landing-plans-grid">
            {PLANS.map((plan) => {
              const featured = plan.id === 'family';
              const ctaText = plan.id === 'free' ? 'Crear cuenta gratis' : 'Crear cuenta';
              const ctaStyle = featured
                ? planCtaFamilyStyle
                : plan.id === 'free' ? planCtaGhostStyle : planCtaPrimaryStyle;
              return (
                <div
                  key={plan.id}
                  style={featured ? { ...planCardStyle, ...planCardFeaturedStyle } : planCardStyle}
                >
                  {featured && <span style={planFeaturedTagStyle}>Más popular</span>}
                  <div>
                    <div style={{ ...planNameStyle, color: plan.color }}>{plan.nombre}</div>
                    <div style={planPriceStyle}>{plan.precio}</div>
                  </div>
                  <ul style={planFeaturesStyle}>
                    {plan.features.map((f) => (
                      <li key={f} style={planFeatureItemStyle}>
                        <Icon name="check" size={16} color={plan.color} style={{ marginTop: 2 }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" style={{ ...ctaStyle, marginTop: 'auto' }}>
                    {ctaText}
                  </Link>
                </div>
              );
            })}
          </div>

          <p style={plansNoteStyle}>
            Eliges tu plan después de crear tu cuenta. El plan Free no requiere tarjeta.
          </p>
        </section>
      </div>
    </div>
  );
}

// ── CTA final + Footer ───────────────────────────────────────────────────
function LandingFooter() {
  return (
    <>
      <div style={finalCtaStyle}>
        <h2 style={finalCtaH2Style}>Empieza a ordenar tu historial hoy</h2>
        <p style={finalCtaPStyle}>Crear una cuenta toma menos de un minuto.</p>
        <div style={{ ...heroCtasStyle, justifyContent: 'center', marginTop: 30 }}>
          <Link to="/register" style={btnPrimaryLgStyle}>Crear cuenta gratis</Link>
        </div>
      </div>

      <footer style={footerStyle}>
        <div style={footerInnerStyle}>
          <div style={footerBrandStyle}>
            <span style={footerBrandMarkStyle}>M</span>
            <span style={footerBrandWordStyle}>MediHistory</span>
            <span style={footerTagStyle}>· Tu historial médico, siempre contigo</span>
          </div>
          <div style={footerLegalStyle}>
            <Link to="/legal/terms" style={footerLegalLinkStyle}>Términos</Link>
            &nbsp;·&nbsp;
            <Link to="/legal/privacy" style={footerLegalLinkStyle}>Privacidad</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────────
   Mismo patrón que ElegirPlanPage.tsx/LoginPage.tsx/RegisterPage.tsx: objetos
   de estilo inline en TypeScript, sin CSS Modules ni styled-components. Los
   tokens (--bg, --surface, --accent, --purple, --radius-card, --radius-btn,
   --shadow*, etc.) son los ya definidos en styles/globals.css. */

const containerStyle: React.CSSProperties = {
  maxWidth: 1120, margin: '0 auto', padding: '0 24px',
};

// Nav
const navInnerStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 24px', maxWidth: 1120, margin: '0 auto',
};
const brandStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none',
};
const brandMarkStyle: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 9, background: 'var(--accent)',
  color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800,
  fontSize: 16, flexShrink: 0,
};
const brandWordStyle: React.CSSProperties = {
  fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em', color: 'var(--text)',
};
const navLinkStyle: React.CSSProperties = {
  fontSize: 14, fontWeight: 600, color: 'var(--text2)', textDecoration: 'none',
};

// Botones (traducción de .btn/.btn-primary/.btn-ghost/.btn-lg del Artifact)
const btnBaseStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  borderRadius: 'var(--radius-btn)', fontWeight: 700, fontSize: 14,
  padding: '10px 18px', textDecoration: 'none', border: 'none', cursor: 'pointer',
  fontFamily: 'inherit', whiteSpace: 'nowrap',
};
const btnPrimaryStyle: React.CSSProperties = {
  ...btnBaseStyle, background: 'var(--accent)', color: '#fff', boxShadow: 'var(--shadow-sm)',
};
const btnGhostStyle: React.CSSProperties = {
  ...btnBaseStyle, background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)',
};
const btnLgExtra: React.CSSProperties = { padding: '14px 26px', fontSize: 15.5, borderRadius: 12 };
const btnPrimaryLgStyle: React.CSSProperties = { ...btnPrimaryStyle, ...btnLgExtra };
const btnGhostLgStyle: React.CSSProperties = { ...btnGhostStyle, ...btnLgExtra };

// Hero
const heroSectionStyle: React.CSSProperties = {
  padding: '72px 0 88px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr',
  gap: 56, alignItems: 'center',
};
const eyebrowStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'var(--accent2)', color: 'var(--accent3)', fontWeight: 700, fontSize: 12.5,
  letterSpacing: '0.02em', padding: '6px 13px', borderRadius: 999, marginBottom: 20,
};
const eyebrowDotStyle: React.CSSProperties = {
  width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
};
const heroTitleStyle: React.CSSProperties = {
  fontSize: 'clamp(34px, 4.6vw, 52px)', fontWeight: 800, letterSpacing: '-0.025em',
  lineHeight: 1.08, color: 'var(--text)',
};
const heroSubStyle: React.CSSProperties = {
  marginTop: 20, fontSize: 17, color: 'var(--text2)', maxWidth: '46ch', lineHeight: 1.6,
};
const heroCtasStyle: React.CSSProperties = {
  display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap',
};
const heroTrustStyle: React.CSSProperties = {
  marginTop: 22, display: 'flex', alignItems: 'center', gap: 10,
  fontSize: 12.5, color: 'var(--text3)',
};

// Mini preview del dashboard
const previewCardStyle: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20,
  boxShadow: 'var(--shadow-lg)', padding: 22, position: 'relative',
};
const previewBadgeStyle: React.CSSProperties = {
  position: 'absolute', top: -14, right: 22, background: 'var(--purple)', color: '#fff',
  fontSize: 11, fontWeight: 800, padding: '7px 13px', borderRadius: 999, boxShadow: 'var(--shadow)',
  display: 'flex', alignItems: 'center', gap: 6,
};
const previewTopbarStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18,
};
const previewDotStyle: React.CSSProperties = {
  width: 8, height: 8, borderRadius: '50%',
};
const previewGreetingStyle: React.CSSProperties = {
  background: 'linear-gradient(100deg, var(--accent) 0%, var(--accent3) 100%)',
  borderRadius: 14, padding: '18px 20px', color: '#fff', marginBottom: 16,
};
const previewApptStyle: React.CSSProperties = {
  marginTop: 12, background: 'rgba(255,255,255,0.16)', borderRadius: 10,
  padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 9,
  fontSize: 11.5, fontWeight: 700,
};
const previewGridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14,
};
const previewTileStyle: React.CSSProperties = {
  background: 'var(--surface2)', borderRadius: 12, padding: '12px 8px', textAlign: 'center',
};
const previewTileValStyle: React.CSSProperties = {
  fontSize: 17, fontWeight: 800, color: 'var(--accent)',
};
const previewTileLblStyle: React.CSSProperties = {
  fontSize: 9.5, color: 'var(--text3)', marginTop: 2, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.03em',
};
const previewRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10,
  background: 'var(--surface2)', marginBottom: 8,
};
const previewRowIcStyle: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', flexShrink: 0,
};
const previewRowTxtStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: 'var(--text)',
};
const previewRowSubStyle: React.CSSProperties = {
  fontSize: 10.5, color: 'var(--text3)',
};

// Secciones genéricas
const sectionStyle: React.CSSProperties = { padding: '88px 0' };
const sectionHeadCenterStyle: React.CSSProperties = {
  maxWidth: 560, margin: '0 auto 48px', textAlign: 'center',
};
const sectionEyebrowStyle: React.CSSProperties = {
  fontSize: 12.5, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
  color: 'var(--accent3)', marginBottom: 10,
};
const sectionHeadH2Style: React.CSSProperties = {
  fontSize: 'clamp(26px, 3.2vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)',
};
const sectionHeadPStyle: React.CSSProperties = {
  marginTop: 12, fontSize: 15.5, color: 'var(--text2)', lineHeight: 1.6,
};

// Qué resuelve
const featuresGridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18,
};
const featureCardStyle: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)',
  padding: 24,
};
const featureIconStyle: React.CSSProperties = {
  width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center', marginBottom: 16,
};
const featureCardH3Style: React.CSSProperties = {
  fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 6,
};
const featureCardPStyle: React.CSSProperties = {
  fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.55,
};
const familyStripStyle: React.CSSProperties = {
  marginTop: 18, background: 'var(--purple2)', border: '1px solid #E1D9F5',
  borderRadius: 'var(--radius-card)', padding: '26px 30px', display: 'flex',
  alignItems: 'center', gap: 22, flexWrap: 'wrap',
};
const familyStripIcStyle: React.CSSProperties = {
  width: 52, height: 52, borderRadius: 14, background: 'var(--purple)', color: '#fff',
  display: 'grid', placeItems: 'center', flexShrink: 0,
};
const familyStripH3Style: React.CSSProperties = {
  fontSize: 16.5, fontWeight: 800, color: '#3D2E68', marginBottom: 4,
};
const familyStripPStyle: React.CSSProperties = {
  fontSize: 13.5, color: '#5B4A8A', maxWidth: '52ch',
};

// Planes
const sectionAltStyle: React.CSSProperties = {
  background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
};
const plansGridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18,
};
const planCardStyle: React.CSSProperties = {
  background: 'var(--bg)', border: '2px solid var(--border)', borderRadius: 'var(--radius-card)',
  padding: 26, display: 'flex', flexDirection: 'column', gap: 16, position: 'relative',
};
const planCardFeaturedStyle: React.CSSProperties = {
  borderColor: 'var(--purple)', background: 'var(--purple2)',
};
const planFeaturedTagStyle: React.CSSProperties = {
  position: 'absolute', top: -12, left: 24, background: 'var(--purple)', color: '#fff',
  fontSize: 10.5, fontWeight: 800, letterSpacing: '0.03em', textTransform: 'uppercase',
  padding: '5px 11px', borderRadius: 999,
};
const planNameStyle: React.CSSProperties = {
  fontSize: 12.5, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase',
};
const planPriceStyle: React.CSSProperties = {
  fontSize: 30, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em',
};
const planFeaturesStyle: React.CSSProperties = {
  listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10,
};
const planFeatureItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.4,
};
const planCtaGhostStyle: React.CSSProperties = { ...btnGhostStyle, width: '100%' };
const planCtaPrimaryStyle: React.CSSProperties = { ...btnPrimaryStyle, width: '100%' };
const planCtaFamilyStyle: React.CSSProperties = {
  ...btnBaseStyle, width: '100%', background: 'var(--purple)', color: '#fff',
};
const plansNoteStyle: React.CSSProperties = {
  textAlign: 'center', marginTop: 26, fontSize: 13, color: 'var(--text3)',
};

// CTA final
const finalCtaStyle: React.CSSProperties = {
  textAlign: 'center', padding: '96px 24px', maxWidth: 640, margin: '0 auto',
};
const finalCtaH2Style: React.CSSProperties = {
  fontSize: 'clamp(26px, 3.4vw, 38px)', fontWeight: 800, letterSpacing: '-0.02em',
};
const finalCtaPStyle: React.CSSProperties = {
  marginTop: 14, fontSize: 15.5, color: 'var(--text2)',
};

// Footer
const footerStyle: React.CSSProperties = {
  borderTop: '1px solid var(--border)', padding: '36px 24px',
};
const footerInnerStyle: React.CSSProperties = {
  maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center',
  justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
};
const footerBrandStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 9,
};
const footerBrandMarkStyle: React.CSSProperties = { ...brandMarkStyle, width: 26, height: 26, fontSize: 12 };
const footerBrandWordStyle: React.CSSProperties = { ...brandWordStyle, fontSize: 13 };
const footerTagStyle: React.CSSProperties = {
  fontSize: 12, color: 'var(--text3)', marginLeft: 4,
};
const footerLegalStyle: React.CSSProperties = {
  fontSize: 12, color: 'var(--text3)',
};
const footerLegalLinkStyle: React.CSSProperties = {
  color: 'var(--text3)', textDecoration: 'none',
};

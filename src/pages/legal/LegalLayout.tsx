import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Shell visual reutilizable para documentos legales (Términos, Privacidad).
 * Documento centrado con ancho de lectura cómodo, siguiendo los tokens de diseño.
 */
interface LegalLayoutProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, updated, children }: LegalLayoutProps) {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 16px 64px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, background: 'var(--accent)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontFamily: 'DM Serif Display, serif', fontSize: 16,
            }}>M</div>
            <span className="serif" style={{ fontSize: 20, color: 'var(--accent)' }}>Medicore</span>
          </div>
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-btn)', padding: '8px 14px',
              fontSize: 13, color: 'var(--text2)', fontFamily: 'inherit',
            }}
          >
            ← Volver
          </button>
        </div>

        {/* Document */}
        <article style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-sm)',
          padding: '40px clamp(20px, 5vw, 48px)',
        }}>
          <h1 className="serif" style={{ fontSize: 30, fontWeight: 400, marginBottom: 6 }}>{title}</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 28 }}>
            Última actualización: {updated}
          </p>
          <div className="legal-body" style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.7 }}>
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}

/** Sección con encabezado numerado, para reutilizar en ambos documentos. */
export function LegalSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 28 }}>
      <h2 className="serif" style={{ fontSize: 19, fontWeight: 400, marginBottom: 10 }}>{heading}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--text2)' }}>
        {children}
      </div>
    </section>
  );
}

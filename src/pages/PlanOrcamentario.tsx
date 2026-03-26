
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PlanOrcamentario = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    // Intersection Observer for reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('plan-visible');
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('.plan-reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Draw bar chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = 200 * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = '200px';
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      const W = rect.width, H = 200;
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
      const orcado = [6800, 7100, 7400, 7200, 7600, 7800];
      const realizado = [7050, 7320, 7180, 7450, 7680, 8100];
      const maxV = 9000;
      const padL = 40, padR = 12, padT = 10, padB = 28;
      const chartW = W - padL - padR;
      const chartH = H - padT - padB;
      const n = months.length;
      const grpW = chartW / n;
      const bw = grpW * 0.3;

      [0.25, 0.5, 0.75, 1].forEach((f) => {
        const y = padT + chartH * (1 - f);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.moveTo(padL, y);
        ctx.lineTo(W - padR, y);
        ctx.stroke();
        ctx.fillStyle = 'rgba(150,150,200,0.5)';
        ctx.font = '9px DM Sans, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText((maxV * f / 1000).toFixed(0) + 'k', padL - 4, y + 3);
      });

      months.forEach((m, i) => {
        const x = padL + i * grpW + grpW / 2;
        const horc = (orcado[i] / maxV) * chartH;
        ctx.fillStyle = 'rgba(51,51,255,0.25)';
        ctx.strokeStyle = 'rgba(51,51,255,0.5)';
        ctx.lineWidth = 1;
        const xo = x - bw - 2;
        ctx.beginPath();
        ctx.roundRect(xo, padT + chartH - horc, bw, horc, [3, 3, 0, 0]);
        ctx.fill();
        ctx.stroke();

        const hreal = (realizado[i] / maxV) * chartH;
        ctx.fillStyle = 'rgba(51,51,255,0.85)';
        ctx.strokeStyle = 'rgba(51,51,255,1)';
        const xr = x + 2;
        ctx.beginPath();
        ctx.roundRect(xr, padT + chartH - hreal, bw, hreal, [3, 3, 0, 0]);
        ctx.fill();
        ctx.stroke();

        const varPct = (realizado[i] - orcado[i]) / orcado[i];
        const dotColor = varPct >= 0 ? '#1A7A4A' : '#C04848';
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(xr + bw / 2, padT + chartH - hreal - 5, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(150,150,200,0.6)';
        ctx.font = '9px DM Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(m, x, H - 6);
      });
    };

    // Small delay to ensure layout
    const timer = setTimeout(draw, 200);
    window.addEventListener('resize', draw);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', draw);
    };
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="plan-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        
        .plan-page {
          font-family: 'DM Sans', sans-serif;
          background: #04040F;
          color: #FFFFFF;
          overflow-x: hidden;
          min-height: 100vh;
        }

        .plan-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 80px 80px;
          opacity: 0.7;
          pointer-events: none;
          z-index: 0;
        }

        .plan-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 20px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(4,4,15,0.92);
          backdrop-filter: blur(12px);
        }

        .plan-nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          font-size: 15px;
          letter-spacing: 0.02em;
          color: #FFFFFF;
          text-decoration: none;
        }

        .plan-rings { display: flex; align-items: center; gap: 0; }
        .plan-rings span {
          display: block;
          width: 14px; height: 14px;
          border-radius: 50%;
          border: 2px solid #3333FF;
          margin-right: -5px;
        }
        .plan-rings span:nth-child(2) { border-color: #1a1acc; }
        .plan-rings span:nth-child(3) { border-color: #0D0D9E; margin-right: 0; }

        .plan-nav-links {
          display: flex;
          gap: 32px;
          list-style: none;
          margin: 0; padding: 0;
        }
        .plan-nav-links a {
          color: #7777AA;
          text-decoration: none;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.04em;
          transition: color .2s;
        }
        .plan-nav-links a:hover { color: #FFFFFF; }

        .plan-hero {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 120px 48px 80px;
        }

        .plan-hero-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          color: #3333FF;
          text-transform: uppercase;
          margin-bottom: 28px;
        }

        .plan-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(52px, 7vw, 96px);
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
        }
        .plan-hero-title em {
          font-style: italic;
          color: #3333FF;
        }

        .plan-hero-sub {
          font-size: clamp(16px, 2vw, 20px);
          font-weight: 300;
          color: #7777AA;
          max-width: 520px;
          line-height: 1.6;
          margin-bottom: 56px;
        }

        .plan-hero-pills {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .plan-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: transform .2s, box-shadow .2s;
          color: #FFFFFF;
        }
        .plan-pill:hover { transform: translateY(-2px); }
        .plan-pill-essencial { background: #3333FF; }
        .plan-pill-pro { background: transparent; border: 1px solid rgba(255,255,255,0.3); }
        .plan-pill-pro:hover { border-color: rgba(255,255,255,0.6); }
        .plan-pill-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.6;
        }

        .plan-scroll-hint {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .plan-scroll-hint span {
          font-size: 11px;
          letter-spacing: 0.12em;
          color: #7777AA;
          text-transform: uppercase;
        }
        .plan-scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, #3333FF, transparent);
          animation: planScrollPulse 2s ease-in-out infinite;
        }

        .plan-product {
          position: relative;
          z-index: 1;
          padding: 100px 48px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .plan-product-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: start;
        }
        .plan-product-inner.plan-reverse { direction: rtl; }
        .plan-product-inner.plan-reverse > * { direction: ltr; }

        .plan-product-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 100px;
          margin-bottom: 24px;
        }
        .plan-tag-essencial {
          background: rgba(33,33,255,0.15);
          color: #8888FF;
          border: 1px solid rgba(33,33,255,0.3);
        }
        .plan-tag-pro {
          background: rgba(255,255,255,0.06);
          color: #7777AA;
          border: 1px solid rgba(255,255,255,0.12);
        }

        .plan-product-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(44px, 5vw, 72px);
          font-weight: 700;
          line-height: 1.0;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }
        .plan-product-name-accent { color: #3333FF; }

        .plan-product-full-name {
          font-size: 13px;
          color: #7777AA;
          letter-spacing: 0.04em;
          margin-bottom: 28px;
        }

        .plan-product-tagline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(18px, 2.2vw, 26px);
          font-style: italic;
          font-weight: 400;
          line-height: 1.4;
          color: rgba(255,255,255,0.85);
          padding-left: 20px;
          border-left: 2px solid #3333FF;
          margin-bottom: 36px;
        }

        .plan-product-desc {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.8;
          color: #7777AA;
        }

        .plan-product-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 16px;
          backdrop-filter: blur(8px);
          transition: border-color .3s, background .3s;
        }
        .plan-product-card:hover {
          border-color: rgba(33,33,255,0.3);
          background: rgba(33,33,255,0.04);
        }

        .plan-card-section-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #7777AA;
          margin-bottom: 20px;
        }

        .plan-features { display: flex; flex-direction: column; gap: 14px; }
        .plan-feature { display: flex; align-items: flex-start; gap: 12px; }
        .plan-feature-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #3333FF;
          margin-top: 8px;
          flex-shrink: 0;
        }
        .plan-feature-text {
          font-size: 14px;
          font-weight: 400;
          line-height: 1.6;
          color: rgba(255,255,255,0.75);
        }

        .plan-product-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }
        .plan-meta-item {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 16px;
        }
        .plan-meta-label {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #7777AA;
          margin-bottom: 6px;
        }
        .plan-meta-value {
          font-size: 14px;
          font-weight: 500;
          color: #FFFFFF;
        }
        .plan-meta-value.plan-blue { color: #3333FF; }

        .plan-separator {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px;
        }
        .plan-separator-line {
          height: 1px;
          background: linear-gradient(to right, transparent, #3333FF, transparent);
        }

        .plan-deco-num {
          font-family: 'Playfair Display', serif;
          font-size: 200px;
          font-weight: 700;
          color: rgba(51,51,255,0.06);
          position: absolute;
          top: 40px;
          right: 48px;
          line-height: 1;
          pointer-events: none;
          user-select: none;
        }

        /* Gantt section styles */
        .plan-grow { display: grid; grid-template-columns: 200px repeat(16,1fr); align-items: center; margin-bottom: 10px; }
        .plan-glabel { font-size: 12px; color: rgba(255,255,255,0.65); padding-right: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .plan-glabel.plan-phase { font-size: 10px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: #3333FF; margin-top: 16px; margin-bottom: 4px; }
        .plan-gbar { height: 16px; border-radius: 4px; }
        .plan-gcell { height: 18px; }

        /* Comparison */
        .plan-comparison {
          position: relative;
          z-index: 1;
          padding: 100px 48px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .plan-comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .plan-comp-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 36px;
          transition: border-color .3s;
        }
        .plan-comp-card:hover { border-color: rgba(33,33,255,0.4); }
        .plan-comp-card-name {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .plan-comp-card-track {
          font-size: 12px;
          color: #7777AA;
          margin-bottom: 28px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .plan-comp-items { display: flex; flex-direction: column; gap: 12px; }
        .plan-comp-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.7);
        }
        .plan-comp-check {
          width: 16px; height: 16px;
          border-radius: 50%;
          background: rgba(33,33,255,0.2);
          border: 1px solid rgba(33,33,255,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .plan-comp-check::after {
          content: '';
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #3333FF;
        }

        .plan-footer {
          position: relative;
          z-index: 1;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 40px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .plan-footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
        }
        .plan-footer-info { font-size: 12px; color: #7777AA; }
        .plan-footer-cta {
          font-size: 13px;
          color: #3333FF;
          text-decoration: none;
          border: 1px solid rgba(33,33,255,0.4);
          padding: 8px 20px;
          border-radius: 100px;
          transition: background .2s;
        }
        .plan-footer-cta:hover { background: rgba(33,33,255,0.1); }

        /* Animations */
        @keyframes planScrollPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        .plan-reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity .8s ease, transform .8s ease;
        }
        .plan-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .plan-reveal-delay-1 { transition-delay: .1s; }
        .plan-reveal-delay-2 { transition-delay: .2s; }

        @media (max-width: 768px) {
          .plan-nav { padding: 16px 24px; }
          .plan-nav-links { display: none; }
          .plan-hero { padding: 100px 24px 60px; }
          .plan-product { padding: 60px 24px; }
          .plan-product-inner { grid-template-columns: 1fr; gap: 40px; }
          .plan-product-inner.plan-reverse { direction: ltr; }
          .plan-comparison { padding: 60px 24px; }
          .plan-comparison-grid { grid-template-columns: 1fr; }
          .plan-footer { padding: 28px 24px; flex-direction: column; gap: 20px; text-align: center; }
          .plan-deco-num { display: none; }
          .plan-grow { grid-template-columns: 140px repeat(16,1fr); }
          .plan-glabel { font-size: 10px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="plan-nav">
        <Link to="/" className="plan-nav-brand">
          <div className="plan-rings">
            <span></span><span></span><span></span>
          </div>
          Ascalate
        </Link>
        <ul className="plan-nav-links">
          <li><a href="#essencial" onClick={(e) => handleSmoothScroll(e, 'essencial')}>Budget Essencial</a></li>
          <li><a href="#pro" onClick={(e) => handleSmoothScroll(e, 'pro')}>Budget Pro</a></li>
          <li><a href="#gantt" onClick={(e) => handleSmoothScroll(e, 'gantt')}>Processo</a></li>
          <li><a href="#dashboard" onClick={(e) => handleSmoothScroll(e, 'dashboard')}>Dashboard</a></li>
          <li><a href="#comparativo" onClick={(e) => handleSmoothScroll(e, 'comparativo')}>Comparativo</a></li>
          <li><Link to="/" style={{ color: '#7777AA', textDecoration: 'none', fontSize: 13 }}>ascalate.com.br</Link></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="plan-hero">
        <motion.p className="plan-hero-label" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
          Planejamento Orçamentário · Ascalate
        </motion.p>
        <motion.h1 className="plan-hero-title" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}>
          O orçamento certo<br />para cada <em>estágio</em>
        </motion.h1>
        <motion.p className="plan-hero-sub" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
          Dois produtos. Uma metodologia. Resultados que sustentam o crescimento.
        </motion.p>
        <motion.div className="plan-hero-pills" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.8 }}>
          <a href="#essencial" className="plan-pill plan-pill-essencial" onClick={(e) => handleSmoothScroll(e, 'essencial')}>
            <span className="plan-pill-dot"></span>
            Budget Essencial
          </a>
          <a href="#pro" className="plan-pill plan-pill-pro" onClick={(e) => handleSmoothScroll(e, 'pro')}>
            <span className="plan-pill-dot"></span>
            Budget Pro
          </a>
        </motion.div>
        <motion.div className="plan-scroll-hint" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8 }}>
          <span>Conheça</span>
          <div className="plan-scroll-line"></div>
        </motion.div>
      </section>

      {/* BUDGET ESSENCIAL */}
      <section className="plan-product" id="essencial">
        <div className="plan-deco-num">01</div>
        <div className="plan-product-inner plan-reveal">
          <div>
            <h2 className="plan-product-name">
              Budget<br /><span className="plan-product-name-accent">Essencial</span>
            </h2>
            <p className="plan-product-full-name">Ascalate Budget Essencial</p>
            <blockquote className="plan-product-tagline">
              Estruture o orçamento.<br />Escale o negócio.
            </blockquote>
            <p className="plan-product-desc">
              Para empresas que estão construindo seu processo orçamentário pela primeira vez — ou que querem profissionalizar o que já existe. Conduzimos todo o ciclo de Budget, do diagnóstico à aprovação, com metodologia de gestão de projetos e capacitação dos gestores envolvidos.
            </p>
          </div>

          <div>
            <div className="plan-product-card plan-reveal plan-reveal-delay-1">
              <p className="plan-card-section-label">O que está incluído</p>
              <div className="plan-features">
                {[
                  'Diagnóstico do processo orçamentário atual',
                  'Construção dos modelos e templates por área',
                  'Gestão PMO do ciclo completo com Gantt e Kanban',
                  'Consolidação da DRE, Fluxo de Caixa e CAPEX',
                  'Modelagem de cenários (pessimista, base e otimista)',
                  'Treinamento dos gestores para preenchimento e leitura',
                  'Apresentação e aprovação do orçamento com a liderança',
                ].map((text, i) => (
                  <div key={i} className="plan-feature">
                    <div className="plan-feature-dot"></div>
                    <span className="plan-feature-text">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="plan-product-meta plan-reveal plan-reveal-delay-2">
              <div className="plan-meta-item">
                <div className="plan-meta-label">Perfil</div>
                <div className="plan-meta-value">Empresas em estruturação</div>
              </div>
              <div className="plan-meta-item">
                <div className="plan-meta-label">Modalidade</div>
                <div className="plan-meta-value">Projeto + Mensalidade</div>
              </div>
              <div className="plan-meta-item">
                <div className="plan-meta-label">Ciclo</div>
                <div className="plan-meta-value">Ago – Dez</div>
              </div>
              <div className="plan-meta-item">
                <div className="plan-meta-label">Diferencial</div>
                <div className="plan-meta-value plan-blue">Estruturação + Capacitação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="plan-separator">
        <div className="plan-separator-line"></div>
      </div>

      {/* BUDGET PRO */}
      <section className="plan-product" id="pro">
        <div className="plan-deco-num">02</div>
        <div className="plan-product-inner plan-reverse plan-reveal">
          <div>
            <h2 className="plan-product-name">
              Budget<br /><span className="plan-product-name-accent">Pro</span>
            </h2>
            <p className="plan-product-full-name">Ascalate Budget Pro</p>
            <blockquote className="plan-product-tagline">
              Gestão orçamentária de alto desempenho para empresas que não podem errar.
            </blockquote>
            <p className="plan-product-desc">
              Para operações estabelecidas que precisam de um parceiro para conduzir e governar o processo orçamentário com rigor e consistência. Atuamos como PMO externo do Budget — integrando áreas, consolidando peças, modelando cenários e garantindo entrega no prazo com alinhamento estratégico.
            </p>
          </div>

          <div>
            <div className="plan-product-card plan-reveal plan-reveal-delay-1">
              <p className="plan-card-section-label">O que está incluído</p>
              <div className="plan-features">
                {[
                  'Diagnóstico e mapeamento AS IS / TO BE do processo',
                  'Revisão dos modelos orçamentários existentes',
                  'Integração com ERP (SAP, TOTVS e similares)',
                  'PMO externo completo: Gantt, Kanban e relatórios de etapa',
                  'Consolidação multi-área com controles de governança',
                  'Modelagem de cenários com análise de sensibilidade',
                  'Apresentação executiva para diretoria e board',
                ].map((text, i) => (
                  <div key={i} className="plan-feature">
                    <div className="plan-feature-dot"></div>
                    <span className="plan-feature-text">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="plan-product-meta plan-reveal plan-reveal-delay-2">
              <div className="plan-meta-item">
                <div className="plan-meta-label">Perfil</div>
                <div className="plan-meta-value">Operações estabelecidas</div>
              </div>
              <div className="plan-meta-item">
                <div className="plan-meta-label">Modalidade</div>
                <div className="plan-meta-value">Projeto + Mensalidade</div>
              </div>
              <div className="plan-meta-item">
                <div className="plan-meta-label">Ciclo</div>
                <div className="plan-meta-value">Ago – Dez</div>
              </div>
              <div className="plan-meta-item">
                <div className="plan-meta-label">Diferencial</div>
                <div className="plan-meta-value plan-blue">Governança + PMO externo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GANTT */}
      <section id="gantt" style={{ position: 'relative', zIndex: 1, padding: '100px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="plan-reveal" style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: '#3333FF', marginBottom: 14 }}>Metodologia PMO</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 14 }}>
            Ciclo orçamentário<br />como projeto <em style={{ color: '#3333FF' }}>gerenciado</em>
          </h2>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#7777AA', maxWidth: 560, lineHeight: 1.7 }}>Cada etapa tem prazo, responsável e entregável definido. Nada cai no esquecimento.</p>
        </div>

        <div className="plan-reveal" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '32px 36px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3333FF' }}></div>
            <span style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#7777AA' }}>Gantt — Ciclo Budget (Ago–Dez)</span>
          </div>

          <div style={{ minWidth: 700 }}>
            {/* Month headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(16,1fr)', gap: 0, marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: '#555588', padding: '0 0 8px', letterSpacing: '.06em', textTransform: 'uppercase' }}>Atividade</div>
              <div style={{ gridColumn: '2/6', textAlign: 'center', fontSize: 10, fontWeight: 500, color: '#7777AA', borderLeft: '1px solid rgba(255,255,255,0.06)', padding: '4px 0' }}>Agosto</div>
              <div style={{ gridColumn: '6/10', textAlign: 'center', fontSize: 10, fontWeight: 500, color: '#7777AA', borderLeft: '1px solid rgba(255,255,255,0.06)', padding: '4px 0' }}>Outubro</div>
              <div style={{ gridColumn: '10/14', textAlign: 'center', fontSize: 10, fontWeight: 500, color: '#7777AA', borderLeft: '1px solid rgba(255,255,255,0.06)', padding: '4px 0' }}>Novembro</div>
              <div style={{ gridColumn: '14/17', textAlign: 'center', fontSize: 10, fontWeight: 500, color: '#7777AA', borderLeft: '1px solid rgba(255,255,255,0.06)', padding: '4px 0' }}>Dezembro</div>
            </div>

            {/* Week ticks */}
            <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(16,1fr)', marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 6 }}>
              <div></div>
              {['S1','S2','S3','S4','S1','S2','S3','S4','S1','S2','S3','S4','S1','S2','S3','S4'].slice(0,15).map((s, i) => (
                <div key={i} style={{ fontSize: 9, color: '#444466', textAlign: 'center' }}>{s}</div>
              ))}
            </div>

            {/* Phase 1 */}
            <div className="plan-grow"><div className="plan-glabel plan-phase">Fase 1 — Diagnóstico</div></div>
            <div className="plan-grow">
              <div className="plan-glabel">Kick-off & escopo</div>
              <div className="plan-gcell"></div>
              <div className="plan-gbar" style={{ background: 'rgba(51,51,255,0.7)', gridColumn: 'span 2' }}></div>
              <div className="plan-gcell" style={{ gridColumn: 'span 13' }}></div>
            </div>
            <div className="plan-grow">
              <div className="plan-glabel">Mapeamento estrutura</div>
              <div className="plan-gcell" style={{ gridColumn: 'span 2' }}></div>
              <div className="plan-gbar" style={{ background: 'rgba(51,51,255,0.7)', gridColumn: 'span 2' }}></div>
              <div className="plan-gcell" style={{ gridColumn: 'span 12' }}></div>
            </div>
            <div className="plan-grow">
              <div className="plan-glabel">Premissas & modelos</div>
              <div className="plan-gcell" style={{ gridColumn: 'span 2' }}></div>
              <div className="plan-gbar" style={{ background: 'rgba(51,51,255,0.8)', gridColumn: 'span 3' }}></div>
              <div className="plan-gcell" style={{ gridColumn: 'span 11' }}></div>
            </div>

            {/* Phase 2 */}
            <div className="plan-grow"><div className="plan-glabel plan-phase" style={{ marginTop: 12 }}>Fase 2 — Budget PMO</div></div>
            <div className="plan-grow">
              <div className="plan-glabel">Lançamento às áreas</div>
              <div className="plan-gcell" style={{ gridColumn: 'span 5' }}></div>
              <div className="plan-gbar" style={{ background: 'rgba(180,120,0,0.75)', gridColumn: 'span 1' }}></div>
              <div className="plan-gcell" style={{ gridColumn: 'span 10' }}></div>
            </div>
            <div className="plan-grow">
              <div className="plan-glabel">Suporte & Kanban semanal</div>
              <div className="plan-gcell" style={{ gridColumn: 'span 5' }}></div>
              <div className="plan-gbar" style={{ background: 'rgba(180,120,0,0.75)', gridColumn: 'span 6' }}></div>
              <div className="plan-gcell" style={{ gridColumn: 'span 5' }}></div>
            </div>
            <div className="plan-grow">
              <div className="plan-glabel">Consolidação & cenários</div>
              <div className="plan-gcell" style={{ gridColumn: 'span 9' }}></div>
              <div className="plan-gbar" style={{ background: 'rgba(180,120,0,0.9)', gridColumn: 'span 3' }}></div>
              <div className="plan-gcell" style={{ gridColumn: 'span 4' }}></div>
            </div>

            {/* Phase 3 */}
            <div className="plan-grow"><div className="plan-glabel plan-phase" style={{ marginTop: 12 }}>Fase 3 — Aprovação</div></div>
            <div className="plan-grow">
              <div className="plan-glabel">Apresentação executiva</div>
              <div className="plan-gcell" style={{ gridColumn: 'span 12' }}></div>
              <div className="plan-gbar" style={{ background: 'rgba(26,122,74,0.8)', gridColumn: 'span 2' }}></div>
              <div className="plan-gcell" style={{ gridColumn: 'span 2' }}></div>
            </div>
            <div className="plan-grow">
              <div className="plan-glabel">Aprovação & Baseline</div>
              <div className="plan-gcell" style={{ gridColumn: 'span 13' }}></div>
              <div className="plan-gbar" style={{ background: 'rgba(26,122,74,0.9)', gridColumn: 'span 2' }}></div>
              <div className="plan-gcell" style={{ gridColumn: 'span 1' }}></div>
            </div>
            <div className="plan-grow">
              <div className="plan-glabel">Config. ferramentas F4</div>
              <div className="plan-gcell" style={{ gridColumn: 'span 14' }}></div>
              <div className="plan-gbar" style={{ background: 'rgba(26,122,74,0.7)', gridColumn: 'span 2' }}></div>
            </div>

            {/* Milestones legend */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 16, paddingTop: 14, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: '#7777AA', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ display: 'inline-block', width: 28, height: 3, background: 'rgba(51,51,255,0.7)', borderRadius: 2 }}></span>Fase 1 — Diagnóstico</span>
              <span style={{ fontSize: 11, color: '#7777AA', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ display: 'inline-block', width: 28, height: 3, background: 'rgba(180,120,0,0.8)', borderRadius: 2 }}></span>Fase 2 — PMO</span>
              <span style={{ fontSize: 11, color: '#7777AA', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ display: 'inline-block', width: 28, height: 3, background: 'rgba(26,122,74,0.85)', borderRadius: 2 }}></span>Fase 3 — Aprovação</span>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD */}
      <section id="dashboard" style={{ position: 'relative', zIndex: 1, padding: '0 48px 100px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="plan-reveal" style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: '#3333FF', marginBottom: 14 }}>Fase 4 · Retainer mensal</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 14 }}>
            Acompanhamento<br /><em style={{ color: '#3333FF' }}>Orçado × Realizado</em>
          </h2>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#7777AA', maxWidth: 560, lineHeight: 1.7 }}>Dashboard atualizado todo mês. Desvios identificados, Forecast revisado, decisão na hora certa.</p>
        </div>

        <div className="plan-reveal" style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
          {/* Top bar */}
          <div style={{ background: '#111124', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3333FF' }}></div>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>Dashboard · Orçado x Realizado</span>
              <span style={{ fontSize: 10, color: '#555588', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 100 }}>Acumulado Jan–Jun 2025</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: '#555588' }}>Atualizado em 25/06/2025</span>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1A7A4A' }}></div>
            </div>
          </div>

          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {[
              { label: 'Receita Realizada', value: 'R$42,8M', delta: '▲ +3,2%', deltaColor: '#1A7A4A' },
              { label: 'Custos Realizados', value: 'R$15,0M', delta: '▲ +2,1%', deltaColor: '#C04848' },
              { label: 'EBITDA Realizado', value: 'R$15,7M', delta: '▲ +4,7%', deltaColor: '#1A7A4A' },
            ].map((kpi, i) => (
              <div key={i} style={{ background: '#0D0D1A', padding: '20px 24px' }}>
                <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#555588', marginBottom: 8 }}>{kpi.label}</div>
                <div style={{ fontSize: 26, fontWeight: 500, color: '#FFFFFF', marginBottom: 4 }}>{kpi.value}</div>
                <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: kpi.deltaColor, fontWeight: 500 }}>{kpi.delta}</span>
                  <span style={{ color: '#555588' }}>vs orçado</span>
                </div>
              </div>
            ))}
            <div style={{ background: '#0D0D1A', padding: '20px 24px' }}>
              <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#555588', marginBottom: 8 }}>Aderência ao Budget</div>
              <div style={{ fontSize: 26, fontWeight: 500, color: '#3333FF', marginBottom: 4 }}>94,2%</div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
                <div style={{ height: '100%', width: '94.2%', background: '#3333FF', borderRadius: 2 }}></div>
              </div>
            </div>
          </div>

          {/* Charts area */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 1, background: 'rgba(255,255,255,0.04)', minHeight: 300 }}>
            <div style={{ background: '#0D0D1A', padding: '24px 28px' }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                Receita Mensal — Orçado × Realizado <span style={{ color: '#555588', fontWeight: 400 }}>(R$ mil)</span>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <span style={{ fontSize: 10, color: '#555588', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'rgba(51,51,255,0.3)', border: '1px solid rgba(51,51,255,0.6)' }}></span>Orçado
                </span>
                <span style={{ fontSize: 10, color: '#555588', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#3333FF' }}></span>Realizado
                </span>
              </div>
              <canvas ref={canvasRef} style={{ width: '100%', height: 200, display: 'block' }}></canvas>
            </div>

            {/* Variance table */}
            <div style={{ background: '#0D0D1A', padding: '24px 24px' }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 18 }}>Análise de Desvios por Linha</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 10, color: '#555588' }}>Linha</span>
                  <span style={{ fontSize: 10, color: '#555588', textAlign: 'right' }}>Δ R$</span>
                  <span style={{ fontSize: 10, color: '#555588', textAlign: 'right' }}>Δ %</span>
                </div>
                {[
                  { name: 'Receita Bruta', dr: '+1,3M', dp: '+3,2%', color: '#1A7A4A' },
                  { name: 'Custos Totais', dr: '+0,3M', dp: '+2,1%', color: '#C04848' },
                  { name: 'Margem Bruta', dr: '+1,0M', dp: '+3,7%', color: '#1A7A4A' },
                  { name: 'Desp. Operacionais', dr: '+0,3M', dp: '+2,5%', color: '#C04848' },
                  { name: 'EBITDA', dr: '+0,7M', dp: '+4,7%', color: '#1A7A4A' },
                  { name: 'Resultado Líquido', dr: '+0,4M', dp: '+4,0%', color: '#1A7A4A' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, padding: '9px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{row.name}</span>
                    <span style={{ fontSize: 12, color: row.color, textAlign: 'right', fontWeight: 500 }}>{row.dr}</span>
                    <span style={{ fontSize: 12, color: row.color, textAlign: 'right', fontWeight: 500 }}>{row.dp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Forecast strip */}
          <div style={{ background: '#111124', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3333FF' }}></div>
              <span style={{ fontSize: 11, color: '#7777AA' }}>Forecast revisado Jun/2025</span>
            </div>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Receita ano: <strong style={{ color: '#FFFFFF' }}>R$87,4M</strong> <span style={{ color: '#1A7A4A', fontSize: 11 }}>▲ +1,8%</span></span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>EBITDA ano: <strong style={{ color: '#FFFFFF' }}>R$31,4M</strong> <span style={{ color: '#1A7A4A', fontSize: 11 }}>▲ +4,7%</span></span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Margem EBITDA: <strong style={{ color: '#FFFFFF' }}>36,0%</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARATIVO */}
      <section className="plan-comparison" id="comparativo">
        <div className="plan-reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: '#3333FF', marginBottom: 16 }}>Qual é o certo para você?</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, lineHeight: 1.1 }}>Dois produtos.<br />Uma escolha clara.</h2>
        </div>

        <div className="plan-comparison-grid">
          <div className="plan-comp-card plan-reveal plan-reveal-delay-1">
            <div className="plan-comp-card-name" style={{ color: '#8888FF' }}>Budget Essencial</div>
            <div className="plan-comp-card-track">Empresas em estruturação</div>
            <div className="plan-comp-items">
              {[
                'Processo orçamentário em estruturação ou inexistente',
                'Gestores sem cultura formal de orçamento',
                'Templates construídos do zero pela Ascalate',
                'Treinamento e capacitação da equipe interna',
                'Integração simples: Excel e Google Sheets',
                'Foco em autonomia progressiva',
              ].map((item, i) => (
                <div key={i} className="plan-comp-item">
                  <div className="plan-comp-check"></div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="plan-comp-card plan-reveal plan-reveal-delay-2" style={{ borderColor: 'rgba(33,33,255,0.25)' }}>
            <div className="plan-comp-card-name" style={{ color: '#FFFFFF' }}>Budget Pro</div>
            <div className="plan-comp-card-track">Operações estabelecidas</div>
            <div className="plan-comp-items">
              {[
                'Processo existente com gaps de governança',
                'Múltiplas áreas e centros de custo envolvidos',
                'Revisão e otimização dos modelos existentes',
                'Integração com ERP (SAP, TOTVS e similares)',
                'Relatórios executivos para board e diretoria',
                'Foco em controle e resultado',
              ].map((item, i) => (
                <div key={i} className="plan-comp-item">
                  <div className="plan-comp-check"></div>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="plan-reveal" style={{ marginTop: 20, background: 'rgba(51,51,255,0.08)', border: '1px solid rgba(33,33,255,0.2)', borderRadius: 16, padding: '24px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3333FF', marginBottom: 10 }}>Incluído nos dois produtos</p>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
            Acompanhamento mensal Orçado x Realizado · Dashboard atualizado · Análise de desvios · Forecast revisado · Reunião gerencial mensal
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="plan-footer">
        <div className="plan-footer-brand">
          <div className="plan-rings"><span></span><span></span><span></span></div>
          Ascalate Business Consulting
        </div>
        <p className="plan-footer-info">Goiânia, Goiás · daniel@ascalate.com.br · (62) 93618-0447</p>
        <Link to="/" className="plan-footer-cta">ascalate.com.br</Link>
      </footer>
    </div>
  );
};

export default PlanOrcamentario;

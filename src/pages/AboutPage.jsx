import { CheckCircle2, CircleDollarSign, HandCoins, ShieldCheck, Target, Users } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

function AboutPage() {
  const { investmentPlans } = useAppContext()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <section className="page-grid about-page" style={{ gap: '2rem' }}>
      {/* Hero Header */}
      <div
        className="glass-card about-hero"
        style={{
          padding: '2rem',
          borderRadius: '24px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(18, 24, 18, 0.96) 0%, rgba(30, 44, 30, 0.85) 100%)'
            : 'radial-gradient(ellipse at 15% 15%, rgba(132, 169, 90, 0.18) 0%, transparent 45%), linear-gradient(180deg, #ffffff 0%, #f4f8f2 60%, #e6f0e0 100%)',
          border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.3)',
          boxShadow: isDark ? '0 16px 40px rgba(0, 0, 0, 0.6)' : '0 10px 30px rgba(94, 126, 55, 0.12)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            background: isDark ? 'rgba(132, 169, 90, 0.2)' : 'rgba(94, 126, 55, 0.12)',
            color: isDark ? '#9bc268' : '#5e7e37',
            border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.25)',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          About Horizoneinvest
        </span>
        <h2 className="page-title" style={{ margin: '0 0 0.5rem 0', fontSize: '1.9rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14' }}>
          Your Trusted Ecosystem for Structured Online Investing
        </h2>
        <p className="muted" style={{ margin: 0, fontSize: '0.98rem', lineHeight: 1.65, color: isDark ? '#9ca899' : '#526352', maxWidth: '820px' }}>
          Horizoneinvest is designed to give users a clear path from choosing plans to tracking earnings,
          managing referrals, and withdrawing funds. The platform combines a simple user experience with
          transparent investment data so users always understand what they are doing.
        </p>
      </div>

      {/* Mission & How Platform Works */}
      <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <article
          className="glass-card about-card"
          style={{
            padding: '1.8rem',
            borderRadius: '24px',
            background: isDark ? 'rgba(18, 24, 18, 0.92)' : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 248, 241, 0.94) 100%)',
            border: isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.28)',
            boxShadow: isDark ? '0 12px 32px rgba(0, 0, 0, 0.5)' : '0 10px 25px rgba(94, 126, 55, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #5e7e37 0%, #7a9f4c 100%)', color: '#ffffff', display: 'grid', placeItems: 'center' }}>
              <Target size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14' }}>
              Project Mission
            </h3>
          </div>
          <p className="muted" style={{ fontSize: '0.92rem', lineHeight: 1.6, color: isDark ? '#9ca899' : '#526352', margin: '0 0 1rem 0' }}>
            The mission is to make digital investing easier, more transparent, and more actionable for every
            user. Instead of confusing dashboards, Horizoneinvest focuses on clear numbers and guided actions.
          </p>
          <ul className="about-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0, margin: 0, listStyle: 'none' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#233023' }}>
              <CheckCircle2 size={16} style={{ color: isDark ? '#9bc268' : '#5e7e37', flexShrink: 0 }} />
              Easy onboarding with secure login and persistent sessions
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#233023' }}>
              <CheckCircle2 size={16} style={{ color: isDark ? '#9bc268' : '#5e7e37', flexShrink: 0 }} />
              Live tracking for deposits, investments, earnings, and withdrawals
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#233023' }}>
              <CheckCircle2 size={16} style={{ color: isDark ? '#9bc268' : '#5e7e37', flexShrink: 0 }} />
              Clear referral structure for network-based earning opportunities
            </li>
          </ul>
        </article>

        <article
          className="glass-card about-card"
          style={{
            padding: '1.8rem',
            borderRadius: '24px',
            background: isDark ? 'rgba(18, 24, 18, 0.92)' : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 248, 241, 0.94) 100%)',
            border: isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.28)',
            boxShadow: isDark ? '0 12px 32px rgba(0, 0, 0, 0.5)' : '0 10px 25px rgba(94, 126, 55, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #386b54 0%, #529677 100%)', color: '#ffffff', display: 'grid', placeItems: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14' }}>
              How The Platform Works
            </h3>
          </div>
          <ol className="about-steps" style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', paddingLeft: '1.2rem', margin: 0, fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#233023' }}>
            <li>
              <strong>Create account:</strong> register, complete your profile, and access your dashboard.
            </li>
            <li>
              <strong>Fund wallet:</strong> submit a deposit request through available payment methods.
            </li>
            <li>
              <strong>Choose plan:</strong> pick the plan that matches your amount and duration goals.
            </li>
            <li>
              <strong>Track performance:</strong> monitor progress, accrued earnings, and maturity timeline.
            </li>
            <li>
              <strong>Withdraw earnings:</strong> transfer available earnings to wallet and request withdrawals.
            </li>
          </ol>
        </article>
      </div>

      {/* Main Ecosystem & Investment Verticals (Side-by-Side Zig-Zag Layout) */}
      <div className="glass-card about-section" style={{ padding: '2rem', borderRadius: '24px' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: isDark ? '#f0f4ef' : '#141e14', letterSpacing: '-0.02em' }}>
            Our Ecosystem & Investment Verticals
          </h3>
          <p className="muted" style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.65, color: isDark ? '#9ca899' : '#526352', maxWidth: '880px' }}>
            At Horizoneinvest, our strength lies in our diversified investment ecosystem. We don’t just rely on a single asset class; instead, we strategically allocate our investors' capital across three distinct, highly profitable, and sustainable verticals. This multi-sector approach ensures that our portfolio remains resilient against market volatility while generating consistent, high-yield returns.
          </p>
        </div>

        <div className="verticals-grid" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          {/* Vertical 1: Image Left, Text Right */}
          <article
            className="glass-card zig-zag-card"
            style={{
              borderRadius: '24px',
              background: isDark ? 'rgba(18, 24, 18, 0.92)' : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 248, 241, 0.94) 100%)',
              border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.28)',
              boxShadow: isDark ? '0 14px 36px rgba(0, 0, 0, 0.5)' : '0 10px 28px rgba(94, 126, 55, 0.12)',
            }}
          >
            <div className="zig-zag-image" style={{ borderRadius: '20px', overflow: 'hidden', height: '340px', position: 'relative', border: isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.25)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' }}>
              <img src="/images/worker_site.png" alt="Industrial Infrastructure" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.85) 100%)', padding: '1.5rem 1.2rem', display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 12px', borderRadius: '999px', background: 'rgba(94, 126, 55, 0.9)', color: '#ffffff', backdropFilter: 'blur(10px)' }}>
                  Infrastructure Sector
                </span>
              </div>
            </div>

            <div className="zig-zag-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'linear-gradient(135deg, #5e7e37 0%, #7a9f4c 100%)', color: '#ffffff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Target size={22} />
                </div>
                <h4 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14', letterSpacing: '-0.01em' }}>
                  Industrial & Real Estate Infrastructure
                </h4>
              </div>
              <p className="muted" style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.65, color: isDark ? '#9ca899' : '#526352' }}>
                Real-world assets form the bedrock of our stable investment strategy. We actively deploy capital into large-scale construction projects, commercial real estate developments, and essential public infrastructure. By participating in these physical, tangible projects globally, we bridge the gap between digital investments and real-world value creation.
              </p>
              <ul className="about-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0, margin: 0, listStyle: 'none' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#233023' }}>
                  <CheckCircle2 size={16} style={{ color: isDark ? '#9bc268' : '#5e7e37', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: isDark ? '#f0f4ef' : '#141e14' }}>Tangible Asset Backing:</strong> Investments are secured against physical properties and infrastructure, reducing downside risk.
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#233023' }}>
                  <CheckCircle2 size={16} style={{ color: isDark ? '#9bc268' : '#5e7e37', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: isDark ? '#f0f4ef' : '#141e14' }}>Long-Term Appreciation:</strong> Commercial real estate historically provides excellent inflation hedging and steady capital appreciation.
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#233023' }}>
                  <CheckCircle2 size={16} style={{ color: isDark ? '#9bc268' : '#5e7e37', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: isDark ? '#f0f4ef' : '#141e14' }}>Cash Flow Generation:</strong> Revenue streams from commercial leases and completed development sales fuel continuous daily returns.
                  </div>
                </li>
              </ul>
            </div>
          </article>

          {/* Vertical 2: Text Left, Image Right (REVERSED ZIG-ZAG) */}
          <article
            className="glass-card zig-zag-card reverse"
            style={{
              borderRadius: '24px',
              background: isDark ? 'rgba(18, 24, 18, 0.92)' : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 248, 241, 0.94) 100%)',
              border: isDark ? '1px solid rgba(74, 118, 96, 0.35)' : '1px solid rgba(54, 100, 78, 0.28)',
              boxShadow: isDark ? '0 14px 36px rgba(0, 0, 0, 0.5)' : '0 10px 28px rgba(54, 100, 78, 0.12)',
            }}
          >
            <div className="zig-zag-image" style={{ borderRadius: '20px', overflow: 'hidden', height: '340px', position: 'relative', border: isDark ? '1px solid rgba(74, 118, 96, 0.3)' : '1px solid rgba(54, 100, 78, 0.25)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' }}>
              <img src="/images/crypto_trading.png" alt="Crypto Trading" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.85) 100%)', padding: '1.5rem 1.2rem', display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 12px', borderRadius: '999px', background: 'rgba(56, 107, 84, 0.9)', color: '#ffffff', backdropFilter: 'blur(10px)' }}>
                  Quantitative Trading Desk
                </span>
              </div>
            </div>

            <div className="zig-zag-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'linear-gradient(135deg, #386b54 0%, #529677 100%)', color: '#ffffff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <CircleDollarSign size={22} />
                </div>
                <h4 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14', letterSpacing: '-0.01em' }}>
                  Quantitative Crypto Trading
                </h4>
              </div>
              <p className="muted" style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.65, color: isDark ? '#9ca899' : '#526352' }}>
                The cryptocurrency market presents unparalleled opportunities for aggressive growth. Our dedicated quantitative trading desk utilizes proprietary algorithms, AI-driven market analysis, and high-frequency trading (HFT) bots to exploit market inefficiencies across top-tier digital assets (Bitcoin, Ethereum, etc.) 24/7.
              </p>
              <ul className="about-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0, margin: 0, listStyle: 'none' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#233023' }}>
                  <CheckCircle2 size={16} style={{ color: isDark ? '#7ab899' : '#2d5a46', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: isDark ? '#f0f4ef' : '#141e14' }}>Algorithmic Precision:</strong> Removing emotion from trading, our systems execute thousands of micro-trades daily to capture small, consistent profit margins.
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#233023' }}>
                  <CheckCircle2 size={16} style={{ color: isDark ? '#7ab899' : '#2d5a46', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: isDark ? '#f0f4ef' : '#141e14' }}>Market-Neutral Strategies:</strong> Utilizing arbitrage and statistical arbitrage, we generate profits regardless of whether the market is trending up or down.
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#233023' }}>
                  <CheckCircle2 size={16} style={{ color: isDark ? '#7ab899' : '#2d5a46', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: isDark ? '#f0f4ef' : '#141e14' }}>High Liquidity & Scalability:</strong> Crypto markets never sleep, allowing us to compound earnings daily and maintain optimal liquidity for investor withdrawals.
                  </div>
                </li>
              </ul>
            </div>
          </article>

          {/* Vertical 3: Image Left, Text Right */}
          <article
            className="glass-card zig-zag-card"
            style={{
              borderRadius: '24px',
              background: isDark ? 'rgba(18, 24, 18, 0.92)' : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 248, 241, 0.94) 100%)',
              border: isDark ? '1px solid rgba(180, 150, 70, 0.35)' : '1px solid rgba(140, 110, 40, 0.28)',
              boxShadow: isDark ? '0 14px 36px rgba(0, 0, 0, 0.5)' : '0 10px 28px rgba(140, 110, 40, 0.12)',
            }}
          >
            <div className="zig-zag-image" style={{ borderRadius: '20px', overflow: 'hidden', height: '340px', position: 'relative', border: isDark ? '1px solid rgba(180, 150, 70, 0.3)' : '1px solid rgba(140, 110, 40, 0.25)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' }}>
              <img src="/images/solar_energy.png" alt="Solar Energy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.85) 100%)', padding: '1.5rem 1.2rem', display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 12px', borderRadius: '999px', background: 'rgba(140, 110, 40, 0.9)', color: '#ffffff', backdropFilter: 'blur(10px)' }}>
                  Green Energy Sector
                </span>
              </div>
            </div>

            <div className="zig-zag-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'linear-gradient(135deg, #8c6e28 0%, #b89438 100%)', color: '#ffffff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={22} />
                </div>
                <h4 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14', letterSpacing: '-0.01em' }}>
                  Renewable Solar Energy
                </h4>
              </div>
              <p className="muted" style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.65, color: isDark ? '#9ca899' : '#526352' }}>
                We believe the most profitable investments are those that build a better future. By allocating substantial capital toward the development and expansion of utility-scale solar farms globally, we tap into a heavily incentivized, rapidly growing market. Renewable energy provides incredibly stable, predictable yields over decadal timelines.
              </p>
              <ul className="about-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0, margin: 0, listStyle: 'none' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#233023' }}>
                  <CheckCircle2 size={16} style={{ color: isDark ? '#d4b055' : '#8c6e28', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: isDark ? '#f0f4ef' : '#141e14' }}>Government Incentives & Subsidies:</strong> Benefitting from global green-energy initiatives, tax credits, and carbon offset programs.
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#233023' }}>
                  <CheckCircle2 size={16} style={{ color: isDark ? '#d4b055' : '#8c6e28', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: isDark ? '#f0f4ef' : '#141e14' }}>Power Purchase Agreements (PPAs):</strong> Ensuring guaranteed revenue through long-term contracts to supply generated electricity to governments and heavy industries.
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#233023' }}>
                  <CheckCircle2 size={16} style={{ color: isDark ? '#d4b055' : '#8c6e28', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: isDark ? '#f0f4ef' : '#141e14' }}>Sustainable ESG Impact:</strong> Offering our investors a way to earn substantial passive income while directly contributing to the reduction of global carbon footprints.
                  </div>
                </li>
              </ul>
            </div>
          </article>

        </div>
      </div>

      {/* Available Investment Plans */}
      <div className="glass-card about-section" style={{ padding: '2rem', borderRadius: '24px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: isDark ? '#f0f4ef' : '#141e14' }}>
          Available Investment Plans
        </h3>
        <p className="muted" style={{ margin: '0 0 1.5rem 0', fontSize: '0.92rem', color: isDark ? '#9ca899' : '#526352' }}>
          Real-time snapshot of active capital growth strategies configured on our platform.
        </p>

        <div className="about-plan-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {investmentPlans.length ? (
            investmentPlans.map((plan) => (
              <article
                key={plan.id}
                className="about-plan-card"
                style={{
                  padding: '1.3rem',
                  borderRadius: '18px',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                  border: isDark ? '1px solid rgba(132, 169, 90, 0.25)' : '1px solid rgba(122, 159, 76, 0.22)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <CircleDollarSign size={18} style={{ color: isDark ? '#9bc268' : '#5e7e37' }} />
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14' }}>{plan.name}</h4>
                </div>
                <p className="muted small" style={{ margin: 0, fontSize: '0.84rem' }}>
                  Daily Return: <strong style={{ color: isDark ? '#9bc268' : '#5e7e37' }}>{plan.dailyReturn}%</strong> | Total: <strong style={{ color: isDark ? '#9bc268' : '#5e7e37' }}>{plan.totalReturn}%</strong>
                </p>
                <p className="muted small" style={{ margin: 0, fontSize: '0.84rem' }}>
                  Amount Range: <strong>${plan.minAmount}</strong> to <strong>{plan.maxAmount === null ? 'Unlimited' : `$${plan.maxAmount}`}</strong>
                </p>
                <p className="muted small" style={{ margin: 0, fontSize: '0.84rem' }}>
                  Duration: <strong>{plan.durationDays} days</strong>
                </p>
              </article>
            ))
          ) : (
            <p className="muted">No plans are available yet.</p>
          )}
        </div>
      </div>

      {/* Referral & Risk Note */}
      <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <article
          className="glass-card about-card"
          style={{
            padding: '1.8rem',
            borderRadius: '24px',
            background: isDark ? 'rgba(18, 24, 18, 0.92)' : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 248, 241, 0.94) 100%)',
            border: isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.28)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #8c6e28 0%, #b89438 100%)', color: '#ffffff', display: 'grid', placeItems: 'center' }}>
              <Users size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14' }}>
              Referral & Community Growth
            </h3>
          </div>
          <p className="muted" style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6, color: isDark ? '#9ca899' : '#526352' }}>
            Users can grow earnings through referrals. The referral tree and commission structure pages allow
            users to see their network, track levels, and review referral-based revenue clearly.
          </p>
        </article>

        <article
          className="glass-card about-card"
          style={{
            padding: '1.8rem',
            borderRadius: '24px',
            background: isDark ? 'rgba(18, 24, 18, 0.92)' : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 248, 241, 0.94) 100%)',
            border: isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.28)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #a84255 0%, #c85a70 100%)', color: '#ffffff', display: 'grid', placeItems: 'center' }}>
              <HandCoins size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14' }}>
              Important Note
            </h3>
          </div>
          <p className="muted" style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6, color: isDark ? '#9ca899' : '#526352' }}>
            All investment activities involve risk. Users should invest responsibly, review plan conditions
            before investing, and use only funds they can afford to manage with market uncertainty.
          </p>
        </article>
      </div>
    </section>
  )
}

export default AboutPage

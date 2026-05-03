{/* Key Metrics Cards */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
  {/* Cash Balance */}
  <div onClick={() => setActiveTab('income')} style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderRadius: '20px', padding: '28px', color: 'white', cursor: 'pointer', boxShadow: '0 8px 24px rgba(16,185,129,0.3)', transition: 'transform 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div>
        <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>💵 Cash Balance</p>
        <p style={{ margin: 0, fontSize: '36px', fontWeight: '800' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${cashAvailable.toLocaleString()}`}</p>
      </div>
      <span style={{ fontSize: '32px', opacity: 0.8 }}>💰</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', opacity: 0.9 }}>
      <span>Tap to add income</span>
    </div>
  </div>

  {/* Savings */}
  <div onClick={() => setActiveTab('goals')} style={{ background: darkMode ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' : 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', borderRadius: '20px', padding: '28px', color: 'white', cursor: 'pointer', boxShadow: '0 8px 24px rgba(59,130,246,0.3)', transition: 'transform 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div>
        <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>💰 Savings</p>
        <p style={{ margin: 0, fontSize: '36px', fontWeight: '800' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${savings.toLocaleString()}`}</p>
      </div>
      <span style={{ fontSize: '32px', opacity: 0.8 }}>💵</span>
    </div>
    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
        <span>Progress</span>
        <span>{Math.round(savingsProgress)}%</span>
      </div>
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, savingsProgress)}%`, height: '100%', background: 'white', borderRadius: '3px' }}></div>
      </div>
      <p style={{ margin: '6px 0 0 0', fontSize: '11px', opacity: 0.9 }}>Target: {hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${recommendedSavings.toLocaleString()}`}</p>
    </div>
  </div>

  {/* Debts */}
  <div onClick={() => setActiveTab('cards')} style={{ background: debtPercentage > 50 ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : (darkMode ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'), borderRadius: '20px', padding: '28px', color: debtPercentage > 50 ? 'white' : (darkMode ? '#f8fafc' : '#0f172a'), cursor: 'pointer', boxShadow: debtPercentage > 50 ? '0 8px 24px rgba(239,68,68,0.3)' : (darkMode ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)'), transition: 'transform 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div>
        <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>⚠️ Total Debts</p>
        <p style={{ margin: 0, fontSize: '36px', fontWeight: '800' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${totalDebts.toLocaleString()}`}</p>
      </div>
      <span style={{ fontSize: '32px', opacity: 0.8 }}>{debtPercentage > 50 ? '🚨' : '💳'}</span>
    </div>
    {creditCards.length > 0 && (
      <div style={{ background: debtPercentage > 50 ? 'rgba(255,255,255,0.2)' : (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'), borderRadius: '8px', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
          <span>Credit Usage</span>
          <span>{debtPercentage.toFixed(1)}%</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: debtPercentage > 50 ? 'rgba(255,255,255,0.3)' : (darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'), borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${debtPercentage}%`, height: '100%', background: debtPercentage > 50 ? '#fbbf24' : (darkMode ? '#60a5fa' : '#3b82f6'), borderRadius: '3px' }}></div>
        </div>
        <p style={{ margin: '6px 0 0 0', fontSize: '11px', opacity: 0.9 }}>{creditCards.length} card(s) active</p>
      </div>
    )}
  </div>
</div>
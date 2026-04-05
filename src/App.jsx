import { useState, useEffect } from 'react';
import './App.css';
import { saveData, loadData } from './dataStorage';

// Collapsible Section Component
function CollapsibleSection({ title, icon, children, defaultOpen = false, darkMode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{
      background: darkMode ? '#1f2937' : 'white',
      borderRadius: '16px',
      marginBottom: '12px',
      overflow: 'hidden',
      boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '18px 20px',
          background: 'transparent',
          border: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          color: darkMode ? '#f3f4f6' : '#1f2937'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>{icon}</span>
          <span style={{ fontSize: '17px', fontWeight: '500' }}>{title}</span>
        </div>
        <span style={{ fontSize: '20px', color: '#14b8a6' }}>
          {isOpen ? '−' : '+'}
        </span>
      </button>
      
      {isOpen && (
        <div style={{
          padding: '0 20px 20px 20px',
          borderTop: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}`
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

function App() {
  // Main State
  const [cashAvailable, setCashAvailable] = useState(() => loadData('cash', 0));
  const [savings, setSavings] = useState(() => loadData('savings', 0));
  const [totalDebts, setTotalDebts] = useState(() => loadData('debts', 300000));
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ckSanFlow_darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Daily Income
  const [dailyIncomes, setDailyIncomes] = useState(() => loadData('dailyIncomes', []));
  const [todayIncome, setTodayIncome] = useState('');

  // Credit Cards with Smart Billing
  const [creditCards, setCreditCards] = useState(() => loadData('creditCards', [
    { id: 1, name: 'SMBC Olive Card', limit: 500000, available: 350000, balance: 150000, paymentDate: '26th', closingDate: '11th', thisCyclePayment: 10000, nextCyclePayment: 0 }
  ]));
  const [newCard, setNewCard] = useState({ name: '', limit: '', available: '', balance: '', paymentDate: '26th', thisCyclePayment: '', nextCyclePayment: '' });
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  
  // Card Expenses
  const [cardExpenses, setCardExpenses] = useState(() => loadData('cardExpenses', []));
  const [newExpense, setNewExpense] = useState({ cardId: '', amount: '', category: 'Shopping' });

  // Trust Fund & Investment
  const [investmentPercent, setInvestmentPercent] = useState(() => loadData('investmentPercent', 10));
  const [trustFund, setTrustFund] = useState(() => loadData('trustFund', 50000));
  const [spusShares, setSpusShares] = useState(() => loadData('spusShares', 0));

  // Family Support
  const [familySupport, setFamilySupport] = useState(() => loadData('familySupport', {
    parents: { amount: 75000, scheduledDate: '19th', lastPaid: '' },
    daughter: { amount: 25000, scheduledDate: 'anytime', lastPaid: '' },
    other: { amount: 0, scheduledDate: 'anytime', lastPaid: '' }
  }));

  // Health Funds
  const [healthFunds, setHealthFunds] = useState(() => loadData('healthFunds', {
    hairTransplant: { goal: 500000, current: 0 }
  }));

  // Home Expenses
  const [homeExpenses, setHomeExpenses] = useState(() => loadData('homeExpenses', {
    food: 0, gas: 0, electricity: 0
  }));

  // Car Expenses
  const [carExpenses, setCarExpenses] = useState(() => loadData('carExpenses', {
    dailyOil: 2000, totalThisMonth: 0
  }));

  // Monthly Summary
  const [monthlyIncome, setMonthlyIncome] = useState(() => loadData('monthlyIncome', 0));
  const [monthlyExpenses, setMonthlyExpenses] = useState(() => loadData('monthlyExpenses', 0));

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [appName, setAppName] = useState(() => loadData('appName', 'CkSanFlow'));

  // Helper: Calculate closing date from payment date
  const calculateClosingDate = (paymentDate) => {
    const date = parseInt(paymentDate);
    let closing = date - 15;
    if (closing <= 0) closing += 30;
    return closing.toString() + 'th';
  };

  // Save data
  useEffect(() => {
    saveData('cash', cashAvailable);
    saveData('savings', savings);
    saveData('debts', totalDebts);
    saveData('dailyIncomes', dailyIncomes);
    saveData('creditCards', creditCards);
    saveData('cardExpenses', cardExpenses);
    saveData('investmentPercent', investmentPercent);
    saveData('trustFund', trustFund);
    saveData('spusShares', spusShares);
    saveData('familySupport', familySupport);
    saveData('healthFunds', healthFunds);
    saveData('homeExpenses', homeExpenses);
    saveData('carExpenses', carExpenses);
    saveData('monthlyIncome', monthlyIncome);
    saveData('monthlyExpenses', monthlyExpenses);
    saveData('appName', appName);
  }, [cashAvailable, savings, totalDebts, dailyIncomes, creditCards, cardExpenses, investmentPercent, trustFund, spusShares, familySupport, healthFunds, homeExpenses, carExpenses, monthlyIncome, monthlyExpenses, appName]);

  // Dark mode
  useEffect(() => {
    const saved = localStorage.getItem('ckSanFlow_darkMode');
    if (saved) {
      const isDark = JSON.parse(saved);
      setDarkMode(isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
  }, []);

  // Handlers
  const handleAddIncome = () => {
    const amount = parseFloat(todayIncome);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const newIncome = {
      id: Date.now(),
      amount,
      date: new Date().toISOString().split('T')[0]
    };

    setDailyIncomes([newIncome, ...dailyIncomes]);
    setCashAvailable(cashAvailable + amount);
    setMonthlyIncome(monthlyIncome + amount);
    
    const investAmount = Math.round(amount * (investmentPercent / 100));
    setTrustFund(trustFund + investAmount);
    setSavings(savings + investAmount);
    
    setTodayIncome('');
    alert(`✅ ¥${amount.toLocaleString()} added! ¥${investAmount.toLocaleString()} auto-invested (${investmentPercent}%)`);
  };

  const handleAddCard = () => {
    if (!newCard.name || !newCard.limit) {
      alert('Please fill in card name and limit');
      return;
    }

    const closingDate = calculateClosingDate(newCard.paymentDate);

    if (editingCard) {
      setCreditCards(creditCards.map(card => 
        card.id === editingCard.id ? {
          ...card,
          name: newCard.name,
          limit: parseFloat(newCard.limit) || card.limit,
          available: parseFloat(newCard.available) || card.available,
          balance: parseFloat(newCard.balance) || card.balance,
          paymentDate: newCard.paymentDate,
          closingDate: closingDate,
          thisCyclePayment: parseFloat(newCard.thisCyclePayment) || card.thisCyclePayment,
          nextCyclePayment: parseFloat(newCard.nextCyclePayment) || card.nextCyclePayment
        } : card
      ));
      setEditingCard(null);
      alert('✅ Card updated!');
    } else {
      setCreditCards([...creditCards, {
        id: Date.now(),
        name: newCard.name,
        limit: parseFloat(newCard.limit),
        available: parseFloat(newCard.available) || 0,
        balance: parseFloat(newCard.balance) || 0,
        paymentDate: newCard.paymentDate,
        closingDate: closingDate,
        thisCyclePayment: parseFloat(newCard.thisCyclePayment) || 0,
        nextCyclePayment: parseFloat(newCard.nextCyclePayment) || 0
      }]);
      alert('✅ Card added!');
    }

    setNewCard({ name: '', limit: '', available: '', balance: '', paymentDate: '26th', thisCyclePayment: '', nextCyclePayment: '' });
    setShowAddCard(false);
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setNewCard({
      name: card.name,
      limit: card.limit.toString(),
      available: card.available.toString(),
      balance: card.balance.toString(),
      paymentDate: card.paymentDate,
      thisCyclePayment: card.thisCyclePayment.toString(),
      nextCyclePayment: card.nextCyclePayment.toString()
    });
    setShowAddCard(true);
  };

  const handleDeleteCard = (cardId) => {
    if (confirm('Delete this card?')) {
      setCreditCards(creditCards.filter(card => card.id !== cardId));
      alert('🗑️ Card deleted');
    }
  };

  const handleAddCardExpense = () => {
    const { cardId, amount, category } = newExpense;
    const expenseAmount = parseFloat(amount);
    
    if (!cardId || !expenseAmount || expenseAmount <= 0) {
      alert('Please select card and enter amount');
      return;
    }

    const card = creditCards.find(c => c.id === parseInt(cardId));
    if (!card) return;

    if (expenseAmount > card.available) {
      alert('❌ Expense exceeds available credit!');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const expenseDay = new Date().getDate();
    const closingDay = parseInt(card.closingDate);
    const isCurrentCycle = expenseDay <= closingDay;

    setCreditCards(creditCards.map(c => {
      if (c.id === parseInt(cardId)) {
        const newBalance = c.balance + expenseAmount;
        const newAvailable = c.limit - newBalance;
        const newThisCycle = isCurrentCycle ? c.thisCyclePayment + expenseAmount : c.thisCyclePayment;
        const newNextCycle = isCurrentCycle ? c.nextCyclePayment : c.nextCyclePayment + expenseAmount;
        
        return {
          ...c,
          balance: newBalance,
          available: newAvailable,
          thisCyclePayment: newThisCycle,
          nextCyclePayment: newNextCycle
        };
      }
      return c;
    }));

    setCardExpenses([{
      id: Date.now(),
      cardId: parseInt(cardId),
      cardName: card.name,
      amount: expenseAmount,
      category,
      date: today,
      cycle: isCurrentCycle ? 'This Month' : 'Next Month'
    }, ...cardExpenses]);

    setMonthlyExpenses(monthlyExpenses + expenseAmount);
    setNewExpense({ cardId: '', amount: '', category: 'Shopping' });
    alert(`✅ ¥${expenseAmount.toLocaleString()} added (${isCurrentCycle ? 'This' : 'Next'} month)`);
  };

  const handlePayCard = (cardId, amount) => {
    if (amount > cashAvailable) {
      alert('❌ Insufficient cash!');
      return;
    }

    setCreditCards(creditCards.map(card => {
      if (card.id === cardId) {
        const newBalance = card.balance - amount;
        const newAvailable = card.limit - Math.max(0, newBalance);
        return {
          ...card,
          balance: Math.max(0, newBalance),
          available: newAvailable,
          thisCyclePayment: Math.max(0, card.thisCyclePayment - amount)
        };
      }
      return card;
    }));

    setCashAvailable(cashAvailable - amount);
    setTotalDebts(totalDebts - amount);
    alert(`✅ ¥${amount.toLocaleString()} paid!`);
  };

  const handleSendFamilySupport = (type, amount) => {
    if (amount > cashAvailable) {
      alert('❌ Insufficient cash!');
      return;
    }

    setFamilySupport({
      ...familySupport,
      [type]: { ...familySupport[type], lastPaid: new Date().toISOString().split('T')[0] }
    });

    setCashAvailable(cashAvailable - amount);
    setMonthlyExpenses(monthlyExpenses + amount);
    alert(`✅ ¥${amount.toLocaleString()} sent!`);
  };

  const handleAddHealthFund = (amount) => {
    if (amount > cashAvailable) {
      alert('❌ Insufficient cash!');
      return;
    }

    setHealthFunds({
      ...healthFunds,
      hairTransplant: {
        ...healthFunds.hairTransplant,
        current: healthFunds.hairTransplant.current + amount
      }
    });

    setCashAvailable(cashAvailable - amount);
    setSavings(savings + amount);
    alert(`✅ ¥${amount.toLocaleString()} added to health fund!`);
  };

  const handleAddHomeExpense = (type, amount) => {
    if (amount > cashAvailable) {
      alert('❌ Insufficient cash!');
      return;
    }

    setHomeExpenses({
      ...homeExpenses,
      [type]: homeExpenses[type] + amount
    });

    setCashAvailable(cashAvailable - amount);
    setMonthlyExpenses(monthlyExpenses + amount);
    alert(`✅ ¥${amount.toLocaleString()} recorded!`);
  };

  const handleAddCarExpense = () => {
    if (carExpenses.dailyOil > cashAvailable) {
      alert('❌ Insufficient cash!');
      return;
    }

    setCarExpenses({
      ...carExpenses,
      totalThisMonth: carExpenses.totalThisMonth + carExpenses.dailyOil
    });

    setCashAvailable(cashAvailable - carExpenses.dailyOil);
    setMonthlyExpenses(monthlyExpenses + carExpenses.dailyOil);
    alert(`✅ ¥${carExpenses.dailyOil.toLocaleString()} recorded!`);
  };

  const handleReset = () => {
    if (confirm('⚠️ Reset ALL data?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExport = () => {
    const data = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('ckSanFlow_')) {
        data[key] = localStorage.getItem(key);
      }
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ckSanFlow_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    alert('📦 Data exported!');
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
    localStorage.setItem('ckSanFlow_darkMode', newMode);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Shopping': '🛒', 'Food': '🍽️', 'Gas': '⛽',
      'Transport': '🚗', 'Entertainment': '🎬', 'Health': '💊', 'Other': '📦'
    };
    return icons[category] || '📦';
  };

  return (
    <div className="App" style={{
      minHeight: '100vh',
      background: darkMode ? '#111827' : '#f2f4f8',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: darkMode ? '#f3f4f6' : '#1f2937' }}>
            💰 {appName}
          </h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
            Your Financial Freedom Journey
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowCustomize(!showCustomize)} style={{ padding: '10px 15px', background: darkMode ? '#374151' : 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '18px' }}>⚙️</button>
          <button onClick={() => setShowSettings(!showSettings)} style={{ padding: '10px 15px', background: darkMode ? '#374151' : 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '18px' }}>📊</button>
        </div>
      </header>

      {/* Customize Panel */}
      {showCustomize && (
        <div style={{ background: darkMode ? '#1f2937' : 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: darkMode ? '#f3f4f6' : '#1f2937' }}>Customize App</h3>
          <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="App Name" style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '10px', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, background: darkMode ? '#374151' : '#f9fafb', color: darkMode ? '#f3f4f6' : '#1f2937', fontSize: '16px' }} />
          <button onClick={() => setShowCustomize(false)} style={{ width: '100%', padding: '12px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>✅ Save</button>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div style={{ background: darkMode ? '#1f2937' : 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: darkMode ? '#f3f4f6' : '#1f2937' }}>Settings</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <button onClick={toggleDarkMode} style={{ padding: '14px', background: darkMode ? '#fbbf24' : '#1f2937', color: darkMode ? '#1f2937' : 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            <button onClick={handleExport} style={{ padding: '14px', background: '#667eea', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>📦 Export Backup</button>
            <button onClick={handleReset} style={{ padding: '14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>🗑️ Reset All Data</button>
          </div>
        </div>
      )}

      {/* Top 3 Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #ccfbf1 0%, #f0fdfa 100%)', padding: '20px 15px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⬆️</div>
          <p style={{ margin: 0, fontSize: '12px', color: darkMode ? '#fff' : '#0d9488', fontWeight: '500' }}>Cash available</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: '700', color: darkMode ? '#fff' : '#115e59' }}>¥{cashAvailable.toLocaleString()}</p>
        </div>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)' : 'linear-gradient(135deg, #cffafe 0%, #ecfeff 100%)', padding: '20px 15px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
          <p style={{ margin: 0, fontSize: '12px', color: darkMode ? '#fff' : '#0e7490', fontWeight: '500' }}>Savings</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: '700', color: darkMode ? '#fff' : '#164e63' }}>¥{savings.toLocaleString()}</p>
        </div>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)', padding: '20px 15px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
          <p style={{ margin: 0, fontSize: '12px', color: darkMode ? '#fff' : '#b91c1c', fontWeight: '500' }}>Total debts</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: '700', color: darkMode ? '#fff' : '#7f1d1d' }}>¥{totalDebts.toLocaleString()}</p>
        </div>
      </div>

      {/* Daily Income */}
      <CollapsibleSection title="Daily income" icon="📊" darkMode={darkMode} defaultOpen={true}>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <input type="number" value={todayIncome} onChange={(e) => setTodayIncome(e.target.value)} placeholder="Amount (¥)" style={inputStyle(darkMode)} />
          <button onClick={handleAddIncome} style={{ padding: '14px 24px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>Add</button>
        </div>
        <p style={{ fontSize: '13px', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '10px' }}>💡 {investmentPercent}% auto-invested</p>
        {dailyIncomes.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: darkMode ? '#f3f4f6' : '#1f2937' }}>Recent:</p>
            {dailyIncomes.slice(0, 5).map((income) => (
              <div key={income.id} style={{ padding: '10px', background: darkMode ? '#374151' : '#f9fafb', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: darkMode ? '#f3f4f6' : '#1f2937' }}>{income.date}</span>
                <span style={{ color: '#14b8a6', fontWeight: '600' }}>+¥{income.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* Credit Cards */}
      <CollapsibleSection title="Credit cards" icon="💳" darkMode={darkMode} defaultOpen={true}>
        
        {/* ADD CARD BUTTON - TOP (Always Visible) */}
        <button
          onClick={() => { setShowAddCard(true); setEditingCard(null); setNewCard({ name: '', limit: '', available: '', balance: '', paymentDate: '26th', thisCyclePayment: '', nextCyclePayment: '' }); }}
          style={{
            width: '100%',
            padding: '16px',
            background: '#14b8a6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '16px',
            marginTop: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          ➕ Add New Card
        </button>

        {/* Add Expense Section */}
        <div style={{ marginTop: '15px', padding: '15px', background: darkMode ? '#374151' : '#f3f4f6', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: darkMode ? '#f3f4f6' : '#1f2937' }}>➕ Add Today's Expense</p>
          <div style={{ display: 'grid', gap: '10px' }}>
            <select value={newExpense.cardId} onChange={(e) => setNewExpense({...newExpense, cardId: e.target.value})} style={inputStyle(darkMode)}>
              <option value="">Select Card</option>
              {creditCards.map(card => (<option key={card.id} value={card.id}>{card.name}</option>))}
            </select>
            <input type="number" placeholder="Amount (¥)" value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} style={inputStyle(darkMode)} />
            <select value={newExpense.category} onChange={(e) => setNewExpense({...newExpense, category: e.target.value})} style={inputStyle(darkMode)}>
              <option value="Shopping">🛒 Shopping</option>
              <option value="Food">🍽️ Food</option>
              <option value="Gas">⛽ Gas</option>
              <option value="Transport">🚗 Transport</option>
              <option value="Entertainment">🎬 Entertainment</option>
              <option value="Health">💊 Health</option>
              <option value="Other">📦 Other</option>
            </select>
            <button onClick={handleAddCardExpense} style={{ padding: '12px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Add Expense</button>
          </div>
        </div>

        {/* Add/Edit Card Form */}
        {showAddCard && (
          <div style={{ marginTop: '15px', padding: '15px', background: darkMode ? '#374151' : '#f3f4f6', borderRadius: '12px', display: 'grid', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, color: darkMode ? '#f3f4f6' : '#1f2937' }}>{editingCard ? '✏️ Edit Card' : '➕ New Card'}</h4>
              <button onClick={() => { setShowAddCard(false); setEditingCard(null); }} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✕ Cancel</button>
            </div>
            <input type="text" placeholder="Card Name" value={newCard.name} onChange={(e) => setNewCard({...newCard, name: e.target.value})} style={inputStyle(darkMode)} />
            <input type="number" placeholder="Credit Limit (¥)" value={newCard.limit} onChange={(e) => setNewCard({...newCard, limit: e.target.value})} style={inputStyle(darkMode)} />
            <input type="number" placeholder="Available Amount (¥)" value={newCard.available} onChange={(e) => setNewCard({...newCard, available: e.target.value})} style={inputStyle(darkMode)} />
            <input type="number" placeholder="Current Balance (¥)" value={newCard.balance} onChange={(e) => setNewCard({...newCard, balance: e.target.value})} style={inputStyle(darkMode)} />
            <select value={newCard.paymentDate} onChange={(e) => setNewCard({...newCard, paymentDate: e.target.value})} style={inputStyle(darkMode)}>
              <option value="10th">10th (Close: 25th)</option>
              <option value="26th">26th (Close: 11th)</option>
              <option value="27th">27th (Close: 12th)</option>
            </select>
            <input type="number" placeholder="This Month Payment (¥)" value={newCard.thisCyclePayment} onChange={(e) => setNewCard({...newCard, thisCyclePayment: e.target.value})} style={inputStyle(darkMode)} />
            <input type="number" placeholder="Next Month Payment (¥)" value={newCard.nextCyclePayment} onChange={(e) => setNewCard({...newCard, nextCyclePayment: e.target.value})} style={inputStyle(darkMode)} />
            <button onClick={handleAddCard} style={{ padding: '14px', background: editingCard ? '#f59e0b' : '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
              {editingCard ? '💾 Update Card' : '➕ Add Card'}
            </button>
          </div>
        )}

        {/* Card List */}
        <div style={{ marginTop: '15px' }}>
          {creditCards.map((card) => (
            <div key={card.id} style={{
              background: darkMode ? '#374151' : '#f9fafb',
              padding: '15px',
              borderRadius: '12px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '16px', color: darkMode ? '#f3f4f6' : '#1f2937' }}>{card.name}</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEditCard(card)} style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                  <button onClick={() => handleDeleteCard(card.id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                </div>
              </div>
              
              <div style={{ padding: '10px', background: darkMode ? '#1f2937' : '#e5e7eb', borderRadius: '8px', marginBottom: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>📅 Closing:</span>
                  <strong style={{ color: darkMode ? '#f3f4f6' : '#1f2937' }}>{card.closingDate} of month</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                  <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>💰 Payment:</span>
                  <strong style={{ color: darkMode ? '#f3f4f6' : '#1f2937' }}>{card.paymentDate} of month</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', marginBottom: '10px' }}>
                <div><span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Limit:</span> <strong style={{ color: darkMode ? '#f3f4f6' : '#1f2937' }}>¥{card.limit.toLocaleString()}</strong></div>
                <div><span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Available:</span> <strong style={{ color: '#14b8a6' }}>¥{card.available.toLocaleString()}</strong></div>
                <div><span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Balance:</span> <strong style={{ color: '#ef4444' }}>¥{card.balance.toLocaleString()}</strong></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div style={{ padding: '10px', background: darkMode ? '#059669' : '#ccfbf1', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: darkMode ? '#fff' : '#0d9488' }}>This Month</p>
                  <p style={{ margin: '3px 0 0 0', fontSize: '16px', fontWeight: '700', color: darkMode ? '#fff' : '#115e59' }}>¥{card.thisCyclePayment.toLocaleString()}</p>
                </div>
                <div style={{ padding: '10px', background: darkMode ? '#0891b2' : '#cffafe', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: darkMode ? '#fff' : '#0e7490' }}>Next Month</p>
                  <p style={{ margin: '3px 0 0 0', fontSize: '16px', fontWeight: '700', color: darkMode ? '#fff' : '#164e63' }}>¥{card.nextCyclePayment.toLocaleString()}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" placeholder="Amount" id={`pay-${card.id}`} defaultValue={card.thisCyclePayment} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`, background: darkMode ? '#1f2937' : 'white', color: darkMode ? '#f3f4f6' : '#1f2937' }} />
                <button onClick={() => handlePayCard(card.id, parseFloat(document.getElementById(`pay-${card.id}`).value) || card.thisCyclePayment)} style={{ padding: '10px 20px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Pay</button>
              </div>
            </div>
          ))}
        </div>

        {/* ADD CARD BUTTON - BOTTOM (Always Visible) */}
        <button
          onClick={() => { setShowAddCard(true); setEditingCard(null); setNewCard({ name: '', limit: '', available: '', balance: '', paymentDate: '26th', thisCyclePayment: '', nextCyclePayment: '' }); }}
          style={{
            width: '100%',
            padding: '16px',
            background: '#14b8a6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '16px',
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          ➕ Add Another Card
        </button>

        {/* Recent Expenses */}
        {cardExpenses.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: darkMode ? '#f3f4f6' : '#1f2937' }}>📜 Recent Expenses:</p>
            {cardExpenses.slice(0, 10).map((expense) => (
              <div key={expense.id} style={{ padding: '12px', background: darkMode ? '#374151' : '#f9fafb', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: darkMode ? '#f3f4f6' : '#1f2937' }}>{getCategoryIcon(expense.category)} {expense.category}</p>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280' }}>{expense.cardName} • {expense.date}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: '600', color: '#ef4444' }}>¥{expense.amount.toLocaleString()}</p>
                  <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: expense.cycle === 'This Month' ? '#14b8a6' : '#f59e0b' }}>{expense.cycle}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* Trust Funds & Investment */}
      <CollapsibleSection title="Trust funds & investment" icon="🏦" darkMode={darkMode}>
        <div style={{ marginTop: '15px' }}>
          <label style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Auto-invest percentage from income:</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <input type="number" value={investmentPercent} onChange={(e) => setInvestmentPercent(parseFloat(e.target.value) || 0)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, background: darkMode ? '#374151' : '#f9fafb', color: darkMode ? '#f3f4f6' : '#1f2937' }} />
            <span style={{ padding: '12px', color: darkMode ? '#f3f4f6' : '#1f2937', fontWeight: '600' }}>%</span>
          </div>
          <p style={{ fontSize: '13px', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '8px' }}>💡 Recommended: 10-20%</p>
        </div>
        <div style={{ marginTop: '20px', padding: '15px', background: darkMode ? '#059669' : '#ccfbf1', borderRadius: '12px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: darkMode ? '#fff' : '#0d9488' }}>Trust Fund Total</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: '700', color: darkMode ? '#fff' : '#115e59' }}>¥{trustFund.toLocaleString()}</p>
        </div>
        <div style={{ marginTop: '15px', padding: '15px', background: darkMode ? '#0891b2' : '#cffafe', borderRadius: '12px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: darkMode ? '#fff' : '#0e7490' }}>SPUS Shares</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: '700', color: darkMode ? '#fff' : '#164e63' }}>{spusShares} shares</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <input type="number" placeholder="Amount to invest" id="invest-amount" style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, background: darkMode ? '#374151' : '#f9fafb', color: darkMode ? '#f3f4f6' : '#1f2937' }} />
          <button onClick={() => { const amt = parseFloat(document.getElementById('invest-amount').value); if(amt && amt <= cashAvailable) { setTrustFund(trustFund + amt); setSavings(savings + amt); setCashAvailable(cashAvailable - amt); alert('✅ Invested!'); } else { alert('❌ Invalid amount'); } }} style={{ padding: '12px 24px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Invest</button>
        </div>
      </CollapsibleSection>

      {/* Family Support Manager */}
      <CollapsibleSection title="Family support manager" icon="👨‍👩‍👧" darkMode={darkMode}>
        <div style={{ marginTop: '15px' }}>
          <div style={{ padding: '15px', background: darkMode ? '#374151' : '#f9fafb', borderRadius: '12px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: '600', color: darkMode ? '#f3f4f6' : '#1f2937' }}>🇯🇵 Parents (Japan)</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Monthly: ¥{familySupport.parents.amount.toLocaleString()}</p>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#f59e0b' }}>📅 Scheduled: {familySupport.parents.scheduledDate}</p>
                {familySupport.parents.lastPaid && <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#14b8a6' }}>✓ Last: {familySupport.parents.lastPaid}</p>}
              </div>
              <button onClick={() => handleSendFamilySupport('parents', familySupport.parents.amount)} style={{ padding: '10px 20px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Send</button>
            </div>
          </div>
          <div style={{ padding: '15px', background: darkMode ? '#374151' : '#f9fafb', borderRadius: '12px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: '600', color: darkMode ? '#f3f4f6' : '#1f2937' }}>🇮🇹 Daughter (Italy)</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Monthly: ¥{familySupport.daughter.amount.toLocaleString()}</p>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#f59e0b' }}>📅 Scheduled: {familySupport.daughter.scheduledDate}</p>
                {familySupport.daughter.lastPaid && <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#14b8a6' }}>✓ Last: {familySupport.daughter.lastPaid}</p>}
              </div>
              <button onClick={() => handleSendFamilySupport('daughter', familySupport.daughter.amount)} style={{ padding: '10px 20px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Send</button>
            </div>
          </div>
          <div style={{ padding: '15px', background: darkMode ? '#374151' : '#f9fafb', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: '600', color: darkMode ? '#f3f4f6' : '#1f2937' }}>🎁 Other Expenses</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Monthly: ¥{familySupport.other.amount.toLocaleString()}</p>
              </div>
              <button onClick={() => handleSendFamilySupport('other', familySupport.other.amount)} style={{ padding: '10px 20px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Send</button>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Health Funds */}
      <CollapsibleSection title="Health funds" icon="🏥" darkMode={darkMode}>
        <div style={{ marginTop: '15px', padding: '15px', background: darkMode ? '#374151' : '#f9fafb', borderRadius: '12px' }}>
          <p style={{ margin: 0, fontWeight: '600', color: darkMode ? '#f3f4f6' : '#1f2937' }}>💇 Hair Transplant Plan</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Saved:</span>
            <strong style={{ color: '#14b8a6' }}>¥{healthFunds.hairTransplant.current.toLocaleString()} / ¥{healthFunds.hairTransplant.goal.toLocaleString()}</strong>
          </div>
          <div style={{ width: '100%', height: '8px', background: darkMode ? '#1f2937' : '#e5e7eb', borderRadius: '4px', marginTop: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${(healthFunds.hairTransplant.current / healthFunds.hairTransplant.goal) * 100}%`, height: '100%', background: '#14b8a6', borderRadius: '4px' }}></div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <input type="number" placeholder="Amount" id="health-amount" style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`, background: darkMode ? '#1f2937' : 'white', color: darkMode ? '#f3f4f6' : '#1f2937' }} />
            <button onClick={() => handleAddHealthFund(parseFloat(document.getElementById('health-amount').value))} style={{ padding: '12px 24px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Add</button>
          </div>
        </div>
      </CollapsibleSection>

      {/* Home Expenses */}
      <CollapsibleSection title="Home expenses" icon="🏠" darkMode={darkMode}>
        <div style={{ marginTop: '15px', display: 'grid', gap: '10px' }}>
          {['food', 'gas', 'electricity'].map((type) => (
            <div key={type} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ width: '100px', color: darkMode ? '#f3f4f6' : '#1f2937', fontWeight: '500', textTransform: 'capitalize' }}>{type}</span>
              <input type="number" placeholder="Amount" id={`home-${type}`} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, background: darkMode ? '#374151' : '#f9fafb', color: darkMode ? '#f3f4f6' : '#1f2937' }} />
              <button onClick={() => handleAddHomeExpense(type, parseFloat(document.getElementById(`home-${type}`).value))} style={{ padding: '12px 20px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Add</button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '15px', padding: '12px', background: darkMode ? '#374151' : '#f9fafb', borderRadius: '10px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280' }}>This Month Total: <strong style={{ color: darkMode ? '#f3f4f6' : '#1f2937' }}>¥{(homeExpenses.food + homeExpenses.gas + homeExpenses.electricity).toLocaleString()}</strong></p>
        </div>
      </CollapsibleSection>

      {/* Car Expenses */}
      <CollapsibleSection title="Car expenses" icon="🚗" darkMode={darkMode}>
        <div style={{ marginTop: '15px' }}>
          <div style={{ padding: '15px', background: darkMode ? '#374151' : '#f9fafb', borderRadius: '12px', marginBottom: '15px' }}>
            <p style={{ margin: 0, fontWeight: '600', color: darkMode ? '#f3f4f6' : '#1f2937' }}>⛽ Daily Oil</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Per Day:</span>
              <strong style={{ color: darkMode ? '#f3f4f6' : '#1f2937' }}>¥{carExpenses.dailyOil.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
              <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>This Month:</span>
              <strong style={{ color: '#ef4444' }}>¥{carExpenses.totalThisMonth.toLocaleString()}</strong>
            </div>
          </div>
          <button onClick={handleAddCarExpense} style={{ width: '100%', padding: '14px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>Add Today's Oil (¥{carExpenses.dailyOil.toLocaleString()})</button>
        </div>
      </CollapsibleSection>

      {/* Monthly Summary */}
      <CollapsibleSection title="Monthly summary" icon="📈" darkMode={darkMode} defaultOpen={true}>
        <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div style={{ padding: '15px', background: darkMode ? '#059669' : '#ccfbf1', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '12px', color: darkMode ? '#fff' : '#0d9488' }}>M Income</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: '700', color: darkMode ? '#fff' : '#115e59' }}>¥{monthlyIncome.toLocaleString()}</p>
          </div>
          <div style={{ padding: '15px', background: darkMode ? '#dc2626' : '#fee2e2', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '12px', color: darkMode ? '#fff' : '#b91c1c' }}>M Expenses</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: '700', color: darkMode ? '#fff' : '#7f1d1d' }}>¥{monthlyExpenses.toLocaleString()}</p>
          </div>
          <div style={{ padding: '15px', background: darkMode ? '#0891b2' : '#cffafe', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '12px', color: darkMode ? '#fff' : '#0e7490' }}>M Savings</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: '700', color: darkMode ? '#fff' : '#164e63' }}>¥{savings.toLocaleString()}</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '20px', color: darkMode ? '#6b7280' : '#9ca3af', fontSize: '13px', marginTop: '20px' }}>
        <p style={{ margin: 0 }}>© 2026 {appName} • Built with ❤️</p>
      </footer>
    </div>
  );
}

function inputStyle(darkMode) {
  return {
    padding: '12px',
    borderRadius: '10px',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    background: darkMode ? '#374151' : '#f9fafb',
    color: darkMode ? '#f3f4f6' : '#1f2937',
    fontSize: '16px'
  };
}

export default App;
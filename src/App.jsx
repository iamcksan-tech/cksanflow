import { useState, useEffect } from 'react';
import './App.css';
import { saveData, loadData } from './dataStorage';

// ============ CONFIG ============
const CONFIG = {
  currency: '¥',
  defaultSavingsPercent: 10,
  debtHoldThreshold: 10,
  maxDailyOil: 2000,
  categoryKeywords: {
    'Shopping': ['amazon', 'rakuten', 'shopping', 'store', 'mall'],
    'Food': ['restaurant', 'cafe', 'food', 'lunch', 'dinner', '7-eleven', 'familymart', 'lawson'],
    'Gas': ['gas', 'fuel', 'eneos', 'shell'],
    'Transport': ['train', 'subway', 'bus', 'taxi', 'uber'],
    'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game'],
    'Health': ['pharmacy', 'drug', 'clinic', 'hospital', 'medicine'],
    'Other': []
  }
};

const formatJST = (date = new Date()) => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo'
  }).format(date);
};

const autoCategorize = (description) => {
  if (!description) return 'Other';
  const lower = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CONFIG.categoryKeywords)) {
    if (keywords.some(kw => lower.includes(kw))) return category;
  }
  return 'Other';
};

const validateAmount = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0 && num < 10000000;
};

// ============ MAIN APP ============
function App() {
  // Active Tab
  const [activeTab, setActiveTab] = useState('overview');
  
  // Month Management
  const [currentMonth, setCurrentMonth] = useState(() => localStorage.getItem('ckSanFlow_currentMonth') || new Date().toISOString().slice(0, 7));
  const [lastUpdated, setLastUpdated] = useState(() => loadData('lastUpdated', formatJST()));

  // Main State - CASH & DEBTS CARRY OVER
  const [cashAvailable, setCashAvailable] = useState(() => loadData(`cash_${currentMonth}`, 0));
  const [creditCards, setCreditCards] = useState(() => loadData(`creditCards_${currentMonth}`, []));
  
  // Monthly Reset - SAVINGS & GOALS RESET
  const [savings, setSavings] = useState(() => {
    const saved = loadData(`savings_${currentMonth}`, null);
    return saved !== null ? saved : 0;
  });
  
  // Monthly Income
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState(() => {
    const saved = loadData(`monthlyIncomeGoal_${currentMonth}`, null);
    return saved !== null ? saved : 300000;
  });
  const [monthlyIncome, setMonthlyIncome] = useState(() => {
    const saved = loadData(`monthlyIncome_${currentMonth}`, null);
    return saved !== null ? saved : 0;
  });
  
  // Daily Income
  const [dailyIncomes, setDailyIncomes] = useState(() => loadData(`dailyIncomes_${currentMonth}`, []));
  const [todayIncome, setTodayIncome] = useState('');

  // Card Expenses
  const [cardExpenses, setCardExpenses] = useState(() => loadData(`cardExpenses_${currentMonth}`, []));
  const [expenseForm, setExpenseForm] = useState({ cardId: '', amount: '', category: 'Shopping', description: '' });

  // Credit Cards - Form State
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [cardForm, setCardForm] = useState({
    name: '', limit: '', available: '', balance: '', 
    paymentDate: '26th', thisCyclePayment: '', nextCyclePayment: ''
  });

  // Monthly Goals - Form State
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalForm, setGoalForm] = useState({
    name: '', target: '', color: '#14b8a6', priority: 'medium'
  });
  const [monthlyGoals, setMonthlyGoals] = useState(() => loadData(`monthlyGoals_${currentMonth}`, []));

  // Auto-Hold
  const [autoHoldEnabled, setAutoHoldEnabled] = useState(() => loadData('autoHoldEnabled', true));
  const [debtThresholdPercent, setDebtThresholdPercent] = useState(() => loadData('debtThresholdPercent', CONFIG.debtHoldThreshold));

  // Car Expenses
  const [carExpenses, setCarExpenses] = useState(() => loadData(`carExpenses_${currentMonth}`, { dailyOil: CONFIG.maxDailyOil, maxDailyOil: CONFIG.maxDailyOil, totalThisMonth: 0 }));

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [appName, setAppName] = useState(() => loadData('appName', 'CkSanFlow'));
  const [darkMode, setDarkMode] = useState(() => {
    const s = localStorage.getItem('ckSanFlow_darkMode');
    return s ? JSON.parse(s) : false;
  });
  const [hideNumbers, setHideNumbers] = useState(() => {
    const s = localStorage.getItem('ckSanFlow_hideNumbers');
    return s ? JSON.parse(s) : false;
  });

  // CALCULATIONS
  const totalDebts = creditCards.reduce((sum, card) => sum + card.balance, 0);
  const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.limit, 0);
  const totalCreditAvailable = creditCards.reduce((sum, card) => sum + card.available, 0);
  const debtPercentage = totalCreditLimit > 0 ? (totalDebts / totalCreditLimit) * 100 : 0;
  const shouldHoldSavings = autoHoldEnabled && debtPercentage > debtThresholdPercent;
  const recommendedSavings = Math.round(monthlyIncome * (CONFIG.defaultSavingsPercent / 100));
  const incomeProgress = monthlyIncomeGoal > 0 ? (monthlyIncome / monthlyIncomeGoal) * 100 : 0;
  const savingsProgress = recommendedSavings > 0 ? (savings / recommendedSavings) * 100 : 0;

  // Save with timestamp
  const saveWithTimestamp = (key, value) => {
    saveData(key, value);
    const now = formatJST();
    setLastUpdated(now);
    saveData('lastUpdated', now);
  };

  // Save all data
  useEffect(() => {
    saveWithTimestamp(`cash_${currentMonth}`, cashAvailable);
    saveWithTimestamp(`creditCards_${currentMonth}`, creditCards);
    saveWithTimestamp(`savings_${currentMonth}`, savings);
    saveWithTimestamp(`dailyIncomes_${currentMonth}`, dailyIncomes);
    saveWithTimestamp(`cardExpenses_${currentMonth}`, cardExpenses);
    saveWithTimestamp(`monthlyGoals_${currentMonth}`, monthlyGoals);
    saveWithTimestamp(`monthlyIncomeGoal_${currentMonth}`, monthlyIncomeGoal);
    saveWithTimestamp(`monthlyIncome_${currentMonth}`, monthlyIncome);
    saveWithTimestamp(`carExpenses_${currentMonth}`, carExpenses);
    saveData('autoHoldEnabled', autoHoldEnabled);
    saveData('debtThresholdPercent', debtThresholdPercent);
    saveData('appName', appName);
    saveData('hideNumbers', hideNumbers);
    saveData('ckSanFlow_darkMode', darkMode);
  }, [cashAvailable, creditCards, savings, dailyIncomes, cardExpenses, monthlyGoals, monthlyIncomeGoal, monthlyIncome, carExpenses, autoHoldEnabled, debtThresholdPercent, appName, hideNumbers, currentMonth, darkMode]);

  // Month change - RESET monthly data, KEEP cash & debts
  const handleMonthChange = (newMonth) => {
    setCurrentMonth(newMonth);
    localStorage.setItem('ckSanFlow_currentMonth', newMonth);
    setCashAvailable(loadData(`cash_${newMonth}`, 0));
    setCreditCards(loadData(`creditCards_${newMonth}`, []));
    setSavings(loadData(`savings_${newMonth}`, 0));
    setMonthlyIncomeGoal(loadData(`monthlyIncomeGoal_${newMonth}`, 300000));
    setMonthlyIncome(loadData(`monthlyIncome_${newMonth}`, 0));
    setDailyIncomes(loadData(`dailyIncomes_${newMonth}`, []));
    setCardExpenses(loadData(`cardExpenses_${newMonth}`, []));
    setMonthlyGoals(loadData(`monthlyGoals_${newMonth}`, []));
    setCarExpenses(loadData(`carExpenses_${newMonth}`, { dailyOil: CONFIG.maxDailyOil, maxDailyOil: CONFIG.maxDailyOil, totalThisMonth: 0 }));
  };

  const calculateClosingDate = (paymentDate) => {
    const date = parseInt(paymentDate);
    let closing = date - 15;
    if (closing <= 0) closing += 30;
    return closing.toString() + 'th';
  };

  // ============ INCOME HANDLERS ============
  const handleAddIncome = () => {
    const amount = parseFloat(todayIncome);
    if (!validateAmount(amount)) { alert('Please enter a valid amount'); return; }
    const newIncome = { id: Date.now(), amount, date: new Date().toISOString().split('T')[0] };
    setDailyIncomes([newIncome, ...dailyIncomes]);
    setCashAvailable(cashAvailable + amount);
    setMonthlyIncome(monthlyIncome + amount);
    if (!shouldHoldSavings) {
      const investAmount = Math.round(amount * (CONFIG.defaultSavingsPercent / 100));
      setSavings(savings + investAmount);
    }
    setTodayIncome('');
    alert(`✅ ${CONFIG.currency}${amount.toLocaleString()} added!`);
  };

  const handleEditIncome = () => {
    if (dailyIncomes.length === 0) return;
    const latestIncome = dailyIncomes[0];
    const newAmount = prompt(`Edit income amount:`, latestIncome.amount.toString());
    if (newAmount === null) return;
    const amount = parseFloat(newAmount);
    if (!validateAmount(amount)) { alert('Invalid amount'); return; }
    const diff = amount - latestIncome.amount;
    setCashAvailable(cashAvailable + diff);
    setMonthlyIncome(monthlyIncome + diff);
    setDailyIncomes([{ ...latestIncome, amount }, ...dailyIncomes.slice(1)]);
    alert('✅ Income updated!');
  };

  const handleDeleteIncome = () => {
    if (dailyIncomes.length === 0) return;
    const latestIncome = dailyIncomes[0];
    if (!confirm(`Delete this income?`)) return;
    setCashAvailable(cashAvailable - latestIncome.amount);
    setMonthlyIncome(monthlyIncome - latestIncome.amount);
    setDailyIncomes(dailyIncomes.slice(1));
    alert('🗑️ Income deleted!');
  };

  // ============ CARD HANDLERS ============
  const handleOpenCardForm = (card = null) => {
    if (card) {
      setEditingCard(card);
      setCardForm({
        name: card.name, limit: card.limit.toString(), available: card.available.toString(), balance: card.balance.toString(),
        paymentDate: card.paymentDate, thisCyclePayment: card.thisCyclePayment.toString(), nextCyclePayment: card.nextCyclePayment.toString()
      });
    } else {
      setEditingCard(null);
      setCardForm({ name: '', limit: '', available: '', balance: '', paymentDate: '26th', thisCyclePayment: '', nextCyclePayment: '' });
    }
    setShowCardForm(true);
  };

  const handleCloseCardForm = () => { setShowCardForm(false); setEditingCard(null); };

  const handleSaveCard = () => {
    if (!cardForm.name || !cardForm.limit) { alert('Please fill in card name and limit'); return; }
    const closingDate = calculateClosingDate(cardForm.paymentDate);
    const limit = parseFloat(cardForm.limit) || 0;
    const available = parseFloat(cardForm.available) || 0;
    const balance = parseFloat(cardForm.balance) || 0;
    let finalAvailable = available, finalBalance = balance;
    if (available === 0 && balance === 0) { finalAvailable = limit; finalBalance = 0; }
    else if (available === 0 && balance > 0) { finalAvailable = limit - balance; }
    else if (balance === 0 && available > 0) { finalBalance = limit - available; }

    if (editingCard) {
      setCreditCards(creditCards.map(card => card.id === editingCard.id ? {
        ...card, name: cardForm.name, limit, available: finalAvailable, balance: finalBalance,
        paymentDate: cardForm.paymentDate, closingDate,
        thisCyclePayment: parseFloat(cardForm.thisCyclePayment) || 0,
        nextCyclePayment: parseFloat(cardForm.nextCyclePayment) || 0
      } : card));
      alert('✅ Card updated!');
    } else {
      setCreditCards([...creditCards, {
        id: Date.now(), name: cardForm.name, limit, available: finalAvailable, balance: finalBalance,
        paymentDate: cardForm.paymentDate, closingDate,
        thisCyclePayment: parseFloat(cardForm.thisCyclePayment) || 0,
        nextCyclePayment: parseFloat(cardForm.nextCyclePayment) || 0
      }]);
      alert('✅ Card added!');
    }
    handleCloseCardForm();
  };

  const handleDeleteCard = (cardId) => {
    if (confirm('Delete this card?')) {
      setCreditCards(creditCards.filter(card => card.id !== cardId));
      alert('🗑️ Card deleted');
    }
  };

  // ============ EXPENSE HANDLERS ============
  const handleAddExpense = () => {
    const expenseAmount = parseFloat(expenseForm.amount);
    if (!validateAmount(expenseAmount)) { alert('Please enter a valid amount'); return; }
    if (!expenseForm.cardId) { alert('Please select Cash or a card'); return; }

    if (expenseForm.cardId === 'cash') {
      if (expenseAmount > cashAvailable) { alert('❌ Insufficient cash!'); return; }
      setCashAvailable(cashAvailable - expenseAmount);
    } else {
      const card = creditCards.find(c => c.id === parseInt(expenseForm.cardId));
      if (!card || expenseAmount > card.available) { alert('❌ Expense exceeds available credit!'); return; }
      setCreditCards(creditCards.map(c => {
        if (c.id === parseInt(expenseForm.cardId)) {
          const newBalance = c.balance + expenseAmount;
          return { ...c, balance: newBalance, available: c.limit - newBalance };
        }
        return c;
      }));
    }

    const today = new Date().toISOString().split('T')[0];
    setCardExpenses([{ id: Date.now(), cardId: expenseForm.cardId, amount: expenseAmount, category: autoCategorize(expenseForm.description) || expenseForm.category, description: expenseForm.description, date: today }, ...cardExpenses]);
    alert(`${CONFIG.currency}${expenseAmount.toLocaleString()} recorded!`);
    setExpenseForm({ cardId: '', amount: '', category: 'Shopping', description: '' });
  };

  const handleDeleteExpense = (expenseId) => {
    const expense = cardExpenses.find(e => e.id === expenseId);
    if (!expense) return;
    if (!confirm(`Delete this expense?`)) return;
    if (expense.cardId === 'cash') setCashAvailable(cashAvailable + expense.amount);
    else {
      setCreditCards(creditCards.map(c => {
        if (c.id === parseInt(expense.cardId)) {
          const newBalance = c.balance - expense.amount;
          return { ...c, balance: Math.max(0, newBalance), available: c.limit - newBalance };
        }
        return c;
      }));
    }
    setCardExpenses(cardExpenses.filter(e => e.id !== expenseId));
    alert('🗑️ Expense deleted!');
  };

  const handlePayCard = (cardId, amount) => {
    if (!validateAmount(amount)) { alert('Please enter a valid amount'); return; }
    if (amount > cashAvailable) { alert('❌ Insufficient cash!'); return; }
    setCreditCards(creditCards.map(card => {
      if (card.id === cardId) {
        const newBalance = card.balance - amount;
        const newAvailable = card.limit - Math.max(0, newBalance);
        return { ...card, balance: Math.max(0, newBalance), available: newAvailable };
      }
      return card;
    }));
    setCashAvailable(cashAvailable - amount);
    alert(`${CONFIG.currency}${amount.toLocaleString()} paid!`);
  };

  // ============ GOAL HANDLERS ============
  const handleOpenGoalForm = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setGoalForm({ name: goal.name, target: goal.target.toString(), color: goal.color, priority: goal.priority });
    } else {
      setEditingGoal(null);
      setGoalForm({ name: '', target: '', color: '#14b8a6', priority: 'medium' });
    }
    setShowGoalForm(true);
  };

  const handleCloseGoalForm = () => { setShowGoalForm(false); setEditingGoal(null); };

  const handleSaveGoal = () => {
    if (!goalForm.name || !goalForm.target) { alert('Please fill in goal name and target'); return; }
    const target = parseFloat(goalForm.target);
    if (!validateAmount(target)) { alert('Please enter a valid target'); return; }

    if (editingGoal) {
      setMonthlyGoals(monthlyGoals.map(g => g.id === editingGoal.id ? { ...g, name: goalForm.name, target, color: goalForm.color, priority: goalForm.priority } : g));
      alert('✅ Goal updated!');
    } else {
      setMonthlyGoals([...monthlyGoals, { id: Date.now(), name: goalForm.name, target, current: 0, color: goalForm.color, priority: goalForm.priority }]);
      alert('✅ Goal added!');
    }
    handleCloseGoalForm();
  };

  const handleDeleteGoal = (goalId) => {
    if (confirm('Delete this goal?')) {
      setMonthlyGoals(monthlyGoals.filter(g => g.id !== goalId));
      alert('🗑️ Goal deleted!');
    }
  };

  const handleContributeToGoal = (goalId, amount) => {
    if (!validateAmount(amount)) { alert('Please enter a valid amount'); return; }
    if (amount > cashAvailable) { alert('❌ Insufficient cash!'); return; }
    setMonthlyGoals(monthlyGoals.map(g => g.id === goalId ? { ...g, current: Math.min(g.target, g.current + amount) } : g));
    setCashAvailable(cashAvailable - amount);
    if (!shouldHoldSavings) setSavings(savings + amount);
    alert(`${CONFIG.currency}${amount.toLocaleString()} added to goal!`);
  };

  // ============ CAR EXPENSE ============
  const handleAddCarExpense = () => {
    if (carExpenses.dailyOil > cashAvailable) { alert('❌ Insufficient cash!'); return; }
    setCarExpenses({ ...carExpenses, totalThisMonth: carExpenses.totalThisMonth + carExpenses.dailyOil });
    setCashAvailable(cashAvailable - carExpenses.dailyOil);
    alert(`${CONFIG.currency}${carExpenses.dailyOil.toLocaleString()} recorded!`);
  };

  // ============ SETTINGS ============
  const toggleDarkMode = () => { const newMode = !darkMode; setDarkMode(newMode); };
  const toggleHideNumbers = () => { const newHide = !hideNumbers; setHideNumbers(newHide); };
  const handleExport = () => {
    const data = { version: '1.0', exportedAt: formatJST() };
    Object.keys(localStorage).forEach(key => { if (key.startsWith('ckSanFlow_')) { data[key] = localStorage.getItem(key); } });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ckSanFlow_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    alert('📦 Data exported!');
  };
  const handleReset = () => { if (confirm('⚠️ Reset ALL data?')) { localStorage.clear(); window.location.reload(); } };
  const getCategoryIcon = (category) => ({ 'Shopping': '🛒', 'Food': '🍽️', 'Gas': '⛽', 'Transport': '🚗', 'Entertainment': '🎬', 'Health': '💊', 'Other': '📦' }[category] || '📦');

  const generateMonthOptions = () => {
    const months = [];
    const today = new Date();
    for (let i = -6; i <= 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthStr = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', timeZone: 'Asia/Tokyo' });
      months.push({ value: monthStr, label });
    }
    return months;
  };

  // ============ RENDER ============
  return (
    <div className="App" style={{ minHeight: '100vh', background: darkMode ? '#0f172a' : '#f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Navigation */}
      <nav style={{ background: darkMode ? '#1e293b' : 'white', padding: '16px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>💰</span>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: darkMode ? '#f8fafc' : '#0f172a' }}>{appName}</h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>{formatMonth(currentMonth)}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['overview', 'cards', 'goals', 'expenses', 'income'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 20px',
                  background: activeTab === tab ? (darkMode ? '#14b8a6' : '#14b8a6') : (darkMode ? '#334155' : '#f1f5f9'),
                  color: activeTab === tab ? 'white' : (darkMode ? '#94a3b8' : '#647480'),
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab ? '700' : '600',
                  fontSize: '14px',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab === 'overview' && '📊 '}
                {tab === 'cards' && '💳 '}
                {tab === 'goals' && '🎯 '}
                {tab === 'expenses' && '📋 '}
                {tab === 'income' && '💵 '}
                {tab}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={currentMonth} onChange={(e) => handleMonthChange(e.target.value)} style={{ padding: '10px 14px', background: darkMode ? '#0f172a' : '#f8fafc', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, borderRadius: '10px', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px', fontWeight: '600' }}>
              {generateMonthOptions().map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
            </select>
            <button onClick={toggleHideNumbers} style={{ padding: '10px 14px', background: hideNumbers ? '#8b5cf6' : (darkMode ? '#0f172a' : '#f8fafc'), border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '18px' }}>{hideNumbers ? '🙈' : '👁️'}</button>
            <button onClick={toggleDarkMode} style={{ padding: '10px 14px', background: darkMode ? '#fbbf24' : '#0f172a', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', color: darkMode ? '#0f172a' : 'white' }}>{darkMode ? '☀️' : '🌙'}</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* ============ OVERVIEW TAB ============ */}
        {activeTab === 'overview' && (
          <div>
            {/* Welcome Header */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800', color: darkMode ? '#f8fafc' : '#0f172a' }}>Overview</h2>
              <p style={{ margin: 0, fontSize: '16px', color: darkMode ? '#94a3b8' : '#647480' }}>Your financial snapshot for {formatMonth(currentMonth)}</p>
            </div>

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
                  <span> Tap to add income</span>
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
              <div onClick={() => setActiveTab('cards')} style={{ background: debtPercentage > 50 ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : (darkMode ? 'linear-gradient(135deg, #1e293b 0%, '#334155 100%)' : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'), borderRadius: '20px', padding: '28px', color: debtPercentage > 50 ? 'white' : (darkMode ? '#f8fafc' : '#0f172a'), cursor: 'pointer', boxShadow: debtPercentage > 50 ? '0 8px 24px rgba(239,68,68,0.3)' : (darkMode ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)'), transition: 'transform 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
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

            {/* Performance Insights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              {/* Income Progress */}
              <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '20px', padding: '28px', boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>📈 Income Progress</h3>
                  <button onClick={() => setActiveTab('income')} style={{ padding: '8px 16px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>View Details →</button>
                </div>
                
                {/* Circular Progress */}
                <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 24px' }}>
                  <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke={darkMode ? '#334155' : '#e2e8f0'} strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="url(#incomeGradient)" strokeWidth="8" strokeDasharray={`${Math.min(100, incomeProgress) * 2.51} 251`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
                    <defs>
                      <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '40px', fontWeight: '800', color: darkMode ? '#f8fafc' : '#0f172a' }}>{Math.round(incomeProgress)}%</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: darkMode ? '#94a3b8' : '#647480' }}>of goal</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: darkMode ? '#94a3b8' : '#647480' }}>Earned</p>
                    <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#14b8a6' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${monthlyIncome.toLocaleString()}`}</p>
                  </div>
                  <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: darkMode ? '#94a3b8' : '#647480' }}>Goal</p>
                    <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#8b5cf6' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${monthlyIncomeGoal.toLocaleString()}`}</p>
                  </div>
                </div>
              </div>

              {/* Goals Overview */}
              <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '20px', padding: '28px', boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>🎯 Goals Overview</h3>
                  <button onClick={() => setActiveTab('goals')} style={{ padding: '8px 16px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>View Details →</button>
                </div>

                {monthlyGoals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <p style={{ margin: '0 0 16px 0', fontSize: '48px' }}>🎯</p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: darkMode ? '#f8fafc' : '#0f172a' }}>No goals yet</p>
                    <p style={{ margin: 0, fontSize: '14px', color: darkMode ? '#94a3b8' : '#647480' }}>Click below to create your first goal</p>
                    <button onClick={() => setActiveTab('goals')} style={{ marginTop: '16px', padding: '12px 24px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>Create Goal</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {monthlyGoals.slice(0, 3).map((goal) => (
                      <div key={goal.id} style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: darkMode ? '#f8fafc' : '#0f172a' }}>{goal.name}</p>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: goal.color }}>{Math.round((goal.current / goal.target) * 100)}%</p>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%`, height: '100%', background: goal.color, borderRadius: '4px' }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px' }}>
                          <span style={{ color: darkMode ? '#94a3b8' : '#647480' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${goal.current.toLocaleString()}`}</span>
                          <span style={{ color: darkMode ? '#94a3b8' : '#647480' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${goal.target.toLocaleString()}`}</span>
                        </div>
                      </div>
                    ))}
                    {monthlyGoals.length > 3 && (
                      <button onClick={() => setActiveTab('goals')} style={{ padding: '12px', background: 'transparent', border: `2px dashed ${darkMode ? '#334155' : '#e2e8f0'}`, borderRadius: '10px', color: darkMode ? '#94a3b8' : '#647480', cursor: 'pointer', fontWeight: '600' }}>+{monthlyGoals.length - 3} more goals</button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '20px', padding: '28px', boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>⚡ Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <button onClick={() => setActiveTab('income')} style={{ padding: '20px', background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', textAlign: 'left' }}>
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>💵</span>
                  Add Income
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: '400', opacity: 0.9 }}>Increase cash balance</p>
                </button>
                <button onClick={() => setActiveTab('expenses')} style={{ padding: '20px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', textAlign: 'left' }}>
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📋</span>
                  Add Expense
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: '400', opacity: '0.9'}}>Track spending</p>
                </button>
                <button onClick={() => setActiveTab('cards')} style={{ padding: '20px', background: 'linear-gradient(135deg, #8b5cf6 0%, #60a5fa 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', textAlign: 'left' }}>
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>💳</span>
                  Manage Cards
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: '400', opacity: 0.9 }}>View & pay debts</p>
                </button>
                <button onClick={() => setActiveTab('goals')} style={{ padding: '20px', background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', textAlign: 'left' }}>
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🎯</span>
                  Set Goals
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: '400', opacity: 0.9 }}>Plan your savings</p>
                </button>
              </div>
            </div>

            {/* Recent Activity Preview */}
            {(cardExpenses.length > 0 || dailyIncomes.length > 0) && (
              <div style={{ marginTop: '32px', background: darkMode ? '#1e293b' : 'white', borderRadius: '20px', padding: '28px', boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>📋 Recent Activity</h3>
                  <button onClick={() => setActiveTab('expenses')} style={{ padding: '8px 16px', background: 'transparent', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, borderRadius: '8px', color: darkMode ? '#94a3b8' : '#647480', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>View All →</button>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[...dailyIncomes.slice(0, 3).map(i => ({ ...i, type: 'income' })), ...cardExpenses.slice(0, 3).map(e => ({ ...e, type: 'expense' }))]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5)
                    .map((item) => (
                      <div key={item.id} style={{ padding: '16px', background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '24px' }}>{item.type === 'income' ? '💵' : getCategoryIcon(item.category)}</span>
                          <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: darkMode ? '#f8fafc' : '#0f172a' }}>{item.type === 'income' ? 'Income' : (item.description || item.category)}</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: darkMode ? '#94a3b8' : '#647480' }}>{item.date}</p>
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: item.type === 'income' ? '#14b8a6' : '#ef4444' }}>
                          {item.type === 'income' ? '+' : '-'}{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${item.amount.toLocaleString()}`}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ CARDS TAB ============ */}
        {activeTab === 'cards' && (
          <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '20px', padding: '28px', boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '800', color: darkMode ? '#f8fafc' : '#0f172a' }}>💳 Credit Cards</h2>
                <p style={{ margin: 0, fontSize: '14px', color: darkMode ? '#94a3b8' : '#647480' }}>Manage your cards and track debts</p>
              </div>
              <button onClick={() => handleOpenCardForm()} style={{ padding: '14px 28px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>➕ Add New Card</button>
            </div>

            {showCardForm && (
              <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>{editingCard ? '✏️ Edit Card' : '➕ New Card'}</h3>
                  <button onClick={handleCloseCardForm} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>✕ Cancel</button>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <input type="text" placeholder="Card Name" value={cardForm.name} onChange={(e) => setCardForm({...cardForm, name: e.target.value})} style={{ padding: '14px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="number" placeholder="Limit Quota" value={cardForm.limit} onChange={(e) => setCardForm({...cardForm, limit: e.target.value})} style={{ padding: '14px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                    <input type="number" placeholder="Available" value={cardForm.available} onChange={(e) => setCardForm({...cardForm, available: e.target.value})} style={{ padding: '14px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="number" placeholder="Balance (Debt)" value={cardForm.balance} onChange={(e) => setCardForm({...cardForm, balance: e.target.value})} style={{ padding: '14px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                    <select value={cardForm.paymentDate} onChange={(e) => setCardForm({...cardForm, paymentDate: e.target.value})} style={{ padding: '14px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }}>
                      <option value="10th">10th (Close: 25th)</option>
                      <option value="26th">26th (Close: 11th)</option>
                      <option value="27th">27th (Close: 12th)</option>
                    </select>
                  </div>
                  <button onClick={handleSaveCard} style={{ padding: '16px', background: editingCard ? '#f59e0b' : '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>{editingCard ? '💾 Update Card' : '➕ Add Card'}</button>
                </div>
              </div>
            )}

            {creditCards.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '64px' }}>💳</p>
                <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>No credit cards yet</p>
                <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: darkMode ? '#94a3b8' : '#647480' }}>Click "➕ Add New Card" to add your first card</p>
                <button onClick={() => handleOpenCardForm()} style={{ padding: '14px 32px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>Add Your First Card</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {creditCards.map((card) => (
                  <div key={card.id} style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '24px', borderRadius: '16px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>{card.name}</h3>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleOpenCardForm(card)} style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>✏️ Edit</button>
                        <button onClick={() => handleDeleteCard(card.id)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>🗑️ Delete</button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                      <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: darkMode ? '#94a3b8' : '#647480' }}>Limit Quota</p>
                        <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${card.limit.toLocaleString()}`}</p>
                      </div>
                      <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: darkMode ? '#94a3b8' : '#647480' }}>Available</p>
                        <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#14b8a6' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${card.available.toLocaleString()}`}</p>
                      </div>
                      <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: darkMode ? '#94a3b8' : '#647480' }}>Debt to Pay</p>
                        <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#ef4444' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${card.balance.toLocaleString()}`}</p>
                      </div>
                    </div>
                    {card.balance > 0 && cashAvailable > 0 && (
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <input type="number" placeholder="Pay amount" id={`pay-${card.id}`} defaultValue={Math.min(card.balance, cashAvailable)} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                        <button onClick={() => handlePayCard(card.id, parseFloat(document.getElementById(`pay-${card.id}`).value) || Math.min(card.balance, cashAvailable))} style={{ padding: '14px 32px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>Pay Now</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ GOALS TAB ============ */}
        {activeTab === 'goals' && (
          <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '20px', padding: '28px', boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '800', color: darkMode ? '#f8fafc' : '#0f172a' }}>🎯 Monthly Goals</h2>
                <p style={{ margin: 0, fontSize: '14px', color: darkMode ? '#94a3b8' : '#647480' }}>Set and track your financial goals</p>
              </div>
              <button onClick={() => handleOpenGoalForm()} style={{ padding: '14px 28px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>➕ Add Goal</button>
            </div>

            {showGoalForm && (
              <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>{editingGoal ? '✏️ Edit Goal' : '➕ New Goal'}</h3>
                  <button onClick={handleCloseGoalForm} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>✕ Cancel</button>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <input type="text" placeholder="Goal Name" value={goalForm.name} onChange={(e) => setGoalForm({...goalForm, name: e.target.value})} style={{ padding: '14px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                  <input type="number" placeholder={`Target Amount (${CONFIG.currency})`} value={goalForm.target} onChange={(e) => setGoalForm({...goalForm, target: e.target.value})} style={{ padding: '14px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                  <select value={goalForm.color} onChange={(e) => setGoalForm({...goalForm, color: e.target.value})} style={{ padding: '14px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }}>
                    <option value="#14b8a6">🟢 Teal</option>
                    <option value="#8b5cf6">🟣 Purple</option>
                    <option value="#f59e0b">🟠 Orange</option>
                    <option value="#ef4444">🔴 Red</option>
                    <option value="#3b82f6">🔵 Blue</option>
                  </select>
                  <button onClick={handleSaveGoal} style={{ padding: '16px', background: editingGoal ? '#f59e0b' : '#8b5cf6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>{editingGoal ? '💾 Update Goal' : '➕ Add Goal'}</button>
                </div>
              </div>
            )}

            {monthlyGoals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '64px' }}>🎯</p>
                <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>No goals yet</p>
                <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: darkMode ? '#94a3b8' : '#647480' }}>Click "➕ Add Goal" to create your first goal</p>
                <button onClick={() => handleOpenGoalForm()} style={{ padding: '14px 32px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>Create Your First Goal</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {monthlyGoals.map((goal) => (
                  <div key={goal.id} style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '24px', borderRadius: '16px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>{goal.name}</h3>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleOpenGoalForm(goal)} style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>✏️ Edit</button>
                        <button onClick={() => handleDeleteGoal(goal.id)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>🗑️ Delete</button>
                      </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                        <span style={{ color: darkMode ? '#94a3b8' : '#647480' }}>Progress</span>
                        <span style={{ fontWeight: '700', color: goal.color }}>{Math.round((goal.current / goal.target) * 100)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '12px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%`, height: '100%', background: goal.color, borderRadius: '6px', transition: 'width 0.5s ease' }}></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '14px' }}>
                        <span style={{ color: darkMode ? '#94a3b8' : '#647480' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${goal.current.toLocaleString()}`}</span>
                        <span style={{ color: darkMode ? '#94a3b8' : '#647480' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${goal.target.toLocaleString()}`}</span>
                      </div>
                    </div>
                    {goal.current < goal.target ? (
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <input type="number" placeholder="Contribute amount" id={`goal-${goal.id}`} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                        <button onClick={() => handleContributeToGoal(goal.id, parseFloat(document.getElementById(`goal-${goal.id}`).value))} style={{ padding: '14px 32px', background: goal.color, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>Contribute</button>
                      </div>
                    ) : (
                      <div style={{ padding: '16px', background: '#14b8a6', color: 'white', borderRadius: '12px', textAlign: 'center', fontWeight: '700', fontSize: '16px' }}>✅ Goal Completed!</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ EXPENSES TAB ============ */}
        {activeTab === 'expenses' && (
          <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '20px', padding: '28px', boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: '800', color: darkMode ? '#f8fafc' : '#0f172a' }}>📋 Expenses</h2>
            
            <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>➕ Add New Expense</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <select value={expenseForm.cardId} onChange={(e) => setExpenseForm({...expenseForm, cardId: e.target.value})} style={{ padding: '14px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }}>
                  <option value="">Select Payment Method</option>
                  <option value="cash">💵 Cash Balance</option>
                  {creditCards.map(card => (<option key={card.id} value={card.id}>{card.name}</option>))}
                </select>
                <input type="text" placeholder="Description (e.g., Amazon, 7-Eleven)" value={expenseForm.description} onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})} style={{ padding: '14px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                <input type="number" placeholder={`Amount (${CONFIG.currency})`} value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} style={{ padding: '14px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                <button onClick={handleAddExpense} style={{ padding: '16px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>Record Expense</button>
              </div>
            </div>

            {cardExpenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '64px' }}>📋</p>
                <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>No expenses yet</p>
                <p style={{ margin: 0, fontSize: '14px', color: darkMode ? '#94a3b8' : '#647480' }}>Your spending will appear here</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {cardExpenses.map((expense) => (
                  <div key={expense.id} style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '20px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '28px' }}>{getCategoryIcon(expense.category)}</span>
                        <div>
                          <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>{expense.description || expense.category}</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: darkMode ? '#94a3b8' : '#647480' }}>{expense.cardId === 'cash' ? '💵 Cash' : creditCards.find(c => c.id === parseInt(expense.cardId))?.name} • {expense.date}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#ef4444' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${expense.amount.toLocaleString()}`}</p>
                        <button onClick={() => handleDeleteExpense(expense.id)} style={{ padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ INCOME TAB ============ */}
        {activeTab === 'income' && (
          <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '20px', padding: '28px', boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: '800', color: darkMode ? '#f8fafc' : '#0f172a' }}>💵 Daily Income</h2>
            
            <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>➕ Add Income</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input type="number" value={todayIncome} onChange={(e) => setTodayIncome(e.target.value)} placeholder={`Amount (${CONFIG.currency})`} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px', fontWeight: '600' }} />
                <button onClick={handleAddIncome} style={{ padding: '14px 32px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>Add Income</button>
              </div>
              <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: darkMode ? '#94a3b8' : '#647480' }}>💡 {CONFIG.defaultSavingsPercent}% automatically saved (if not on hold)</p>
            </div>

            {dailyIncomes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '64px' }}>💵</p>
                <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>No income yet</p>
                <p style={{ margin: 0, fontSize: '14px', color: darkMode ? '#94a3b8' : '#647480' }}>Start tracking your daily income</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {dailyIncomes.map((income, index) => (
                  <div key={income.id} style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '20px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '28px' }}>💵</span>
                        <div>
                          <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>Daily Income</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: darkMode ? '#94a3b8' : '#647480' }}>{income.date}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#14b8a6' }}>+{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${income.amount.toLocaleString()}`}</p>
                        {index === 0 && (
                          <>
                            <button onClick={handleEditIncome} style={{ padding: '8px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>✏️</button>
                            <button onClick={handleDeleteIncome} style={{ padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>🗑️</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px', color: darkMode ? '#64748b' : '#94a3b8', fontSize: '12px', marginTop: '40px', borderTop: `2px solid ${darkMode ? '#1e293b' : '#e2e8f0'}` }}>
        <p style={{ margin: 0 }}>© 2026 {appName} • 💰 All data stored locally • No tracking</p>
      </footer>
    </div>
  );
}

export default App;
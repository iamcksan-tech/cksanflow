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
    year: 'numeric', month: 'short', day: 'numeric',
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
  // Month Management
  const [currentMonth, setCurrentMonth] = useState(() => localStorage.getItem('ckSanFlow_currentMonth') || new Date().toISOString().slice(0, 7));
  const [lastUpdated, setLastUpdated] = useState(() => loadData('lastUpdated', formatJST()));

  // Main State
  const [cashAvailable, setCashAvailable] = useState(() => loadData(`cash_${currentMonth}`, 0));
  const [savings, setSavings] = useState(() => loadData(`savings_${currentMonth}`, 0));
  const [creditCards, setCreditCards] = useState(() => loadData(`creditCards_${currentMonth}`, []));
  const [darkMode, setDarkMode] = useState(() => {
    const s = localStorage.getItem('ckSanFlow_darkMode');
    return s ? JSON.parse(s) : false;
  });
  const [hideNumbers, setHideNumbers] = useState(() => {
    const s = localStorage.getItem('ckSanFlow_hideNumbers');
    return s ? JSON.parse(s) : false;
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
  const [newExpense, setNewExpense] = useState({ cardId: '', amount: '', category: 'Shopping', description: '' });
  const [editingExpense, setEditingExpense] = useState(null);

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

  // CALCULATIONS
  const totalDebts = creditCards.reduce((sum, card) => sum + card.balance, 0);
  const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.limit, 0);
  const totalCreditAvailable = creditCards.reduce((sum, card) => sum + card.available, 0);
  const debtPercentage = totalCreditLimit > 0 ? (totalDebts / totalCreditLimit) * 100 : 0;
  const shouldHoldSavings = autoHoldEnabled && debtPercentage > debtThresholdPercent;
  const recommendedSavings = Math.round(monthlyIncome * (CONFIG.defaultSavingsPercent / 100));

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
    saveWithTimestamp(`savings_${currentMonth}`, savings);
    saveWithTimestamp(`creditCards_${currentMonth}`, creditCards);
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
  }, [cashAvailable, savings, creditCards, dailyIncomes, cardExpenses, monthlyGoals, monthlyIncomeGoal, monthlyIncome, carExpenses, autoHoldEnabled, debtThresholdPercent, appName, hideNumbers, currentMonth]);

  // Dark mode
  useEffect(() => {
    const s = localStorage.getItem('ckSanFlow_darkMode');
    if (s) {
      const isDark = JSON.parse(s);
      setDarkMode(isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
  }, []);

  // Month change
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
        name: card.name,
        limit: card.limit.toString(),
        available: card.available.toString(),
        balance: card.balance.toString(),
        paymentDate: card.paymentDate,
        thisCyclePayment: card.thisCyclePayment.toString(),
        nextCyclePayment: card.nextCyclePayment.toString()
      });
    } else {
      setEditingCard(null);
      setCardForm({
        name: '', limit: '', available: '', balance: '',
        paymentDate: '26th', thisCyclePayment: '', nextCyclePayment: ''
      });
    }
    setShowCardForm(true);
  };

  const handleCloseCardForm = () => {
    setShowCardForm(false);
    setEditingCard(null);
  };

  const handleSaveCard = () => {
    if (!cardForm.name || !cardForm.limit) {
      alert('Please fill in card name and limit');
      return;
    }
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
    const expenseAmount = parseFloat(newExpense.amount);
    if (!validateAmount(expenseAmount)) { alert('Please enter a valid amount'); return; }
    if (!newExpense.cardId) { alert('Please select Cash or a card'); return; }

    if (newExpense.cardId === 'cash') {
      if (expenseAmount > cashAvailable) { alert('❌ Insufficient cash!'); return; }
      setCashAvailable(cashAvailable - expenseAmount);
    } else {
      const card = creditCards.find(c => c.id === parseInt(newExpense.cardId));
      if (!card || expenseAmount > card.available) { alert('❌ Expense exceeds available credit!'); return; }
      setCreditCards(creditCards.map(c => {
        if (c.id === parseInt(newExpense.cardId)) {
          const newBalance = c.balance + expenseAmount;
          return { ...c, balance: newBalance, available: c.limit - newBalance };
        }
        return c;
      }));
    }

    const today = new Date().toISOString().split('T')[0];
    setCardExpenses([{
      id: Date.now(),
      cardId: newExpense.cardId,
      amount: expenseAmount,
      category: autoCategorize(newExpense.description) || newExpense.category,
      description: newExpense.description,
      date: today
    }, ...cardExpenses]);

    alert(`${CONFIG.currency}${expenseAmount.toLocaleString()} recorded!`);
    setNewExpense({ cardId: '', amount: '', category: 'Shopping', description: '' });
  };

  const handleDeleteExpense = (expenseId) => {
    const expense = cardExpenses.find(e => e.id === expenseId);
    if (!expense) return;
    if (!confirm(`Delete this expense?`)) return;
    if (expense.cardId === 'cash') {
      setCashAvailable(cashAvailable + expense.amount);
    } else {
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
      setGoalForm({
        name: goal.name,
        target: goal.target.toString(),
        color: goal.color,
        priority: goal.priority
      });
    } else {
      setEditingGoal(null);
      setGoalForm({ name: '', target: '', color: '#14b8a6', priority: 'medium' });
    }
    setShowGoalForm(true);
  };

  const handleCloseGoalForm = () => {
    setShowGoalForm(false);
    setEditingGoal(null);
  };

  const handleSaveGoal = () => {
    if (!goalForm.name || !goalForm.target) {
      alert('Please fill in goal name and target');
      return;
    }
    const target = parseFloat(goalForm.target);
    if (!validateAmount(target)) { alert('Please enter a valid target'); return; }

    if (editingGoal) {
      setMonthlyGoals(monthlyGoals.map(g => g.id === editingGoal.id ? {
        ...g, name: goalForm.name, target, color: goalForm.color, priority: goalForm.priority
      } : g));
      alert('✅ Goal updated!');
    } else {
      setMonthlyGoals([...monthlyGoals, {
        id: Date.now(),
        name: goalForm.name,
        target,
        current: 0,
        color: goalForm.color,
        priority: goalForm.priority
      }]);
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
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
    localStorage.setItem('ckSanFlow_darkMode', newMode);
  };

  const toggleHideNumbers = () => {
    const newHide = !hideNumbers;
    setHideNumbers(newHide);
    localStorage.setItem('ckSanFlow_hideNumbers', newHide);
  };

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

  const handleReset = () => {
    if (confirm('⚠️ Reset ALL data?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const getCategoryIcon = (category) => ({
    'Shopping': '🛒', 'Food': '🍽️', 'Gas': '⛽', 'Transport': '🚗',
    'Entertainment': '🎬', 'Health': '💊', 'Other': '📦'
  }[category] || '📦');

  const generateMonthOptions = () => {
    const months = [];
    const today = new Date();
    for (let i = -6; i <= 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthStr = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('ja-JP', { month: 'short', year: 'numeric', timeZone: 'Asia/Tokyo' });
      months.push({ value: monthStr, label });
    }
    return months;
  };

  // ============ RENDER ============
  return (
    <div className="App" style={{ minHeight: '100vh', background: darkMode ? '#0f172a' : '#f8fafc', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header */}
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: darkMode ? '#f8fafc' : '#0f172a' }}>💰 {appName}</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: darkMode ? '#94a3b8' : '#64748b' }}>Smart Finance Manager</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: darkMode ? '#64748b' : '#94a3b8' }}>🔄 Updated: {lastUpdated} JST</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select value={currentMonth} onChange={(e) => handleMonthChange(e.target.value)} style={{ padding: '10px 14px', background: darkMode ? '#1e293b' : 'white', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, borderRadius: '10px', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px', fontWeight: '600' }}>
            {generateMonthOptions().map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
          </select>
          <button onClick={toggleHideNumbers} style={{ padding: '10px 14px', background: hideNumbers ? '#8b5cf6' : (darkMode ? '#1e293b' : 'white'), border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', color: hideNumbers ? 'white' : (darkMode ? '#f8fafc' : '#0f172a') }}>👁️</button>
          <button onClick={toggleDarkMode} style={{ padding: '10px 14px', background: darkMode ? '#fbbf24' : '#1e293b', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', color: darkMode ? '#0f172a' : 'white' }}>{darkMode ? '☀️' : '🌙'}</button>
          <button onClick={() => setShowSettings(!showSettings)} style={{ padding: '10px 14px', background: darkMode ? '#1e293b' : 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '18px' }}>📊</button>
        </div>
      </header>

      {shouldHoldSavings && (
        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px' }}>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'white' }}>⏸️ Savings ON HOLD</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.95)' }}>Debts at {debtPercentage.toFixed(1)}% - Focus on paying down to {debtThresholdPercent}%</p>
        </div>
      )}

      {/* Dashboard Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', padding: '20px 16px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>💵</div>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>CASH BALANCE</p>
          <p style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: '800', color: 'white' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${cashAvailable.toLocaleString()}`}</p>
        </div>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)', padding: '20px 16px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚠️</div>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>DEBTS</p>
          <p style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: '800', color: 'white' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${totalDebts.toLocaleString()}`}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>{creditCards.length > 0 ? debtPercentage.toFixed(1) : 0}% of limit</p>
        </div>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' : 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)', padding: '20px 16px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📊</div>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>INCOME GOAL</p>
          <p style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: '800', color: 'white' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${monthlyIncomeGoal.toLocaleString()}`}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.9)' }}>{hideNumbers ? '••••' : `${Math.round((monthlyIncome / monthlyIncomeGoal) * 100)}%`} achieved</p>
        </div>
        <div style={{ background: shouldHoldSavings ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', padding: '20px 16px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>{shouldHoldSavings ? '⏸️' : '💰'}</div>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>SAVINGS</p>
          <p style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: '800', color: 'white' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${savings.toLocaleString()}`}</p>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px', fontWeight: '700' }}>Settings</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <button onClick={toggleDarkMode} style={{ padding: '14px', background: darkMode ? '#fbbf24' : '#0f172a', color: darkMode ? '#0f172a' : 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>{darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
            <button onClick={toggleHideNumbers} style={{ padding: '14px', background: hideNumbers ? '#8b5cf6' : '#0f172a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>{hideNumbers ? '👁️ Show Numbers' : '🙈 Hide Numbers'}</button>
            <button onClick={handleExport} style={{ padding: '14px', background: '#667eea', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>📦 Export Backup</button>
            <button onClick={handleReset} style={{ padding: '14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>🗑️ Reset All Data</button>
          </div>
        </div>
      )}

      {/* Credit Cards Section */}
      <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>💳 Credit Cards</h2>
          <button onClick={() => handleOpenCardForm()} style={{ padding: '10px 20px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>➕ Add Card</button>
        </div>

        {/* Add Card Form */}
        {showCardForm && (
          <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px' }}>{editingCard ? '✏️ Edit Card' : '➕ New Card'}</h4>
              <button onClick={handleCloseCardForm} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✕ Cancel</button>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              <input type="text" placeholder="Card Name" value={cardForm.name} onChange={(e) => setCardForm({...cardForm, name: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input type="number" placeholder="Limit" value={cardForm.limit} onChange={(e) => setCardForm({...cardForm, limit: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                <input type="number" placeholder="Available" value={cardForm.available} onChange={(e) => setCardForm({...cardForm, available: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input type="number" placeholder="Balance" value={cardForm.balance} onChange={(e) => setCardForm({...cardForm, balance: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                <select value={cardForm.paymentDate} onChange={(e) => setCardForm({...cardForm, paymentDate: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }}>
                  <option value="10th">10th (Close: 25th)</option>
                  <option value="26th">26th (Close: 11th)</option>
                  <option value="27th">27th (Close: 12th)</option>
                </select>
              </div>
              <button onClick={handleSaveCard} style={{ padding: '14px', background: editingCard ? '#f59e0b' : '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>{editingCard ? '💾 Update' : '➕ Add Card'}</button>
            </div>
          </div>
        )}

        {/* Cards List */}
        {creditCards.length === 0 ? (
          <p style={{ textAlign: 'center', color: darkMode ? '#94a3b8' : '#647480', padding: '40px' }}>No credit cards yet. Click "➕ Add Card" to add one.</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {creditCards.map((card) => (
              <div key={card.id} style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '16px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>{card.name}</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenCardForm(card)} style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                    <button onClick={() => handleDeleteCard(card.id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                  <div><span style={{ color: darkMode ? '#94a3b8' : '#647480' }}>Limit:</span> <strong style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${card.limit.toLocaleString()}`}</strong></div>
                  <div><span style={{ color: darkMode ? '#94a3b8' : '#647480' }}>Available:</span> <strong style={{ color: '#14b8a6' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${card.available.toLocaleString()}`}</strong></div>
                  <div style={{ gridColumn: 'span 2' }}><span style={{ color: darkMode ? '#94a3b8' : '#647480' }}>Balance:</span> <strong style={{ color: '#ef4444' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${card.balance.toLocaleString()}`}</strong></div>
                </div>
                {card.balance > 0 && cashAvailable > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                    <input type="number" placeholder="Pay amount" id={`pay-${card.id}`} defaultValue={Math.min(card.balance, cashAvailable)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                    <button onClick={() => handlePayCard(card.id, parseFloat(document.getElementById(`pay-${card.id}`).value) || Math.min(card.balance, cashAvailable))} style={{ padding: '10px 20px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>Pay</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Expense */}
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>➕ Add Expense</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <select value={newExpense.cardId} onChange={(e) => setNewExpense({...newExpense, cardId: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }}>
              <option value="">Select Payment Method</option>
              <option value="cash">💵 Cash</option>
              {creditCards.map(card => (<option key={card.id} value={card.id}>{card.name}</option>))}
            </select>
            <input type="text" placeholder="Description (e.g., Amazon, 7-Eleven)" value={newExpense.description} onChange={(e) => setNewExpense({...newExpense, description: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
            <input type="number" placeholder={`Amount (${CONFIG.currency})`} value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
            <button onClick={handleAddExpense} style={{ padding: '14px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>Add Expense</button>
          </div>
        </div>

        {/* Expense List */}
        {cardExpenses.length > 0 && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>📜 Recent Expenses</h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {cardExpenses.slice(0, 10).map((expense) => (
                <div key={expense.id} style={{ padding: '12px', background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: darkMode ? '#f8fafc' : '#0f172a' }}>{getCategoryIcon(expense.category)} {expense.category}</p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: darkMode ? '#94a3b8' : '#647480' }}>{expense.cardId === 'cash' ? '💵 Cash' : creditCards.find(c => c.id === parseInt(expense.cardId))?.name} • {expense.date}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontWeight: '700', color: '#ef4444' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${expense.amount.toLocaleString()}`}</p>
                    <button onClick={() => handleDeleteExpense(expense.id)} style={{ padding: '4px 8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Goals Section */}
      <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>🎯 Monthly Goals</h2>
          <button onClick={() => handleOpenGoalForm()} style={{ padding: '10px 20px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>➕ Add Goal</button>
        </div>

        {/* Add Goal Form */}
        {showGoalForm && (
          <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px' }}>{editingGoal ? '✏️ Edit Goal' : '➕ New Goal'}</h4>
              <button onClick={handleCloseGoalForm} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✕ Cancel</button>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              <input type="text" placeholder="Goal Name" value={goalForm.name} onChange={(e) => setGoalForm({...goalForm, name: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
              <input type="number" placeholder={`Target (${CONFIG.currency})`} value={goalForm.target} onChange={(e) => setGoalForm({...goalForm, target: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
              <select value={goalForm.color} onChange={(e) => setGoalForm({...goalForm, color: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }}>
                <option value="#14b8a6">🟢 Teal</option>
                <option value="#8b5cf6">🟣 Purple</option>
                <option value="#f59e0b">🟠 Orange</option>
                <option value="#ef4444">🔴 Red</option>
                <option value="#3b82f6">🔵 Blue</option>
              </select>
              <button onClick={handleSaveGoal} style={{ padding: '14px', background: editingGoal ? '#f59e0b' : '#8b5cf6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>{editingGoal ? '💾 Update' : '➕ Add Goal'}</button>
            </div>
          </div>
        )}

        {/* Goals List */}
        {monthlyGoals.length === 0 ? (
          <p style={{ textAlign: 'center', color: darkMode ? '#94a3b8' : '#647480', padding: '40px' }}>No goals yet. Click "➕ Add Goal" to add one.</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {monthlyGoals.map((goal) => (
              <div key={goal.id} style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '16px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>{goal.name}</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenGoalForm(goal)} style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                    <button onClick={() => handleDeleteGoal(goal.id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: darkMode ? '#94a3b8' : '#647480' }}>Progress</span>
                    <span style={{ color: darkMode ? '#f8fafc' : '#0f172a', fontWeight: '600' }}>{Math.round((goal.current / goal.target) * 100)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%`, height: '100%', background: goal.color, borderRadius: '6px' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px' }}>
                    <span style={{ color: darkMode ? '#94a3b8' : '#647480' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${goal.current.toLocaleString()}`}</span>
                    <span style={{ color: darkMode ? '#94a3b8' : '#647480' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${goal.target.toLocaleString()}`}</span>
                  </div>
                </div>
                {goal.current < goal.target && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="number" placeholder="Contribute" id={`goal-${goal.id}`} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                    <button onClick={() => handleContributeToGoal(goal.id, parseFloat(document.getElementById(`goal-${goal.id}`).value))} style={{ padding: '10px 20px', background: goal.color, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>Add</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Car Expenses */}
      <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>🚗 Car Expenses</h2>
        <div style={{ padding: '14px', background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '10px', marginBottom: '14px' }}>
          <p style={{ margin: 0, fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>⛽ Daily Oil</p>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: darkMode ? '#94a3b8' : '#647480' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${carExpenses.dailyOil.toLocaleString()}`} per day</p>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: darkMode ? '#94a3b8' : '#647480' }}>This month: <strong style={{ color: '#ef4444' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${carExpenses.totalThisMonth.toLocaleString()}`}</strong></p>
        </div>
        <button onClick={handleAddCarExpense} style={{ width: '100%', padding: '14px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>Add Today ({CONFIG.currency}{carExpenses.dailyOil.toLocaleString()})</button>
      </div>

      {/* Daily Income */}
      <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>💵 Daily Income</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <input type="number" value={todayIncome} onChange={(e) => setTodayIncome(e.target.value)} placeholder={`Amount (${CONFIG.currency})`} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px', fontWeight: '600' }} />
          <button onClick={handleAddIncome} style={{ padding: '14px 28px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>Add</button>
        </div>
        {dailyIncomes.length === 0 ? (
          <p style={{ textAlign: 'center', color: darkMode ? '#94a3b8' : '#647480', padding: '20px' }}>No income recorded yet this month</p>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            {dailyIncomes.map((income, index) => (
              <div key={income.id} style={{ padding: '12px', background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: darkMode ? '#f8fafc' : '#0f172a', fontWeight: '600' }}>{income.date}</span>
                  {index === 0 && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#f59e0b', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>LATEST</span>}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: '#14b8a6', fontWeight: '700', fontSize: '16px' }}>{hideNumbers ? '+' + CONFIG.currency + '••••' : `+${CONFIG.currency}${income.amount.toLocaleString()}`}</span>
                  {index === 0 && (
                    <>
                      <button onClick={handleEditIncome} style={{ padding: '4px 8px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✏️</button>
                      <button onClick={handleDeleteIncome} style={{ padding: '4px 8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '20px', color: darkMode ? '#64748b' : '#94a3b8', fontSize: '12px', marginTop: '24px', borderTop: `2px solid ${darkMode ? '#1e293b' : '#e2e8f0'}` }}>
        <p style={{ margin: 0 }}>© 2026 {appName}</p>
        <p style={{ margin: '4px 0 0 0', opacity: 0.8 }}>🔐 All data stored locally • No tracking</p>
      </footer>
    </div>
  );
}

export default App;
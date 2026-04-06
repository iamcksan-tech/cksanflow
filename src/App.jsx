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
        <span style={{ fontSize: '20px', color: '#14b8a6' }}>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div style={{ padding: '0 20px 20px 20px', borderTop: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}` }}>{children}</div>}
    </div>
  );
}

// Progress Chart Component
function ProgressChart({ current, goal, label, color = '#14b8a6', darkMode, hideNumbers }) {
  const percentage = Math.min(100, Math.round((current / goal) * 100));
  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
        <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>{label}</span>
        <span style={{ fontWeight: '600', color: darkMode ? '#f3f4f6' : '#1f2937' }}>{hideNumbers ? '••••' : `${percentage}%`}</span>
      </div>
      <div style={{ width: '100%', height: '12px', background: darkMode ? '#374151' : '#e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
          borderRadius: '6px',
          transition: 'width 0.3s ease'
        }}></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '12px' }}>
        <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>{hideNumbers ? '¥••••' : `¥${current?.toLocaleString()}`}</span>
        <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>{hideNumbers ? 'Goal: ¥••••' : `Goal: ¥${goal?.toLocaleString()}`}</span>
      </div>
    </div>
  );
}

function App() {
  // Main State
  const [cashAvailable, setCashAvailable] = useState(() => loadData('cash', 0));
  const [savings, setSavings] = useState(() => loadData('savings', 0));
  const [creditCards, setCreditCards] = useState(() => loadData('creditCards', [
    { id: 1, name: 'SMBC Olive Card', limit: 500000, available: 350000, balance: 150000, paymentDate: '26th', closingDate: '11th', thisCyclePayment: 10000, nextCyclePayment: 0 }
  ]));
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ckSanFlow_darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [hideNumbers, setHideNumbers] = useState(() => {
    const saved = localStorage.getItem('ckSanFlow_hideNumbers');
    return saved ? JSON.parse(saved) : false;
  });

  // Daily Income
  const [dailyIncomes, setDailyIncomes] = useState(() => loadData('dailyIncomes', []));
  const [todayIncome, setTodayIncome] = useState('');

  // Card Expenses
  const [cardExpenses, setCardExpenses] = useState(() => loadData('cardExpenses', []));
  const [newExpense, setNewExpense] = useState({ cardId: '', amount: '', category: 'Shopping' });
  const [newCard, setNewCard] = useState({ name: '', limit: '', available: '', balance: '', paymentDate: '26th', thisCyclePayment: '', nextCyclePayment: '' });
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  // Monthly Goals
  const [monthlyGoals, setMonthlyGoals] = useState(() => loadData('monthlyGoals', [
    { id: 1, name: 'Emergency Fund', target: 200000, current: 50000, color: '#14b8a6', priority: 'high' },
    { id: 2, name: 'Vacation', target: 150000, current: 30000, color: '#8b5cf6', priority: 'medium' },
    { id: 3, name: 'New Laptop', target: 100000, current: 10000, color: '#f59e0b', priority: 'low' }
  ]));
  const [newGoal, setNewGoal] = useState({ name: '', target: '', color: '#14b8a6', priority: 'medium' });
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalAllocationPercent, setGoalAllocationPercent] = useState(() => loadData('goalAllocationPercent', 15));

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
  const [homeExpenses, setHomeExpenses] = useState(() => loadData('homeExpenses', { food: 0, gas: 0, electricity: 0 }));

  // Car Expenses (Capped at ¥2000/day)
  const [carExpenses, setCarExpenses] = useState(() => loadData('carExpenses', { dailyOil: 2000, maxDailyOil: 2000, totalThisMonth: 0 }));

  // Pensions & Insurance
  const [pensionsInsurance, setPensionsInsurance] = useState(() => loadData('pensionsInsurance', {
    nationalPension: 0, healthInsurance: 0, carInsurance: 0, lifeInsurance: 0, taxes: 0, total: 0
  }));

  // Monthly Summary
  const [monthlyIncome, setMonthlyIncome] = useState(() => loadData('monthlyIncome', 0));
  const [monthlyExpenses, setMonthlyExpenses] = useState(() => loadData('monthlyExpenses', 0));

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [appName, setAppName] = useState(() => loadData('appName', 'CkSanFlow'));
  const [showSmartPay, setShowSmartPay] = useState(false);

  // CALCULATIONS
  const totalDebts = creditCards.reduce((sum, card) => sum + card.balance, 0);
  const totalCreditAvailable = creditCards.reduce((sum, card) => sum + card.available, 0);
  const totalGoalsProgress = monthlyGoals.reduce((sum, goal) => sum + goal.current, 0);
  const totalGoalsTarget = monthlyGoals.reduce((sum, goal) => sum + goal.target, 0);

  // Helper: Calculate closing date from payment date
  const calculateClosingDate = (paymentDate) => {
    const date = parseInt(paymentDate);
    let closing = date - 15;
    if (closing <= 0) closing += 30;
    return closing.toString() + 'th';
  };

  // Helper: Calculate smart payment suggestion
  const calculateSmartPayment = () => {
    if (cashAvailable === 0) return [];
    const sortedCards = [...creditCards].filter(card => card.thisCyclePayment > 0).sort((a, b) => a.balance - b.balance);
    const payments = [];
    let remainingCash = cashAvailable;
    const totalPaymentsNeeded = sortedCards.reduce((sum, card) => sum + card.thisCyclePayment, 0);
    const paymentPercentage = Math.min(100, (cashAvailable / totalPaymentsNeeded) * 100);
    
    sortedCards.forEach(card => {
      const suggestedPayment = Math.round(card.thisCyclePayment * (paymentPercentage / 100));
      const actualPayment = Math.min(suggestedPayment, remainingCash);
      if (actualPayment > 0) {
        payments.push({ cardId: card.id, cardName: card.name, suggestedAmount: actualPayment, originalAmount: card.thisCyclePayment, percentage: Math.round((actualPayment / card.thisCyclePayment) * 100) });
        remainingCash -= actualPayment;
      }
    });
    return payments;
  };

  // Save data
  useEffect(() => {
    saveData('cash', cashAvailable);
    saveData('savings', savings);
    saveData('creditCards', creditCards);
    saveData('dailyIncomes', dailyIncomes);
    saveData('cardExpenses', cardExpenses);
    saveData('monthlyGoals', monthlyGoals);
    saveData('goalAllocationPercent', goalAllocationPercent);
    saveData('investmentPercent', investmentPercent);
    saveData('trustFund', trustFund);
    saveData('spusShares', spusShares);
    saveData('familySupport', familySupport);
    saveData('healthFunds', healthFunds);
    saveData('homeExpenses', homeExpenses);
    saveData('carExpenses', carExpenses);
    saveData('pensionsInsurance', pensionsInsurance);
    saveData('monthlyIncome', monthlyIncome);
    saveData('monthlyExpenses', monthlyExpenses);
    saveData('appName', appName);
    saveData('hideNumbers', hideNumbers);
  }, [cashAvailable, savings, creditCards, dailyIncomes, cardExpenses, monthlyGoals, goalAllocationPercent, investmentPercent, trustFund, spusShares, familySupport, healthFunds, homeExpenses, carExpenses, pensionsInsurance, monthlyIncome, monthlyExpenses, appName, hideNumbers]);

  // Dark mode & hide numbers
  useEffect(() => {
    const saved = localStorage.getItem('ckSanFlow_hideNumbers');
    if (saved) {
      const isHidden = JSON.parse(saved);
      setHideNumbers(isHidden);
    }
  }, []);

  // Handlers
  const handleAddIncome = () => {
    const amount = parseFloat(todayIncome);
    if (!amount || amount <= 0) { alert('Please enter a valid amount'); return; }

    const newIncome = { id: Date.now(), amount, date: new Date().toISOString().split('T')[0] };
    setDailyIncomes([newIncome, ...dailyIncomes]);
    setCashAvailable(cashAvailable + amount);
    setMonthlyIncome(monthlyIncome + amount);
    
    const investAmount = Math.round(amount * (investmentPercent / 100));
    setTrustFund(trustFund + investAmount);
    setSavings(savings + investAmount);
    
    const goalAmount = Math.round(amount * (goalAllocationPercent / 100));
    if (goalAmount > 0 && monthlyGoals.length > 0) {
      const incompleteGoals = monthlyGoals.filter(g => g.current < g.target);
      if (incompleteGoals.length > 0) {
        const perGoal = Math.round(goalAmount / incompleteGoals.length);
        setMonthlyGoals(monthlyGoals.map(goal => 
          incompleteGoals.find(g => g.id === goal.id) 
            ? { ...goal, current: Math.min(goal.target, goal.current + perGoal) }
            : goal
        ));
      }
    }
    
    setTodayIncome('');
    alert(`✅ ¥${hideNumbers ? '••••' : amount.toLocaleString()} added!`);
  };

  // NEW: Delete Recent Income
  const handleDeleteRecentIncome = (incomeId) => {
    const incomeToDelete = dailyIncomes.find(inc => inc.id === incomeId);
    if (!incomeToDelete) return;
    
    if (!confirm(`⚠️ Delete this income entry?

Amount: ¥${incomeToDelete.amount.toLocaleString()}
Date: ${incomeToDelete.date}

This will reverse:
- Cash: -¥${incomeToDelete.amount.toLocaleString()}
- Investment: -¥${Math.round(incomeToDelete.amount * (investmentPercent / 100)).toLocaleString()}
- Goals: -¥${Math.round(incomeToDelete.amount * (goalAllocationPercent / 100)).toLocaleString()}`)) {
      return;
    }

    const investAmount = Math.round(incomeToDelete.amount * (investmentPercent / 100));
    const goalAmount = Math.round(incomeToDelete.amount * (goalAllocationPercent / 100));
    
    // Reverse the effects
    setCashAvailable(cashAvailable - incomeToDelete.amount);
    setMonthlyIncome(monthlyIncome - incomeToDelete.amount);
    setTrustFund(trustFund - investAmount);
    setSavings(savings - investAmount);
    
    // Reverse goal contributions
    const incompleteGoalsAtTime = monthlyGoals.filter(g => g.current < g.target);
    if (incompleteGoalsAtTime.length > 0) {
      const perGoal = Math.round(goalAmount / incompleteGoalsAtTime.length);
      setMonthlyGoals(monthlyGoals.map(goal => 
        incompleteGoalsAtTime.find(g => g.id === goal.id) 
          ? { ...goal, current: Math.max(0, goal.current - perGoal) }
          : goal
      ));
    }
    
    // Remove from list
    setDailyIncomes(dailyIncomes.filter(inc => inc.id !== incomeId));
    
    alert(`🗑️ Income entry deleted!`);
  };

  const handleAddCard = () => {
    if (!newCard.name || !newCard.limit) { alert('Please fill in card name and limit'); return; }
    const closingDate = calculateClosingDate(newCard.paymentDate);
    const limit = parseFloat(newCard.limit) || 0;
    const available = parseFloat(newCard.available) || 0;
    const balance = parseFloat(newCard.balance) || 0;
    let finalAvailable = available, finalBalance = balance;
    
    if (available === 0 && balance === 0) { finalAvailable = limit; finalBalance = 0; }
    else if (available === 0 && balance > 0) { finalAvailable = limit - balance; }
    else if (balance === 0 && available > 0) { finalBalance = limit - available; }

    if (editingCard) {
      setCreditCards(creditCards.map(card => card.id === editingCard.id ? { ...card, name: newCard.name, limit, available: finalAvailable, balance: finalBalance, paymentDate: newCard.paymentDate, closingDate, thisCyclePayment: parseFloat(newCard.thisCyclePayment) || card.thisCyclePayment, nextCyclePayment: parseFloat(newCard.nextCyclePayment) || card.nextCyclePayment } : card));
      setEditingCard(null);
      alert(`✅ Card updated! Balance: ¥${hideNumbers ? '••••' : finalBalance.toLocaleString()}`);
    } else {
      setCreditCards([...creditCards, { id: Date.now(), name: newCard.name, limit, available: finalAvailable, balance: finalBalance, paymentDate: newCard.paymentDate, closingDate, thisCyclePayment: parseFloat(newCard.thisCyclePayment) || 0, nextCyclePayment: parseFloat(newCard.nextCyclePayment) || 0 }]);
      alert(`✅ Card added! Balance: ¥${hideNumbers ? '••••' : finalBalance.toLocaleString()}`);
    }
    setNewCard({ name: '', limit: '', available: '', balance: '', paymentDate: '26th', thisCyclePayment: '', nextCyclePayment: '' });
    setShowAddCard(false);
  };

  const handleEditCard = (card) => { setEditingCard(card); setNewCard({ name: card.name, limit: card.limit.toString(), available: card.available.toString(), balance: card.balance.toString(), paymentDate: card.paymentDate, thisCyclePayment: card.thisCyclePayment.toString(), nextCyclePayment: card.nextCyclePayment.toString() }); setShowAddCard(true); };
  const handleDeleteCard = (cardId) => { if (confirm('Delete this card?')) { setCreditCards(creditCards.filter(card => card.id !== cardId)); alert('🗑️ Card deleted'); } };

  const handleAddCardExpense = () => {
    const { cardId, amount, category } = newExpense;
    const expenseAmount = parseFloat(amount);
    if (!cardId || !expenseAmount || expenseAmount <= 0) { alert('Please select card and enter amount'); return; }
    const card = creditCards.find(c => c.id === parseInt(cardId));
    if (!card) return;
    if (expenseAmount > card.available) { alert('❌ Expense exceeds available credit!'); return; }

    const today = new Date().toISOString().split('T')[0];
    const expenseDay = new Date().getDate();
    const closingDay = parseInt(card.closingDate);
    const isCurrentCycle = expenseDay <= closingDay;

    setCreditCards(creditCards.map(c => {
      if (c.id === parseInt(cardId)) {
        const newBalance = c.balance + expenseAmount;
        const newAvailable = c.limit - newBalance;
        return { ...c, balance: newBalance, available: newAvailable, thisCyclePayment: isCurrentCycle ? c.thisCyclePayment + expenseAmount : c.thisCyclePayment, nextCyclePayment: isCurrentCycle ? c.nextCyclePayment : c.nextCyclePayment + expenseAmount };
      }
      return c;
    }));
    setCardExpenses([{ id: Date.now(), cardId: parseInt(cardId), cardName: card.name, amount: expenseAmount, category, date: today, cycle: isCurrentCycle ? 'This Month' : 'Next Month' }, ...cardExpenses]);
    setMonthlyExpenses(monthlyExpenses + expenseAmount);
    setNewExpense({ cardId: '', amount: '', category: 'Shopping' });
    alert(`✅ ¥${hideNumbers ? '••••' : expenseAmount.toLocaleString()} added (${isCurrentCycle ? 'This' : 'Next'} month)`);
  };

  const handlePayCard = (cardId, amount) => {
    if (amount > cashAvailable) { alert('❌ Insufficient cash!'); return; }
    setCreditCards(creditCards.map(card => {
      if (card.id === cardId) {
        const newBalance = card.balance - amount;
        const newAvailable = card.limit - Math.max(0, newBalance);
        return { ...card, balance: Math.max(0, newBalance), available: newAvailable, thisCyclePayment: Math.max(0, card.thisCyclePayment - amount) };
      }
      return card;
    }));
    setCashAvailable(cashAvailable - amount);
    setMonthlyExpenses(monthlyExpenses + amount);
    alert(`✅ ¥${hideNumbers ? '••••' : amount.toLocaleString()} paid!`);
  };

  const handleSmartPayAll = () => {
    const payments = calculateSmartPayment();
    if (payments.length === 0) { alert('❌ No payments to make or insufficient cash!'); return; }
    let totalToPay = payments.reduce((sum, p) => sum + p.suggestedAmount, 0);
    if (totalToPay > cashAvailable) { alert('❌ Insufficient cash for all payments!'); return; }
    payments.forEach(payment => handlePayCard(payment.cardId, payment.suggestedAmount));
    alert(`✅ Smart payment complete! ¥${hideNumbers ? '••••' : totalToPay.toLocaleString()} paid`);
  };

  const handleSendFamilySupport = (type, amount) => {
    if (amount > cashAvailable) { alert('❌ Insufficient cash!'); return; }
    setFamilySupport({ ...familySupport, [type]: { ...familySupport[type], lastPaid: new Date().toISOString().split('T')[0] } });
    setCashAvailable(cashAvailable - amount);
    setMonthlyExpenses(monthlyExpenses + amount);
    alert(`✅ ¥${hideNumbers ? '••••' : amount.toLocaleString()} sent!`);
  };

  const handleAddHealthFund = (amount) => {
    if (amount > cashAvailable) { alert('❌ Insufficient cash!'); return; }
    setHealthFunds({ ...healthFunds, hairTransplant: { ...healthFunds.hairTransplant, current: healthFunds.hairTransplant.current + amount } });
    setCashAvailable(cashAvailable - amount);
    setSavings(savings + amount);
    alert(`✅ ¥${hideNumbers ? '••••' : amount.toLocaleString()} added to health fund!`);
  };

  const handleAddHomeExpense = (type, amount) => {
    if (amount > cashAvailable) { alert('❌ Insufficient cash!'); return; }
    setHomeExpenses({ ...homeExpenses, [type]: homeExpenses[type] + amount });
    setCashAvailable(cashAvailable - amount);
    setMonthlyExpenses(monthlyExpenses + amount);
    alert(`✅ ¥${hideNumbers ? '••••' : amount.toLocaleString()} recorded!`);
  };

  const handleAddCarExpense = () => {
    if (carExpenses.dailyOil > cashAvailable) { alert('❌ Insufficient cash!'); return; }
    if (carExpenses.dailyOil > carExpenses.maxDailyOil) { alert(`⚠️ Daily oil expense capped at ¥${hideNumbers ? '••••' : carExpenses.maxDailyOil.toLocaleString()}`); return; }
    setCarExpenses({ ...carExpenses, totalThisMonth: carExpenses.totalThisMonth + carExpenses.dailyOil });
    setCashAvailable(cashAvailable - carExpenses.dailyOil);
    setMonthlyExpenses(monthlyExpenses + carExpenses.dailyOil);
    alert(`✅ ¥${hideNumbers ? '••••' : carExpenses.dailyOil.toLocaleString()} recorded!`);
  };

  const handleAddPensionInsurance = (type, amount) => {
    if (amount > cashAvailable) { alert('❌ Insufficient cash!'); return; }
    setPensionsInsurance({ ...pensionsInsurance, [type]: pensionsInsurance[type] + amount, total: pensionsInsurance.total + amount });
    setCashAvailable(cashAvailable - amount);
    setMonthlyExpenses(monthlyExpenses + amount);
    alert(`✅ ¥${hideNumbers ? '••••' : amount.toLocaleString()} recorded!`);
  };

  // Monthly Goals Handlers
  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target) { alert('Please fill in goal name and target'); return; }
    const target = parseFloat(newGoal.target);
    if (editingGoal) {
      setMonthlyGoals(monthlyGoals.map(goal => goal.id === editingGoal.id ? { ...goal, name: newGoal.name, target, color: newGoal.color, priority: newGoal.priority } : goal));
      setEditingGoal(null);
      alert('✅ Goal updated!');
    } else {
      setMonthlyGoals([...monthlyGoals, { id: Date.now(), name: newGoal.name, target, current: 0, color: newGoal.color, priority: newGoal.priority }]);
      alert('✅ Goal added!');
    }
    setNewGoal({ name: '', target: '', color: '#14b8a6', priority: 'medium' });
    setShowAddGoal(false);
  };

  const handleEditGoal = (goal) => { setEditingGoal(goal); setNewGoal({ name: goal.name, target: goal.target.toString(), color: goal.color, priority: goal.priority }); setShowAddGoal(true); };
  const handleDeleteGoal = (goalId) => { if (confirm('Delete this goal?')) { setMonthlyGoals(monthlyGoals.filter(g => g.id !== goalId)); alert('🗑️ Goal deleted'); } };
  
  const handleContributeToGoal = (goalId, amount) => {
    if (amount > cashAvailable) { alert('❌ Insufficient cash!'); return; }
    setMonthlyGoals(monthlyGoals.map(goal => goal.id === goalId ? { ...goal, current: Math.min(goal.target, goal.current + amount) } : goal));
    setCashAvailable(cashAvailable - amount);
    setSavings(savings + amount);
    alert(`✅ ¥${hideNumbers ? '••••' : amount.toLocaleString()} added to goal!`);
  };

  const handleReset = () => { if (confirm('⚠️ Reset ALL data?')) { localStorage.clear(); window.location.reload(); } };
  const handleExport = () => {
    const data = {};
    Object.keys(localStorage).forEach(key => { if (key.startsWith('ckSanFlow_')) { data[key] = localStorage.getItem(key); } });
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
  
  const toggleHideNumbers = () => {
    const newHide = !hideNumbers;
    setHideNumbers(newHide);
    localStorage.setItem('ckSanFlow_hideNumbers', newHide);
  };
  
  const getCategoryIcon = (category) => ({ 'Shopping': '🛒', 'Food': '🍽️', 'Gas': '⛽', 'Transport': '🚗', 'Entertainment': '🎬', 'Health': '💊', 'Other': '📦' }[category] || '📦');

  const smartPayments = calculateSmartPayment();

  return (
    <div className="App" style={{ minHeight: '100vh', background: darkMode ? '#111827' : '#f2f4f8', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: darkMode ? '#f3f4f6' : '#1f2937' }}>💰 {appName}</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Smart Financial Management</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowCustomize(!showCustomize)} style={{ padding: '10px 15px', background: darkMode ? '#374151' : 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '18px' }}>⚙️</button>
          <button onClick={toggleHideNumbers} style={{ padding: '10px 15px', background: hideNumbers ? '#8b5cf6' : (darkMode ? '#374151' : 'white'), border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '18px', color: hideNumbers ? 'white' : (darkMode ? '#f3f4f6' : '#1f2937') }} title="Hide/Show Numbers">👁️</button>
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
            <button onClick={toggleDarkMode} style={{ padding: '14px', background: darkMode ? '#fbbf24' : '#1f2937', color: darkMode ? '#1f2937' : 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>{darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
            <button onClick={toggleHideNumbers} style={{ padding: '14px', background: hideNumbers ? '#8b5cf6' : '#1f2937', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>{hideNumbers ? '👁️ Show Numbers' : '🙈 Hide Numbers'}</button>
            <button onClick={handleExport} style={{ padding: '14px', background: '#667eea', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>📦 Export Backup</button>
            <button onClick={handleReset} style={{ padding: '14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>🗑️ Reset All Data</button>
          </div>
        </div>
      )}

      {/* Dashboard - 4 Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #ccfbf1 0%, #f0fdfa 100%)', padding: '20px 15px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💵</div>
          <p style={{ margin: 0, fontSize: '11px', color: darkMode ? '#fff' : '#0d9488', fontWeight: '500' }}>Cash Available</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '22px', fontWeight: '700', color: darkMode ? '#fff' : '#115e59' }}>{hideNumbers ? '¥••••' : `¥${cashAvailable.toLocaleString()}`}</p>
        </div>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)' : 'linear-gradient(135deg, #cffafe 0%, #ecfeff 100%)', padding: '20px 15px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💳</div>
          <p style={{ margin: 0, fontSize: '11px', color: darkMode ? '#fff' : '#0e7490', fontWeight: '500' }}>Credit Available</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '22px', fontWeight: '700', color: darkMode ? '#fff' : '#164e63' }}>{hideNumbers ? '¥••••' : `¥${totalCreditAvailable.toLocaleString()}`}</p>
        </div>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)', padding: '20px 15px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
          <p style={{ margin: 0, fontSize: '11px', color: darkMode ? '#fff' : '#b91c1c', fontWeight: '500' }}>Total Debts</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '22px', fontWeight: '700', color: darkMode ? '#fff' : '#7f1d1d' }}>{hideNumbers ? '¥••••' : `¥${totalDebts.toLocaleString()}`}</p>
        </div>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' : 'linear-gradient(135deg, #ddd6fe 0%, #f3e8ff 100%)', padding: '20px 15px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
          <p style={{ margin: 0, fontSize: '11px', color: darkMode ? '#fff' : '#6d28d9', fontWeight: '500' }}>Goals Progress</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '22px', fontWeight: '700', color: darkMode ? '#fff' : '#5b21b6' }}>{hideNumbers ? '••••' : `${Math.round((totalGoalsProgress / totalGoalsTarget) * 100) || 0}%`}</p>
        </div>
      </div>

      {/* Daily Income */}
      <CollapsibleSection title="Daily income" icon="📊" darkMode={darkMode} defaultOpen={true}>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <input type="number" value={todayIncome} onChange={(e) => setTodayIncome(e.target.value)} placeholder="Amount (¥)" style={inputStyle(darkMode)} />
          <button onClick={handleAddIncome} style={{ padding: '14px 24px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>Add</button>
        </div>
        <p style={{ fontSize: '13px', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '10px' }}>💡 {hideNumbers ? '••%' : `${investmentPercent}%`} auto-invested, {hideNumbers ? '••%' : `${goalAllocationPercent}%`} to goals</p>
        {dailyIncomes.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: darkMode ? '#f3f4f6' : '#1f2937' }}>Recent:</p>
            {dailyIncomes.slice(0, 5).map((income, index) => (
              <div key={income.id} style={{ padding: '10px', background: darkMode ? '#374151' : '#f9fafb', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div>
                    <span style={{ color: darkMode ? '#f3f4f6' : '#1f2937' }}>{income.date}</span>
                    {index === 0 && <span style={{ marginLeft: '8px', fontSize: '11px', background: '#f59e0b', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>LATEST</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#14b8a6', fontWeight: '600' }}>{hideNumbers ? '+¥••••' : `+¥${income.amount.toLocaleString()}`}</span>
                  {index === 0 && (
                    <button
                      onClick={() => handleDeleteRecentIncome(income.id)}
                      style={{
                        padding: '6px 10px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                      title="Delete this income entry"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* Smart Payment Suggestion */}
      {smartPayments.length > 0 && (
        <CollapsibleSection title="💡 Smart Payment Suggestion" icon="🎯" darkMode={darkMode} defaultOpen={false}>
          <div style={{ marginTop: '15px' }}>
            <p style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '15px' }}>Based on your cash ({hideNumbers ? '¥••••' : `¥${cashAvailable.toLocaleString()}`}), here's the optimal payment plan:</p>
            {smartPayments.map((payment, index) => (
              <div key={index} style={{ padding: '12px', background: darkMode ? '#374151' : '#f9fafb', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: '600', color: darkMode ? '#f3f4f6' : '#1f2937' }}>{payment.cardName}</p>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Pay {hideNumbers ? '••%' : `${payment.percentage}%`} ({hideNumbers ? '¥••••' : `¥${payment.suggestedAmount.toLocaleString()}`} of {hideNumbers ? '¥••••' : `¥${payment.originalAmount.toLocaleString()}`})</p>
                </div>
                <button onClick={() => handlePayCard(payment.cardId, payment.suggestedAmount)} style={{ padding: '8px 16px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Pay</button>
              </div>
            ))}
            <button onClick={handleSmartPayAll} style={{ width: '100%', padding: '14px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', marginTop: '10px' }}>💰 Pay All Smartly ({hideNumbers ? '¥••••' : `¥${smartPayments.reduce((sum, p) => sum + p.suggestedAmount, 0).toLocaleString()}`})</button>
          </div>
        </CollapsibleSection>
      )}

      {/* Monthly Goals */}
      <CollapsibleSection title="🎯 Monthly Goals" icon="🎯" darkMode={darkMode} defaultOpen={true}>
        <div style={{ marginTop: '15px' }}>
          <label style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Auto-allocate from daily income:</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <input type="number" value={goalAllocationPercent} onChange={(e) => setGoalAllocationPercent(parseFloat(e.target.value) || 0)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, background: darkMode ? '#374151' : '#f9fafb', color: darkMode ? '#f3f4f6' : '#1f2937' }} />
            <span style={{ padding: '12px', color: darkMode ? '#f3f4f6' : '#1f2937', fontWeight: '600' }}>%</span>
          </div>
          <p style={{ fontSize: '13px', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '8px' }}>💡 Recommended: 10-20%</p>
        </div>

        {/* Add Goal Button */}
        <button onClick={() => { setShowAddGoal(true); setEditingGoal(null); setNewGoal({ name: '', target: '', color: '#14b8a6', priority: 'medium' }); }} style={{ width: '100%', padding: '14px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '16px', marginTop: '15px' }}>➕ Add New Goal</button>

        {/* Add/Edit Goal Form */}
        {showAddGoal && (
          <div style={{ marginTop: '15px', padding: '15px', background: darkMode ? '#374151' : '#f3f4f6', borderRadius: '12px', display: 'grid', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, color: darkMode ? '#f3f4f6' : '#1f2937' }}>{editingGoal ? '✏️ Edit Goal' : '➕ New Goal'}</h4>
              <button onClick={() => { setShowAddGoal(false); setEditingGoal(null); }} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✕ Cancel</button>
            </div>
            <input type="text" placeholder="Goal Name" value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} style={inputStyle(darkMode)} />
            <input type="number" placeholder="Target Amount (¥)" value={newGoal.target} onChange={(e) => setNewGoal({...newGoal, target: e.target.value})} style={inputStyle(darkMode)} />
            <select value={newGoal.color} onChange={(e) => setNewGoal({...newGoal, color: e.target.value})} style={inputStyle(darkMode)}>
              <option value="#14b8a6">🟢 Teal</option>
              <option value="#8b5cf6">🟣 Purple</option>
              <option value="#f59e0b">🟠 Orange</option>
              <option value="#ef4444">🔴 Red</option>
              <option value="#3b82f6">🔵 Blue</option>
            </select>
            <select value={newGoal.priority} onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})} style={inputStyle(darkMode)}>
              <option value="high">🔥 High Priority</option>
              <option value="medium">⚡ Medium Priority</option>
              <option value="low">✨ Low Priority</option>
            </select>
            <button onClick={handleAddGoal} style={{ padding: '14px', background: editingGoal ? '#f59e0b' : '#8b5cf6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>{editingGoal ? '💾 Update Goal' : '➕ Add Goal'}</button>
          </div>
        )}

        {/* Goals List with Charts */}
        <div style={{ marginTop: '20px' }}>
          {monthlyGoals.map((goal) => {
            const percentage = Math.min(100, Math.round((goal.current / goal.target) * 100));
            const isComplete = goal.current >= goal.target;
            return (
              <div key={goal.id} style={{ background: darkMode ? '#374151' : '#f9fafb', padding: '15px', borderRadius: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', color: darkMode ? '#f3f4f6' : '#1f2937' }}>
                      {goal.name} {goal.priority === 'high' && <span style={{ fontSize: '11px', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' }}>HIGH</span>}
                      {isComplete && <span style={{ fontSize: '11px', background: '#14b8a6', color: 'white', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' }}>✅ DONE</span>}
                    </h4>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEditGoal(goal)} style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                    <button onClick={() => handleDeleteGoal(goal.id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                  </div>
                </div>
                
                {/* Progress Chart */}
                <ProgressChart current={goal.current} goal={goal.target} label="Progress" color={goal.color} darkMode={darkMode} hideNumbers={hideNumbers} />
                
                {/* Contribute Button */}
                {!isComplete && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <input type="number" placeholder="Amount" id={`goal-${goal.id}`} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`, background: darkMode ? '#1f2937' : 'white', color: darkMode ? '#f3f4f6' : '#1f2937' }} />
                    <button onClick={() => handleContributeToGoal(goal.id, parseFloat(document.getElementById(`goal-${goal.id}`).value))} style={{ padding: '10px 20px', background: goal.color, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Contribute</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Credit Cards */}
      <CollapsibleSection title="Credit cards" icon="💳" darkMode={darkMode} defaultOpen={true}>
        <button onClick={() => { setShowAddCard(true); setEditingCard(null); setNewCard({ name: '', limit: '', available: '', balance: '', paymentDate: '26th', thisCyclePayment: '', nextCyclePayment: '' }); }} style={{ width: '100%', padding: '16px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', marginTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>➕ Add New Card</button>
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
            <button onClick={handleAddCard} style={{ padding: '14px', background: editingCard ? '#f59e0b' : '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>{editingCard ? '💾 Update Card' : '➕ Add Card'}</button>
          </div>
        )}
        {/* Card List */}
        <div style={{ marginTop: '15px' }}>
          {creditCards.map((card) => (
            <div key={card.id} style={{ background: darkMode ? '#374151' : '#f9fafb', padding: '15px', borderRadius: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '16px', color: darkMode ? '#f3f4f6' : '#1f2937' }}>{card.name}</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEditCard(card)} style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                  <button onClick={() => handleDeleteCard(card.id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                </div>
              </div>
              <div style={{ padding: '10px', background: darkMode ? '#1f2937' : '#e5e7eb', borderRadius: '8px', marginBottom: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>📅 Closing:</span><strong style={{ color: darkMode ? '#f3f4f6' : '#1f2937' }}>{card.closingDate} of month</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}><span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>💰 Payment:</span><strong style={{ color: darkMode ? '#f3f4f6' : '#1f2937' }}>{card.paymentDate} of month</strong></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', marginBottom: '10px' }}>
                <div><span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Limit:</span> <strong style={{ color: darkMode ? '#f3f4f6' : '#1f2937' }}>{hideNumbers ? '¥••••' : `¥${card.limit.toLocaleString()}`}</strong></div>
                <div><span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Available:</span> <strong style={{ color: '#14b8a6' }}>{hideNumbers ? '¥••••' : `¥${card.available.toLocaleString()}`}</strong></div>
                <div style={{ gridColumn: 'span 2' }}><span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Balance:</span> <strong style={{ color: '#ef4444', fontSize: '16px' }}>{hideNumbers ? '¥••••' : `¥${card.balance.toLocaleString()}`}</strong></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div style={{ padding: '10px', background: darkMode ? '#059669' : '#ccfbf1', borderRadius: '8px' }}><p style={{ margin: 0, fontSize: '11px', color: darkMode ? '#fff' : '#0d9488' }}>This Month</p><p style={{ margin: '3px 0 0 0', fontSize: '16px', fontWeight: '700', color: darkMode ? '#fff' : '#115e59' }}>{hideNumbers ? '¥••••' : `¥${card.thisCyclePayment.toLocaleString()}`}</p></div>
                <div style={{ padding: '10px', background: darkMode ? '#0891b2' : '#cffafe', borderRadius: '8px' }}><p style={{ margin: 0, fontSize: '11px', color: darkMode ? '#fff' : '#0e7490' }}>Next Month</p><p style={{ margin: '3px 0 0 0', fontSize: '16px', fontWeight: '700', color: darkMode ? '#fff' : '#164e63' }}>{hideNumbers ? '¥••••' : `¥${card.nextCyclePayment.toLocaleString()}`}</p></div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" placeholder="Amount" id={`pay-${card.id}`} defaultValue={card.thisCyclePayment} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`, background: darkMode ? '#1f2937' : 'white', color: darkMode ? '#f3f4f6' : '#1f2937' }} />
                <button onClick={() => handlePayCard(card.id, parseFloat(document.getElementById(`pay-${card.id}`).value) || card.thisCyclePayment)} style={{ padding: '10px 20px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Pay</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => { setShowAddCard(true); setEditingCard(null); setNewCard({ name: '', limit: '', available: '', balance: '', paymentDate: '26th', thisCyclePayment: '', nextCyclePayment: '' }); }} style={{ width: '100%', padding: '16px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>➕ Add Another Card</button>
        {cardExpenses.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: darkMode ? '#f3f4f6' : '#1f2937' }}>📜 Recent Expenses:</p>
            {cardExpenses.slice(0, 10).map((expense) => (
              <div key={expense.id} style={{ padding: '12px', background: darkMode ? '#374151' : '#f9fafb', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: darkMode ? '#f3f4f6' : '#1f2937' }}>{getCategoryIcon(expense.category)} {expense.category}</p><p style={{ margin: '3px 0 0 0', fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280' }}>{expense.cardName} • {expense.date}</p></div>
                <div style={{ textAlign: 'right' }}><p style={{ margin: 0, fontWeight: '600', color: '#ef4444' }}>{hideNumbers ? '¥••••' : `¥${expense.amount.toLocaleString()}`}</p><p style={{ margin: '3px 0 0 0', fontSize: '11px', color: expense.cycle === 'This Month' ? '#14b8a6' : '#f59e0b' }}>{expense.cycle}</p></div>
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
        <div style={{ marginTop: '20px', padding: '15px', background: darkMode ? '#059669' : '#ccfbf1', borderRadius: '12px' }}><p style={{ margin: 0, fontSize: '13px', color: darkMode ? '#fff' : '#0d9488' }}>Trust Fund Total</p><p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: '700', color: darkMode ? '#fff' : '#115e59' }}>{hideNumbers ? '¥••••' : `¥${trustFund.toLocaleString()}`}</p></div>
        <div style={{ marginTop: '15px', padding: '15px', background: darkMode ? '#0891b2' : '#cffafe', borderRadius: '12px' }}><p style={{ margin: 0, fontSize: '13px', color: darkMode ? '#fff' : '#0e7490' }}>SPUS Shares</p><p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: '700', color: darkMode ? '#fff' : '#164e63' }}>{hideNumbers ? '•••• shares' : `${spusShares} shares`}</p></div>
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
              <div><p style={{ margin: 0, fontWeight: '600', color: darkMode ? '#f3f4f6' : '#1f2937' }}>🇯🇵 Parents (Japan)</p><p style={{ margin: '5px 0 0 0', fontSize: '13px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Monthly: {hideNumbers ? '¥••••' : `¥${familySupport.parents.amount.toLocaleString()}`}</p><p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#f59e0b' }}>📅 Scheduled: {familySupport.parents.scheduledDate}</p>{familySupport.parents.lastPaid && <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#14b8a6' }}>✓ Last: {familySupport.parents.lastPaid}</p>}</div>
              <button onClick={() => handleSendFamilySupport('parents', familySupport.parents.amount)} style={{ padding: '10px 20px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Send</button>
            </div>
          </div>
          <div style={{ padding: '15px', background: darkMode ? '#374151' : '#f9fafb', borderRadius: '12px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><p style={{ margin: 0, fontWeight: '600', color: darkMode ? '#f3f4f6' : '#1f2937' }}>🇮🇹 Daughter (Italy)</p><p style={{ margin: '5px 0 0 0', fontSize: '13px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Monthly: {hideNumbers ? '¥••••' : `¥${familySupport.daughter.amount.toLocaleString()}`}</p><p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#f59e0b' }}>📅 Scheduled: {familySupport.daughter.scheduledDate}</p>{familySupport.daughter.lastPaid && <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#14b8a6' }}>✓ Last: {familySupport.daughter.lastPaid}</p>}</div>
              <button onClick={() => handleSendFamilySupport('daughter', familySupport.daughter.amount)} style={{ padding: '10px 20px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Send</button>
            </div>
          </div>
          <div style={{ padding: '15px', background: darkMode ? '#374151' : '#f9fafb', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><p style={{ margin: 0, fontWeight: '600', color: darkMode ? '#f3f4f6' : '#1f2937' }}>🎁 Other Expenses</p><p style={{ margin: '5px 0 0 0', fontSize: '13px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Monthly: {hideNumbers ? '¥••••' : `¥${familySupport.other.amount.toLocaleString()}`}</p></div>
              <button onClick={() => handleSendFamilySupport('other', familySupport.other.amount)} style={{ padding: '10px 20px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Send</button>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Health Funds */}
      <CollapsibleSection title="Health funds" icon="🏥" darkMode={darkMode}>
        <div style={{ marginTop: '15px', padding: '15px', background: darkMode ? '#374151' : '#f9fafb', borderRadius: '12px' }}>
          <p style={{ margin: 0, fontWeight: '600', color: darkMode ? '#f3f4f6' : '#1f2937' }}>💇 Hair Transplant Plan</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}><span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Saved:</span><strong style={{ color: '#14b8a6' }}>{hideNumbers ? '¥••••' : `¥${healthFunds.hairTransplant.current.toLocaleString()}`} / {hideNumbers ? '¥••••' : `¥${healthFunds.hairTransplant.goal.toLocaleString()}`}</strong></div>
          <div style={{ width: '100%', height: '8px', background: darkMode ? '#1f2937' : '#e5e7eb', borderRadius: '4px', marginTop: '10px', overflow: 'hidden' }}><div style={{ width: `${(healthFunds.hairTransplant.current / healthFunds.hairTransplant.goal) * 100}%`, height: '100%', background: '#14b8a6', borderRadius: '4px' }}></div></div>
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
        <div style={{ marginTop: '15px', padding: '12px', background: darkMode ? '#374151' : '#f9fafb', borderRadius: '10px' }}><p style={{ margin: 0, fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280' }}>This Month Total: <strong style={{ color: darkMode ? '#f3f4f6' : '#1f2937' }}>{hideNumbers ? '¥••••' : `¥${(homeExpenses.food + homeExpenses.gas + homeExpenses.electricity).toLocaleString()}`}</strong></p></div>
      </CollapsibleSection>

      {/* Car Expenses (Capped at ¥2000) */}
      <CollapsibleSection title="Car expenses" icon="🚗" darkMode={darkMode}>
        <div style={{ marginTop: '15px' }}>
          <div style={{ padding: '15px', background: darkMode ? '#374151' : '#f9fafb', borderRadius: '12px', marginBottom: '15px' }}>
            <p style={{ margin: 0, fontWeight: '600', color: darkMode ? '#f3f4f6' : '#1f2937' }}>⛽ Daily Oil</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}><span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Per Day:</span><strong style={{ color: '#f59e0b' }}>{hideNumbers ? '¥••••' : `¥${carExpenses.dailyOil.toLocaleString()}`} (Max: {hideNumbers ? '¥••••' : `¥${carExpenses.maxDailyOil.toLocaleString()}`})</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}><span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>This Month:</span><strong style={{ color: '#ef4444' }}>{hideNumbers ? '¥••••' : `¥${carExpenses.totalThisMonth.toLocaleString()}`}</strong></div>
          </div>
          <button onClick={handleAddCarExpense} style={{ width: '100%', padding: '14px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>Add Today's Oil ({hideNumbers ? '¥••••' : `¥${carExpenses.dailyOil.toLocaleString()}`})</button>
        </div>
      </CollapsibleSection>

      {/* Pensions & Insurance */}
      <CollapsibleSection title="Pensions & Insurance" icon="🛡️" darkMode={darkMode}>
        <div style={{ marginTop: '15px', display: 'grid', gap: '10px' }}>
          {[{ key: 'nationalPension', label: '🏛️ National Pension' }, { key: 'healthInsurance', label: '🏥 Health Insurance' }, { key: 'carInsurance', label: '🚗 Car Insurance' }, { key: 'lifeInsurance', label: '💼 Life Insurance' }, { key: 'taxes', label: '📋 Taxes' }].map((item) => (
            <div key={item.key} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ width: '150px', color: darkMode ? '#f3f4f6' : '#1f2937', fontWeight: '500', fontSize: '14px' }}>{item.label}</span>
              <input type="number" placeholder="Amount" id={`pension-${item.key}`} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, background: darkMode ? '#374151' : '#f9fafb', color: darkMode ? '#f3f4f6' : '#1f2937' }} />
              <button onClick={() => handleAddPensionInsurance(item.key, parseFloat(document.getElementById(`pension-${item.key}`).value))} style={{ padding: '12px 20px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Add</button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '15px', padding: '15px', background: darkMode ? '#7c3aed' : '#ddd6fe', borderRadius: '12px' }}><p style={{ margin: 0, fontSize: '14px', color: darkMode ? '#fff' : '#6d28d9' }}>Total This Month: <strong style={{ fontSize: '18px' }}>{hideNumbers ? '¥••••' : `¥${pensionsInsurance.total.toLocaleString()}`}</strong></p></div>
      </CollapsibleSection>

      {/* Monthly Summary */}
      <CollapsibleSection title="Monthly summary" icon="📈" darkMode={darkMode} defaultOpen={true}>
        <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div style={{ padding: '15px', background: darkMode ? '#059669' : '#ccfbf1', borderRadius: '12px', textAlign: 'center' }}><p style={{ margin: 0, fontSize: '12px', color: darkMode ? '#fff' : '#0d9488' }}>M Income</p><p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: '700', color: darkMode ? '#fff' : '#115e59' }}>{hideNumbers ? '¥••••' : `¥${monthlyIncome.toLocaleString()}`}</p></div>
          <div style={{ padding: '15px', background: darkMode ? '#dc2626' : '#fee2e2', borderRadius: '12px', textAlign: 'center' }}><p style={{ margin: 0, fontSize: '12px', color: darkMode ? '#fff' : '#b91c1c' }}>M Expenses</p><p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: '700', color: darkMode ? '#fff' : '#7f1d1d' }}>{hideNumbers ? '¥••••' : `¥${monthlyExpenses.toLocaleString()}`}</p></div>
          <div style={{ padding: '15px', background: darkMode ? '#0891b2' : '#cffafe', borderRadius: '12px', textAlign: 'center' }}><p style={{ margin: 0, fontSize: '12px', color: darkMode ? '#fff' : '#0e7490' }}>M Savings</p><p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: '700', color: darkMode ? '#fff' : '#164e63' }}>{hideNumbers ? '¥••••' : `¥${savings.toLocaleString()}`}</p></div>
        </div>
      </CollapsibleSection>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '20px', color: darkMode ? '#6b7280' : '#9ca3af', fontSize: '13px', marginTop: '20px' }}><p style={{ margin: 0 }}>© 2026 {appName} • Smart Financial Management</p></footer>
    </div>
  );
}

function inputStyle(darkMode) {
  return { padding: '12px', borderRadius: '10px', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, background: darkMode ? '#374151' : '#f9fafb', color: darkMode ? '#f3f4f6' : '#1f2937', fontSize: '16px' };
}

export default App;
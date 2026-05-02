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

// Collapsible Section
function CollapsibleSection({ title, icon, children, defaultOpen = false, darkMode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '16px',
      marginBottom: '16px',
      overflow: 'hidden',
      boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
    }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{ width: '100%', padding: '18px 20px', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: darkMode ? '#f8fafc' : '#0f172a', fontWeight: '600', fontSize: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>{icon}</span>
          <span>{title}</span>
        </div>
        <span style={{ fontSize: '20px', color: '#14b8a6', fontWeight: '300', transform: isOpen ? 'rotate(0)' : 'rotate(-90deg)' }}>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div style={{ padding: '0 20px 20px 20px', borderTop: `1px solid ${darkMode ? '#334155' : '#f1f5f9'}` }}>{children}</div>}
    </div>
  );
}

// Horizontal Progress Bar
function HorizontalProgressBar({ label, current, target, color, darkMode }) {
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
        <span style={{ color: darkMode ? '#94a3b8' : '#647480', fontWeight: '500' }}>{label}</span>
        <span style={{ color: darkMode ? '#f8fafc' : '#0f172a', fontWeight: '600' }}>{CONFIG.currency}{current.toLocaleString()} / {CONFIG.currency}{target.toLocaleString()} ({percentage}%)</span>
      </div>
      <div style={{ width: '100%', height: '10px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '6px' }}></div>
      </div>
    </div>
  );
}

// Editable Number
function EditableNumber({ value, onChange, prefix = CONFIG.currency, darkMode, hideNumbers, fontSize = '16px' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const handleSave = () => { const num = parseFloat(editValue.replace(/,/g, '')); if (!isNaN(num)) onChange(num); setIsEditing(false); };
  if (isEditing) return <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()} autoFocus style={{ background: darkMode ? '#0f172a' : 'white', border: '2px solid #14b8a6', borderRadius: '8px', padding: '6px 10px', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: fontSize, fontWeight: '700', width: '120px', outline: 'none' }} />;
  return <span onClick={() => setIsEditing(true)} style={{ cursor: 'pointer', fontSize: fontSize, fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>{hideNumbers ? '••••' : `${prefix}${value.toLocaleString()}`}</span>;
}

// Empty State
function EmptyState({ icon, title, message, onAction, actionText, darkMode }) {
  return (
    <div style={{ padding: '30px 20px', textAlign: 'center', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', border: `2px dashed ${darkMode ? '#334155' : '#e2e8f0'}` }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
      <h4 style={{ margin: '0 0 8px 0', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px', fontWeight: '600' }}>{title}</h4>
      <p style={{ margin: '0 0 16px 0', color: darkMode ? '#94a3b8' : '#647480', fontSize: '14px' }}>{message}</p>
      {onAction && <button onClick={onAction} style={{ padding: '10px 24px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>{actionText}</button>}
    </div>
  );
}

// Main App
function App() {
  const [currentMonth, setCurrentMonth] = useState(() => localStorage.getItem('ckSanFlow_currentMonth') || new Date().toISOString().slice(0, 7));
  const [lastUpdated, setLastUpdated] = useState(() => loadData('lastUpdated', formatJST()));

  // Main State
  const [cashAvailable, setCashAvailable] = useState(() => loadData(`cash_${currentMonth}`, 0));
  const [savings, setSavings] = useState(() => loadData(`savings_${currentMonth}`, 0));
  const [creditCards, setCreditCards] = useState(() => loadData(`creditCards_${currentMonth}`, []));
  const [darkMode, setDarkMode] = useState(() => { const s = localStorage.getItem('ckSanFlow_darkMode'); return s ? JSON.parse(s) : false; });
  const [hideNumbers, setHideNumbers] = useState(() => { const s = localStorage.getItem('ckSanFlow_hideNumbers'); return s ? JSON.parse(s) : false; });
  
  // Monthly Income Goal
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState(() => {
    const saved = loadData(`monthlyIncomeGoal_${currentMonth}`, null);
    return saved !== null ? saved : 300000;
  });
  
  // Monthly Income
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

  // Credit Cards
  const [newCard, setNewCard] = useState({ name: '', limit: '', available: '', balance: '', paymentDate: '26th', thisCyclePayment: '', nextCyclePayment: '' });
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  // Monthly Goals
  const [monthlyGoals, setMonthlyGoals] = useState(() => loadData(`monthlyGoals_${currentMonth}`, []));
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', color: '#14b8a6', priority: 'medium' });

  // Auto-Hold
  const [autoHoldEnabled, setAutoHoldEnabled] = useState(() => loadData('autoHoldEnabled', true));
  const [debtThresholdPercent, setDebtThresholdPercent] = useState(() => loadData('debtThresholdPercent', CONFIG.debtHoldThreshold));

  // Car Expenses
  const [carExpenses, setCarExpenses] = useState(() => loadData(`carExpenses_${currentMonth}`, { dailyOil: CONFIG.maxDailyOil, maxDailyOil: CONFIG.maxDailyOil, totalThisMonth: 0 }));

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [appName, setAppName] = useState(() => loadData('appName', 'CkSanFlow'));
  const [expenseFilter, setExpenseFilter] = useState('This Month');
  const [searchQuery, setSearchQuery] = useState('');

  // CALCULATIONS
  const totalDebts = creditCards.reduce((sum, card) => sum + card.balance, 0);
  const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.limit, 0);
  const totalCreditAvailable = creditCards.reduce((sum, card) => sum + card.available, 0);
  const debtPercentage = totalCreditLimit > 0 ? (totalDebts / totalCreditLimit) * 100 : 100;
  const shouldHoldSavings = autoHoldEnabled && debtPercentage > debtThresholdPercent;
  const recommendedSavings = Math.round(monthlyIncome * (CONFIG.defaultSavingsPercent / 100));

  // Save with timestamp
  const saveWithTimestamp = (key, value) => { saveData(key, value); const now = formatJST(); setLastUpdated(now); saveData('lastUpdated', now); };

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
  useEffect(() => { const s = localStorage.getItem('ckSanFlow_darkMode'); if (s) { const isDark = JSON.parse(s); setDarkMode(isDark); document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light'); } }, []);

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

  const calculateClosingDate = (paymentDate) => { const date = parseInt(paymentDate); let closing = date - 15; if (closing <= 0) closing += 30; return closing.toString() + 'th'; };

  // ✅ Daily Income
  const handleAddIncome = () => {
    const amount = parseFloat(todayIncome);
    if (!validateAmount(amount)) { alert('Please enter a valid amount'); return; }
    const newIncome = { id: Date.now(), amount, date: new Date().toISOString().split('T')[0] };
    setDailyIncomes([newIncome, ...dailyIncomes]);
    setCashAvailable(cashAvailable + amount);
    setMonthlyIncome(monthlyIncome + amount);
    setTodayIncome('');
    alert(`✅ ${CONFIG.currency}${amount.toLocaleString()} added to Cash Balance!\nMonthly Income: ${CONFIG.currency}${(monthlyIncome + amount).toLocaleString()}`);
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
    setDailyIncomes([ { ...latestIncome, amount }, ...dailyIncomes.slice(1) ]);
    alert('✅ Income updated!');
  };

  const handleDeleteIncome = () => {
    if (dailyIncomes.length === 0) return;
    const latestIncome = dailyIncomes[0];
    if (!confirm(`Delete this income? ${CONFIG.currency}${latestIncome.amount.toLocaleString()} will be removed from Cash Balance.`)) return;
    setCashAvailable(cashAvailable - latestIncome.amount);
    setMonthlyIncome(monthlyIncome - latestIncome.amount);
    setDailyIncomes(dailyIncomes.slice(1));
    alert('🗑️ Income deleted!');
  };

  // ✅ FIXED: Add Card function
  const handleAddCard = () => {
    if (!newCard.name || !newCard.limit) { 
      alert('Please fill in card name and limit'); 
      return; 
    }
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
      alert('✅ Card updated!');
    } else {
      setCreditCards([...creditCards, { id: Date.now(), name: newCard.name, limit, available: finalAvailable, balance: finalBalance, paymentDate: newCard.paymentDate, closingDate, thisCyclePayment: parseFloat(newCard.thisCyclePayment) || 0, nextCyclePayment: parseFloat(newCard.nextCyclePayment) || 0 }]);
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
    const { cardId, amount, category, description } = newExpense;
    const expenseAmount = parseFloat(amount);
    if (!validateAmount(expenseAmount)) { alert('Please enter a valid amount'); return; }
    if (editingExpense) {
      const oldAmount = editingExpense.amount;
      const wasCash = editingExpense.cardId === 'cash';
      const isCash = cardId === 'cash';
      if (wasCash) setCashAvailable(cashAvailable + oldAmount);
      else {
        setCreditCards(creditCards.map(c => {
          if (c.id === parseInt(editingExpense.cardId)) { const newBalance = c.balance - oldAmount; return { ...c, balance: Math.max(0, newBalance), available: c.limit - newBalance }; }
          return c;
        }));
      }
      if (isCash) setCashAvailable(cashAvailable - expenseAmount);
      else {
        setCreditCards(creditCards.map(c => {
          if (c.id === parseInt(cardId)) { const newBalance = c.balance + expenseAmount; return { ...c, balance: newBalance, available: c.limit - newBalance }; }
          return c;
        }));
      }
      setCardExpenses(cardExpenses.map(exp => exp.id === editingExpense.id ? { ...exp, cardId, amount: expenseAmount, category: autoCategorize(description) || category, description } : exp));
      setEditingExpense(null);
      alert('✅ Expense updated!');
    } else {
      if (!cardId) { alert('Please select Cash or a card'); return; }
      if (cardId === 'cash') {
        if (expenseAmount > cashAvailable) { alert('❌ Insufficient cash!'); return; }
        setCashAvailable(cashAvailable - expenseAmount);
      } else {
        const card = creditCards.find(c => c.id === parseInt(cardId));
        if (!card) return;
        if (expenseAmount > card.available) { alert('❌ Expense exceeds available credit!'); return; }
        setCreditCards(creditCards.map(c => {
          if (c.id === parseInt(cardId)) { const newBalance = c.balance + expenseAmount; return { ...c, balance: newBalance, available: c.limit - newBalance }; }
          return c;
        }));
      }
      const today = new Date().toISOString().split('T')[0];
      setCardExpenses([{ id: Date.now(), cardId, amount: expenseAmount, category: autoCategorize(description) || category, description, date: today }, ...cardExpenses]);
      alert(`${CONFIG.currency}${expenseAmount.toLocaleString()} recorded!`);
    }
    setNewExpense({ cardId: '', amount: '', category: 'Shopping', description: '' });
  };

  const handleDeleteExpense = (expenseId) => {
    const expense = cardExpenses.find(e => e.id === expenseId);
    if (!expense) return;
    if (!confirm(`Delete this expense? ${CONFIG.currency}${expense.amount.toLocaleString()} will be refunded.`)) return;
    if (expense.cardId === 'cash') setCashAvailable(cashAvailable + expense.amount);
    else {
      setCreditCards(creditCards.map(c => {
        if (c.id === parseInt(expense.cardId)) { const newBalance = c.balance - expense.amount; return { ...c, balance: Math.max(0, newBalance), available: c.limit - newBalance }; }
        return c;
      }));
    }
    setCardExpenses(cardExpenses.filter(e => e.id !== expenseId));
    alert('🗑️ Expense deleted!');
  };

  const handleEditExpense = (expense) => { setEditingExpense(expense); setNewExpense({ cardId: expense.cardId, amount: expense.amount.toString(), category: expense.category, description: expense.description || '' }); };

  const handlePayCard = (cardId, amount) => {
    if (!validateAmount(amount)) { alert('Please enter a valid amount'); return; }
    if (amount > cashAvailable) { alert('❌ Insufficient cash!'); return; }
    setCreditCards(creditCards.map(card => {
      if (card.id === cardId) { const newBalance = card.balance - amount; const newAvailable = card.limit - Math.max(0, newBalance); return { ...card, balance: Math.max(0, newBalance), available: newAvailable, thisCyclePayment: Math.max(0, card.thisCyclePayment - amount) }; }
      return card;
    }));
    setCashAvailable(cashAvailable - amount);
    alert(`${CONFIG.currency}${amount.toLocaleString()} paid!`);
  };

  const handleAddCarExpense = () => {
    if (carExpenses.dailyOil > cashAvailable) { alert('❌ Insufficient cash!'); return; }
    setCarExpenses({ ...carExpenses, totalThisMonth: carExpenses.totalThisMonth + carExpenses.dailyOil });
    setCashAvailable(cashAvailable - carExpenses.dailyOil);
    alert(`${CONFIG.currency}${carExpenses.dailyOil.toLocaleString()} recorded from Cash Balance!`);
  };

  // ✅ FIXED: Add Goal function
  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target) { 
      alert('Please fill in goal name and target amount'); 
      return; 
    }
    const target = parseFloat(newGoal.target);
    if (!validateAmount(target)) { 
      alert('Please enter a valid target amount'); 
      return; 
    }
    
    if (editingGoal) {
      setMonthlyGoals(monthlyGoals.map(goal => 
        goal.id === editingGoal.id 
          ? { ...goal, name: newGoal.name, target, color: newGoal.color, priority: newGoal.priority } 
          : goal
      ));
      setEditingGoal(null);
      alert('✅ Goal updated!');
    } else {
      const newGoalWithId = { 
        id: Date.now(), 
        name: newGoal.name, 
        target, 
        current: 0, 
        color: newGoal.color, 
        priority: newGoal.priority 
      };
      setMonthlyGoals([...monthlyGoals, newGoalWithId]);
      alert('✅ Goal added!');
    }
    setNewGoal({ name: '', target: '', color: '#14b8a6', priority: 'medium' });
    setShowAddGoal(false);
  };

  const handleEditGoal = (goal) => { 
    setEditingGoal(goal); 
    setNewGoal({ 
      name: goal.name, 
      target: goal.target.toString(), 
      color: goal.color, 
      priority: goal.priority 
    }); 
    setShowAddGoal(true); 
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
    setMonthlyGoals(monthlyGoals.map(goal => 
      goal.id === goalId 
        ? { ...goal, current: Math.min(goal.target, goal.current + amount) } 
        : goal
    ));
    setCashAvailable(cashAvailable - amount);
    if (!shouldHoldSavings) setSavings(savings + amount);
    alert(`${CONFIG.currency}${amount.toLocaleString()} added to goal!`);
  };

  const handleReset = () => { if (confirm('⚠️ Reset ALL data?')) { localStorage.clear(); window.location.reload(); } };
  
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

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result);
        Object.keys(data).forEach(key => { if (key.startsWith('ckSanFlow_')) { localStorage.setItem(key, data[key]); } });
        alert('✅ Data imported! Reloading...');
        window.location.reload();
      } catch (err) { alert('❌ Import failed'); }
    };
    reader.readAsText(file);
  };
  
  const toggleDarkMode = () => { const newMode = !darkMode; setDarkMode(newMode); document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light'); localStorage.setItem('ckSanFlow_darkMode', newMode); };
  const toggleHideNumbers = () => { const newHide = !hideNumbers; setHideNumbers(newHide); localStorage.setItem('ckSanFlow_hideNumbers', newHide); };
  const getCategoryIcon = (category) => ({ 'Shopping': '🛒', 'Food': '🍽️', 'Gas': '⛽', 'Transport': '🚗', 'Entertainment': '🎬', 'Health': '💊', 'Other': '📦' }[category] || '📦');

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

  const filteredExpenses = cardExpenses.filter(expense => {
    const matchesSearch = !searchQuery || expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) || expense.category.toLowerCase().includes(searchQuery.toLowerCase()) || expense.amount.toString().includes(searchQuery);
    if (expenseFilter === 'This Week') { const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7); return matchesSearch && new Date(expense.date) >= weekAgo; }
    else if (expenseFilter === 'This Month') { return matchesSearch && expense.date.startsWith(currentMonth); }
    return matchesSearch;
  });

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
          <EditableNumber value={cashAvailable} onChange={setCashAvailable} prefix={CONFIG.currency} darkMode={darkMode} hideNumbers={hideNumbers} fontSize="24px" />
        </div>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)', padding: '20px 16px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚠️</div>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>DEBTS</p>
          <p style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: '800', color: 'white' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${totalDebts.toLocaleString()}`}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>{debtPercentage.toFixed(1)}% of limit</p>
        </div>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' : 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)', padding: '20px 16px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📊</div>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>INCOME GOAL</p>
          <EditableNumber value={monthlyIncomeGoal} onChange={setMonthlyIncomeGoal} prefix={CONFIG.currency} darkMode={darkMode} hideNumbers={hideNumbers} fontSize="20px" />
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.9)' }}>{hideNumbers ? '••••' : `${Math.round((monthlyIncome / monthlyIncomeGoal) * 100)}%`} achieved</p>
        </div>
        <div style={{ background: shouldHoldSavings ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', padding: '20px 16px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>{shouldHoldSavings ? '⏸️' : '💰'}</div>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>SAVINGS</p>
          <EditableNumber value={savings} onChange={setSavings} prefix={CONFIG.currency} darkMode={darkMode} hideNumbers={hideNumbers} fontSize="20px" />
        </div>
      </div>

      <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px', fontWeight: '700' }}>📊 Financial Overview</h3>
        <HorizontalProgressBar label="Debt Reduction" current={totalCreditLimit - totalDebts} target={totalCreditLimit} color="#ef4444" darkMode={darkMode} />
        <HorizontalProgressBar label="Monthly Income Goal" current={monthlyIncome} target={monthlyIncomeGoal} color="#14b8a6" darkMode={darkMode} />
        <HorizontalProgressBar label="Savings Progress" current={savings} target={recommendedSavings} color={shouldHoldSavings ? '#f59e0b' : '#3b82f6'} darkMode={darkMode} />
      </div>

      {showSettings && (
        <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px', fontWeight: '700' }}>Settings</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <button onClick={toggleDarkMode} style={{ padding: '14px', background: darkMode ? '#fbbf24' : '#0f172a', color: darkMode ? '#0f172a' : 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>{darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
            <button onClick={toggleHideNumbers} style={{ padding: '14px', background: hideNumbers ? '#8b5cf6' : '#0f172a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>{hideNumbers ? '👁️ Show Numbers' : '🙈 Hide Numbers'}</button>
            <button onClick={handleExport} style={{ padding: '14px', background: '#667eea', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>📦 Export Backup</button>
            <label style={{ display: 'block', padding: '14px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', textAlign: 'center' }}>
              📥 Import Backup
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
            <button onClick={handleReset} style={{ padding: '14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>🗑️ Reset All Data</button>
          </div>
        </div>
      )}

      {/* Credit Cards */}
      <CollapsibleSection title="Credit cards" icon="💳" darkMode={darkMode} defaultOpen={true}>
        {creditCards.length === 0 ? (
          <EmptyState icon="💳" title="No credit cards" message="Add your first credit card" onAction={() => { setShowAddCard(true); setEditingCard(null); }} actionText="➕ Add Card" darkMode={darkMode} />
        ) : (
          <>
            {/* ✅ FIXED: Add Card Button */}
            <button 
              onClick={() => {
                console.log('Add Card clicked');
                setShowAddCard(true);
                setEditingCard(null);
                setNewCard({ name: '', limit: '', available: '', balance: '', paymentDate: '26th', thisCyclePayment: '', nextCyclePayment: '' });
              }} 
              style={{ width: '100%', padding: '16px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', marginTop: '16px' }}
            >
              ➕ Add New Card
            </button>
            
            <div style={{ marginTop: '16px', padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}>
              <p style={{ margin: '0 0 12px 0', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }}>➕ {editingExpense ? '✏️ Edit' : 'Add'} Expense</p>
              <div style={{ display: 'grid', gap: '10px' }}>
                <select value={newExpense.cardId} onChange={(e) => setNewExpense({...newExpense, cardId: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }}>
                  <option value="">Select Payment Method</option>
                  <option value="cash">💵 Cash (from Cash Balance)</option>
                  {creditCards.map(card => (<option key={card.id} value={card.id}>{card.name}</option>))}
                </select>
                <input type="text" placeholder="Description" value={newExpense.description} onChange={(e) => { setNewExpense({...newExpense, description: e.target.value}); if (e.target.value) setNewExpense(prev => ({...prev, category: autoCategorize(e.target.value)})); }} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                <input type="number" placeholder={`Amount (${CONFIG.currency})`} value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleAddCardExpense} style={{ flex: 1, padding: '12px', background: editingExpense ? '#f59e0b' : '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>{editingExpense ? '💾 Update' : 'Add'}</button>
                  {editingExpense && <button onClick={() => { setEditingExpense(null); setNewExpense({ cardId: '', amount: '', category: 'Shopping', description: '' }); }} style={{ padding: '12px 20px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>✕ Cancel</button>}
                </div>
              </div>
            </div>

            {/* ✅ FIXED: Show Add Card Form */}
            {showAddCard && (
              <div style={{ marginTop: '16px', padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px', fontWeight: '700' }}>{editingCard ? '✏️ Edit' : '➕ New Card'}</h4>
                  <button onClick={() => { setShowAddCard(false); setEditingCard(null); }} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✕ Cancel</button>
                </div>
                <input type="text" placeholder="Card Name" value={newCard.name} onChange={(e) => setNewCard({...newCard, name: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                <input type="number" placeholder={`Limit Quota (${CONFIG.currency})`} value={newCard.limit} onChange={(e) => setNewCard({...newCard, limit: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                <input type="number" placeholder={`Remaining Balance (${CONFIG.currency})`} value={newCard.available} onChange={(e) => setNewCard({...newCard, available: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                <input type="number" placeholder={`Debt to Pay (${CONFIG.currency})`} value={newCard.balance} onChange={(e) => setNewCard({...newCard, balance: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                <select value={newCard.paymentDate} onChange={(e) => setNewCard({...newCard, paymentDate: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }}>
                  <option value="10th">10th (Close: 25th)</option>
                  <option value="26th">26th (Close: 11th)</option>
                  <option value="27th">27th (Close: 12th)</option>
                </select>
                <input type="number" placeholder={`Payment (${CONFIG.currency})`} value={newCard.thisCyclePayment} onChange={(e) => setNewCard({...newCard, thisCyclePayment: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                <button onClick={handleAddCard} style={{ padding: '14px', background: editingCard ? '#f59e0b' : '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>{editingCard ? '💾 Update' : '➕ Add Card'}</button>
              </div>
            )}

            <div style={{ marginTop: '16px' }}>
              {creditCards.map((card) => {
                const suggestedPayment = Math.min(card.balance, cashAvailable, card.thisCyclePayment);
                return (
                  <div key={card.id} style={{ background: darkMode ? '#1e293b' : '#f8fafc', padding: '18px', borderRadius: '12px', marginBottom: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>{card.name}</h4>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEditCard(card)} style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                        <button onClick={() => handleDeleteCard(card.id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                      </div>
                    </div>
                    <div style={{ padding: '12px', background: darkMode ? '#0f172a' : '#e2e8f0', borderRadius: '10px', marginBottom: '12px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: darkMode ? '#94a3b8' : '#647480' }}>📅 Closing:</span><strong style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>{card.closingDate}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: darkMode ? '#94a3b8' : '#647480' }}>💰 Payment:</span><strong style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>{card.paymentDate}</strong></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', marginBottom: '12px' }}>
                      <div><span style={{ color: darkMode ? '#94a3b8' : '#647480' }}>Limit Quota:</span> <strong style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${card.limit.toLocaleString()}`}</strong></div>
                      <div><span style={{ color: darkMode ? '#94a3b8' : '#647480' }}>Remaining Balance:</span> <strong style={{ color: '#14b8a6' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${card.available.toLocaleString()}`}</strong></div>
                      <div style={{ gridColumn: 'span 2' }}><span style={{ color: darkMode ? '#94a3b8' : '#647480' }}>Debt to Pay:</span> <strong style={{ color: '#ef4444' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${card.balance.toLocaleString()}`}</strong></div>
                    </div>
                    {card.balance > 0 && cashAvailable > 0 && (
                      <div style={{ background: darkMode ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', padding: '14px', borderRadius: '10px', marginBottom: '12px' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: 'white' }}>💡 Smart Payment</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>Pay:</span>
                          <span style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${suggestedPayment.toLocaleString()}`}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="number" placeholder="Amount" id={`pay-${card.id}`} defaultValue={suggestedPayment} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '14px' }} />
                          <button onClick={() => handlePayCard(card.id, parseFloat(document.getElementById(`pay-${card.id}`).value) || suggestedPayment)} style={{ padding: '10px 20px', background: 'white', color: '#059669', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>Pay</button>
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="number" placeholder="Amount" id={`pay-manual-${card.id}`} defaultValue={card.thisCyclePayment} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                      <button onClick={() => handlePayCard(card.id, parseFloat(document.getElementById(`pay-manual-${card.id}`).value) || card.thisCyclePayment)} style={{ padding: '12px 24px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>Pay</button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredExpenses.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: darkMode ? '#f8fafc' : '#0f172a' }}>📜 Expenses:</p>
                {filteredExpenses.slice(0, 10).map((expense) => (
                  <div key={expense.id} style={{ padding: '12px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '10px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: darkMode ? '#f8fafc' : '#0f172a' }}>{getCategoryIcon(expense.category)} {expense.category}</p>
                      <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: darkMode ? '#94a3b8' : '#647480' }}>{expense.cardId === 'cash' ? '💵 Cash' : creditCards.find(c => c.id === parseInt(expense.cardId))?.name} • {expense.date}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <p style={{ margin: 0, fontWeight: '700', color: '#ef4444' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${expense.amount.toLocaleString()}`}</p>
                      <button onClick={() => handleEditExpense(expense)} style={{ padding: '4px 8px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✏️</button>
                      <button onClick={() => handleDeleteExpense(expense.id)} style={{ padding: '4px 8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CollapsibleSection>

      {/* Monthly Goals */}
      <CollapsibleSection title="Monthly goals" icon="🎯" darkMode={darkMode}>
        {monthlyGoals.length === 0 ? (
          <EmptyState icon="🎯" title="No goals" message="Set your first financial goal" onAction={() => setShowAddGoal(true)} actionText="➕ Add Goal" darkMode={darkMode} />
        ) : (
          <>
            {/* ✅ FIXED: Add Goal Button */}
            <button 
              onClick={() => {
                console.log('Add Goal clicked');
                setShowAddGoal(true);
                setEditingGoal(null);
                setNewGoal({ name: '', target: '', color: '#14b8a6', priority: 'medium' });
              }} 
              style={{ width: '100%', padding: '16px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', marginTop: '16px' }}
            >
              ➕ Add Goal
            </button>
            
            {/* ✅ FIXED: Show Add Goal Form */}
            {showAddGoal && (
              <div style={{ marginTop: '16px', padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px', fontWeight: '700' }}>{editingGoal ? '✏️ Edit Goal' : '➕ New Goal'}</h4>
                  <button onClick={() => { setShowAddGoal(false); setEditingGoal(null); }} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✕ Cancel</button>
                </div>
                <input type="text" placeholder="Goal Name" value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                <input type="number" placeholder={`Target (${CONFIG.currency})`} value={newGoal.target} onChange={(e) => setNewGoal({...newGoal, target: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                <select value={newGoal.color} onChange={(e) => setNewGoal({...newGoal, color: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }}>
                  <option value="#14b8a6">🟢 Teal</option>
                  <option value="#8b5cf6">🟣 Purple</option>
                  <option value="#f59e0b">🟠 Orange</option>
                  <option value="#ef4444">🔴 Red</option>
                  <option value="#3b82f6">🔵 Blue</option>
                </select>
                <button onClick={handleAddGoal} style={{ padding: '14px', background: editingGoal ? '#f59e0b' : '#8b5cf6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>{editingGoal ? '💾 Update Goal' : '➕ Add Goal'}</button>
              </div>
            )}
            <div style={{ marginTop: '16px' }}>
              {monthlyGoals.map((goal) => {
                const percentage = Math.min(100, Math.round((goal.current / goal.target) * 100));
                const isComplete = goal.current >= goal.target;
                return (
                  <div key={goal.id} style={{ background: darkMode ? '#1e293b' : '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>{goal.name} {isComplete && <span style={{ fontSize: '11px', background: '#14b8a6', color: 'white', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' }}>✅ DONE</span>}</h4>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEditGoal(goal)} style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                        <button onClick={() => handleDeleteGoal(goal.id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                      </div>
                    </div>
                    <HorizontalProgressBar label="Progress" current={goal.current} target={goal.target} color={goal.color} darkMode={darkMode} />
                    {!isComplete && (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                        <input type="number" placeholder="Amount" id={`goal-${goal.id}`} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} />
                        <button onClick={() => handleContributeToGoal(goal.id, parseFloat(document.getElementById(`goal-${goal.id}`).value))} style={{ padding: '10px 20px', background: goal.color, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>Contribute</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CollapsibleSection>

      {/* Car Expenses */}
      <CollapsibleSection title="Car expenses" icon="🚗" darkMode={darkMode}>
        <div style={{ marginTop: '16px' }}>
          <div style={{ padding: '14px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '10px', marginBottom: '14px' }}>
            <p style={{ margin: 0, fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>⛽ Daily Oil</p>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: darkMode ? '#94a3b8' : '#647480' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${carExpenses.dailyOil.toLocaleString()}`} per day</p>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: darkMode ? '#94a3b8' : '#647480' }}>This month: <strong style={{ color: '#ef4444' }}>{hideNumbers ? CONFIG.currency + '••••' : `${CONFIG.currency}${carExpenses.totalThisMonth.toLocaleString()}`}</strong></p>
          </div>
          <button onClick={handleAddCarExpense} style={{ width: '100%', padding: '14px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>Add Today ({CONFIG.currency}{carExpenses.dailyOil.toLocaleString()})</button>
        </div>
      </CollapsibleSection>

      {/* Daily Income */}
      <CollapsibleSection title="Daily Income" icon="💵" darkMode={darkMode} defaultOpen={true}>
        <div style={{ padding: '16px', background: darkMode ? '#059669' : '#d1fae5', borderRadius: '12px', marginBottom: '16px' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: darkMode ? 'rgba(255,255,255,0.9)' : '#059669' }}>Add income to increase your Cash Balance</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="number" value={todayIncome} onChange={(e) => setTodayIncome(e.target.value)} placeholder={`Amount (${CONFIG.currency})`} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `2px solid ${darkMode ? '#064e3b' : '#059669'}`, background: darkMode ? '#064e3b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px', fontWeight: '600' }} />
            <button onClick={handleAddIncome} style={{ padding: '14px 28px', background: '#059669', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>Add Income</button>
          </div>
        </div>
        
        {dailyIncomes.length === 0 ? (
          <p style={{ textAlign: 'center', color: darkMode ? '#94a3b8' : '#647480', padding: '20px' }}>No income recorded yet this month</p>
        ) : (
          <div>
            <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: darkMode ? '#f8fafc' : '#0f172a' }}>Recent Income:</p>
            {dailyIncomes.map((income, index) => (
              <div key={income.id} style={{ padding: '12px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '10px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      </CollapsibleSection>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '20px', color: darkMode ? '#64748b' : '#94a3b8', fontSize: '12px', marginTop: '24px', borderTop: `2px solid ${darkMode ? '#1e293b' : '#e2e8f0'}` }}>
        <p style={{ margin: 0 }}>© 2026 {appName}</p>
        <p style={{ margin: '4px 0 0 0', opacity: 0.8 }}>🔐 All data stored locally • No tracking</p>
      </footer>
    </div>
  );
}

export default App;
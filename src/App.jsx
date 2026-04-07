import { useState, useEffect, useMemo, useCallback } from 'react';
import './App.css';
import { saveData, loadData } from './dataStorage';

// ============================================================================
// 🔧 HELPER COMPONENTS
// ============================================================================

function CollapsibleSection({ title, icon, children, defaultOpen = false, darkMode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: darkMode ? '#1e293b' : 'white',
      borderRadius: '20px',
      marginBottom: '20px',
      overflow: 'hidden',
      boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.4)' : '0 10px 40px rgba(0,0,0,0.08)',
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
    }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{
        width: '100%', padding: '22px 24px', background: 'transparent', border: 'none',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
        color: darkMode ? '#f8fafc' : '#0f172a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '26px' }}>{icon}</span>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>{title}</span>
        </div>
        <span style={{ fontSize: '24px', color: '#14b8a6', fontWeight: '300' }}>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div style={{ padding: '0 24px 24px 24px', borderTop: `1px solid ${darkMode ? '#334155' : '#f1f5f9'}` }}>{children}</div>}
    </div>
  );
}

function Tooltip({ text, darkMode }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span style={{ marginLeft: '6px', fontSize: '14px', color: darkMode ? '#64748b' : '#94a3b8', cursor: 'help' }}>ⓘ</span>
      {show && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          background: darkMode ? '#0f172a' : '#1e293b', color: 'white', padding: '10px 14px',
          borderRadius: '10px', fontSize: '13px', whiteSpace: 'nowrap', zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', marginBottom: '8px'
        }}>{text}</div>
      )}
    </div>
  );
}

function EditableNumber({ value, onChange, prefix = '¥', darkMode, hideNumbers, fontSize = '16px' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const handleSave = useCallback(() => {
    const num = parseFloat(editValue.replace(/,/g, ''));
    if (!isNaN(num)) onChange(num);
    setIsEditing(false);
  }, [editValue, onChange]);

  if (isEditing) {
    return (
      <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()} autoFocus
        style={{ background: darkMode ? '#0f172a' : 'white', border: `2px solid #14b8a6`, borderRadius: '8px',
          padding: '6px 10px', color: darkMode ? '#f8fafc' : '#0f172a', fontSize, fontWeight: '700', width: '120px', outline: 'none' }} />
    );
  }
  return (
    <span onClick={() => setIsEditing(true)} style={{ cursor: 'pointer', fontSize, fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }} title="Click to edit">
      {hideNumbers ? '••••' : `${prefix}${value.toLocaleString()}`}
    </span>
  );
}

function PieChart({ data, darkMode, hideNumbers, size = 200 }) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  let cumulativePercent = 0;
  const getCoords = useCallback((percent) => [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)], []);
  if (total === 0) return <div style={{ textAlign: 'center', color: darkMode ? '#94a3b8' : '#647480', padding: '20px' }}>No spending data yet</div>;
  return (
    <svg viewBox="-1 -1 2 2" style={{ maxWidth: size, width: '100%', height: 'auto' }}>
      {data.map((slice, i) => {
        if (slice.value === 0) return null;
        const [sx, sy] = getCoords(cumulativePercent);
        cumulativePercent += slice.value / total;
        const [ex, ey] = getCoords(cumulativePercent);
        const large = slice.value / total > 0.5 ? 1 : 0;
        return <path key={i} d={`M ${sx} ${sy} A 1 1 0 ${large} 1 ${ex} ${ey} L 0 0`} fill={slice.color}
          stroke={darkMode ? '#0f172a' : '#f8fafc'} strokeWidth="0.02" style={{ cursor: 'pointer' }}
          title={`${slice.label}: ${hideNumbers ? '••••' : `¥${slice.value.toLocaleString()}`} />} />;
      })}
      <circle r="0.6" fill={darkMode ? '#1e293b' : 'white'} />
    </svg>
  );
}

function BarChart({ data, darkMode, hideNumbers, maxValue }) {
  const max = useMemo(() => maxValue || Math.max(...data.map(d => d.value), 1), [data, maxValue]);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '150px', padding: '10px 0' }}>
      {data.map((item, i) => {
        const h = Math.max((item.value / max) * 100, 2);
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ width: '100%', height: `${h}%`, background: item.color, borderRadius: '6px 6px 0 0', transition: 'height 0.3s ease' }}
              title={`${item.label}: ${hideNumbers ? '••••' : `¥${item.value.toLocaleString()}`} />} />
            <span style={{ fontSize: '11px', color: darkMode ? '#94a3b8' : '#647480', marginTop: '6px', textAlign: 'center', whiteSpace: 'nowrap' }}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// 🚀 MAIN APP COMPONENT
// ============================================================================

function App() {
  const [currentMonth, setCurrentMonth] = useState(() => localStorage.getItem('ckSanFlow_currentMonth') || new Date().toISOString().slice(0, 7));
  const [cashAvailable, setCashAvailable] = useState(() => loadData(`cash_${currentMonth}`, 0));
  const [savings, setSavings] = useState(() => loadData(`savings_${currentMonth}`, 0));
  const [creditCards, setCreditCards] = useState(() => loadData(`creditCards_${currentMonth}`, []));
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('ckSanFlow_darkMode') || 'false'));
  const [hideNumbers, setHideNumbers] = useState(() => JSON.parse(localStorage.getItem('ckSanFlow_hideNumbers') || 'false'));
  const [dailyIncomes, setDailyIncomes] = useState(() => loadData(`dailyIncomes_${currentMonth}`, []));
  const [todayIncome, setTodayIncome] = useState('');
  const [cardExpenses, setCardExpenses] = useState(() => loadData(`cardExpenses_${currentMonth}`, []));
  const [newExpense, setNewExpense] = useState({ cardId: '', amount: '', category: 'Shopping' });
  const [newCard, setNewCard] = useState({ name: '', limit: '', available: '', balance: '', paymentDate: '26th', thisCyclePayment: '', nextCyclePayment: '' });
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [monthlyGoals, setMonthlyGoals] = useState(() => loadData(`monthlyGoals_${currentMonth}`, []));
  const [newGoal, setNewGoal] = useState({ name: '', target: '', color: '#14b8a6', priority: 'medium' });
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalAllocationPercent, setGoalAllocationPercent] = useState(() => loadData('goalAllocationPercent', 15));
  const [investmentPercent, setInvestmentPercent] = useState(() => loadData('investmentPercent', 10));
  const [trustFund, setTrustFund] = useState(() => loadData(`trustFund_${currentMonth}`, 50000));
  const [spusShares, setSpusShares] = useState(() => loadData(`spusShares_${currentMonth}`, 0));
  const [familySupport, setFamilySupport] = useState(() => loadData(`familySupport_${currentMonth}`, {
    parents: { amount: 75000, scheduledDate: '19th', lastPaid: '' },
    daughter: { amount: 25000, scheduledDate: 'anytime', lastPaid: '' },
    other: { amount: 0, scheduledDate: 'anytime', lastPaid: '' }
  }));
  const [healthFunds, setHealthFunds] = useState(() => loadData(`healthFunds_${currentMonth}`, { hairTransplant: { goal: 500000, current: 0 } }));
  const [homeExpenses, setHomeExpenses] = useState(() => loadData(`homeExpenses_${currentMonth}`, { food: 0, gas: 0, electricity: 0 }));
  const [carExpenses, setCarExpenses] = useState(() => loadData(`carExpenses_${currentMonth}`, { dailyOil: 2000, maxDailyOil: 2000, totalThisMonth: 0 }));
  const [pensionsInsurance, setPensionsInsurance] = useState(() => loadData(`pensionsInsurance_${currentMonth}`, {
    nationalPension: 0, healthInsurance: 0, carInsurance: 0, lifeInsurance: 0, taxes: 0, total: 0
  }));
  const [monthlyIncome, setMonthlyIncome] = useState(() => loadData(`monthlyIncome_${currentMonth}`, 0));
  const [monthlyExpenses, setMonthlyExpenses] = useState(() => loadData(`monthlyExpenses_${currentMonth}`, 0));
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [appName, setAppName] = useState(() => loadData('appName', 'CkSanFlow'));
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(true);
  const [calendarView, setCalendarView] = useState('list');
  const [recurringExpenses, setRecurringExpenses] = useState(() => loadData('recurringExpenses', []));
  const [newRecurring, setNewRecurring] = useState({ name: '', amount: '', frequency: 'monthly', category: 'Home', nextDue: new Date().toISOString().split('T')[0] });
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState(6);

  // 🧠 MEMOIZED CALCULATIONS
  const totalDebts = useMemo(() => creditCards.reduce((sum, c) => sum + c.balance, 0), [creditCards]);
  const totalCreditAvailable = useMemo(() => creditCards.reduce((sum, c) => sum + c.available, 0), [creditCards]);
  const totalGoalsProgress = useMemo(() => monthlyGoals.reduce((sum, g) => sum + g.current, 0), [monthlyGoals]);
  const totalGoalsTarget = useMemo(() => monthlyGoals.reduce((sum, g) => sum + g.target, 0), [monthlyGoals]);
  const totalDaysEarned = useMemo(() => dailyIncomes.length, [dailyIncomes]);
  const totalIncomeThisMonth = useMemo(() => dailyIncomes.reduce((sum, i) => sum + i.amount, 0), [dailyIncomes]);
  const dailyAverageIncome = useMemo(() => totalDaysEarned > 0 ? Math.round(totalIncomeThisMonth / totalDaysEarned) : 0, [totalIncomeThisMonth, totalDaysEarned]);
  const recommendedSavings = useMemo(() => Math.round(monthlyIncome * 0.10), [monthlyIncome]);
  const spendingByCategory = useMemo(() => {
    const r = {}; cardExpenses.forEach(e => r[e.category] = (r[e.category] || 0) + e.amount); return r;
  }, [cardExpenses]);

  const smartAlerts = useMemo(() => {
    const a = [];
    if (totalCreditAvailable > 0 && (creditCards.reduce((s,c)=>s+c.limit,0)-totalCreditAvailable)/creditCards.reduce((s,c)=>s+c.limit,0) > 0.8)
      a.push({ id: 'credit', type: 'warning', message: '⚠️ Credit utilization >80% — consider paying down balances' });
    if (monthlyIncome > 0 && savings < recommendedSavings * 0.5)
      a.push({ id: 'savings', type: 'info', message: `💡 Only ${Math.round((savings/recommendedSavings)*100)||0}% of recommended savings` });
    const today = new Date().getDate();
    creditCards.forEach(c => {
      if (Math.abs(parseInt(c.paymentDate) - today) <= 3 && c.thisCyclePayment > 0)
        a.push({ id: `pay-${c.id}`, type: 'reminder', message: `📅 ${c.name} due ${c.paymentDate}: ¥${c.thisCyclePayment.toLocaleString()}` });
    });
    return a;
  }, [totalCreditAvailable, creditCards, savings, recommendedSavings, monthlyIncome]);

  const spendingChartData = useMemo(() => Object.entries(spendingByCategory).map(([cat, val]) => ({
    label: cat, value: val, color: {Shopping:'#f59e0b',Food:'#ef4444',Gas:'#f97316',Transport:'#3b82f6',Entertainment:'#8b5cf6',Health:'#14b8a6',Other:'#64748b'}[cat]||'#94a3b8'
  })).filter(x=>x.value>0), [spendingByCategory]);

  const getMonthlyTrendData = useCallback(() => {
    const d = []; const t = new Date();
    for(let i=analyticsPeriod-1;i>=0;i--){
      const dt=new Date(t.getFullYear(),t.getMonth()-i,1);
      const k=dt.toISOString().slice(0,7), l=dt.toLocaleDateString('en-US',{month:'short'});
      d.push({label:l, income:loadData(`monthlyIncome_${k}`,0), expenses:loadData(`monthlyExpenses_${k}`,0)});
    } return d;
  }, [analyticsPeriod]);

  const monthlyTrendData = useMemo(() => getMonthlyTrendData(), [getMonthlyTrendData]);
  const maxTrendValue = useMemo(() => Math.max(...monthlyTrendData.flatMap(d=>[d.income,d.expenses]),1), [monthlyTrendData]);

  const calendarEvents = useMemo(() => {
    const ev = [];
    dailyIncomes.forEach(i => ev.push({date:i.date,type:'income',amount:i.amount,label:'Income'}));
    creditCards.forEach(c => { const d=`${currentMonth}-${c.paymentDate.replace('th','').padStart(2,'0')}`; ev.push({date:d,type:'payment',amount:c.thisCyclePayment,label:`${c.name} Payment`}); });
    Object.entries(familySupport).forEach(([k,v]) => { if(v.scheduledDate!=='anytime'&&v.amount>0){ const d=`${currentMonth}-${v.scheduledDate.replace('th','').padStart(2,'0')}`; ev.push({date:d,type:'family',amount:v.amount,label:`${k==='parents'?'Parents':k==='daughter'?'Daughter':'Other'} Support`}); }});
    recurringExpenses.forEach(r => { if(r.nextDue.startsWith(currentMonth)) ev.push({date:r.nextDue,type:'recurring',amount:r.amount,label:r.name}); });
    return ev.sort((a,b)=>a.date.localeCompare(b.date));
  }, [dailyIncomes, creditCards, familySupport, recurringExpenses, currentMonth]);

  // 💾 SAVE DATA
  useEffect(() => {
    saveData(`cash_${currentMonth}`, cashAvailable); saveData(`savings_${currentMonth}`, savings); saveData(`creditCards_${currentMonth}`, creditCards);
    saveData(`dailyIncomes_${currentMonth}`, dailyIncomes); saveData(`cardExpenses_${currentMonth}`, cardExpenses); saveData(`monthlyGoals_${currentMonth}`, monthlyGoals);
    saveData(`trustFund_${currentMonth}`, trustFund); saveData(`spusShares_${currentMonth}`, spusShares); saveData(`familySupport_${currentMonth}`, familySupport);
    saveData(`healthFunds_${currentMonth}`, healthFunds); saveData(`homeExpenses_${currentMonth}`, homeExpenses); saveData(`carExpenses_${currentMonth}`, carExpenses);
    saveData(`pensionsInsurance_${currentMonth}`, pensionsInsurance); saveData(`monthlyIncome_${currentMonth}`, monthlyIncome); saveData(`monthlyExpenses_${currentMonth}`, monthlyExpenses);
    saveData('appName', appName); saveData('hideNumbers', hideNumbers); saveData('recurringExpenses', recurringExpenses);
  }, [cashAvailable, savings, creditCards, dailyIncomes, cardExpenses, monthlyGoals, trustFund, spusShares, familySupport, healthFunds, homeExpenses, carExpenses, pensionsInsurance, monthlyIncome, monthlyExpenses, appName, hideNumbers, currentMonth, recurringExpenses]);

  useEffect(() => { setAlerts(smartAlerts); }, [smartAlerts]);
  useEffect(() => {
    const saved = localStorage.getItem('ckSanFlow_darkMode');
    if (saved) { const is = JSON.parse(saved); setDarkMode(is); document.documentElement.setAttribute('data-theme', is ? 'dark' : 'light'); }
  }, []);

  // 🔄 HANDLERS
  const handleMonthChange = useCallback((m) => {
    setCurrentMonth(m); localStorage.setItem('ckSanFlow_currentMonth', m);
    setCashAvailable(loadData(`cash_${m}`,0)); setSavings(loadData(`savings_${m}`,0)); setCreditCards(loadData(`creditCards_${m}`,[]));
    setDailyIncomes(loadData(`dailyIncomes_${m}`,[])); setCardExpenses(loadData(`cardExpenses_${m}`,[])); setMonthlyGoals(loadData(`monthlyGoals_${m}`,[]));
    setTrustFund(loadData(`trustFund_${m}`,50000)); setSpusShares(loadData(`spusShares_${m}`,0));
    setFamilySupport(loadData(`familySupport_${m}`,{parents:{amount:75000,scheduledDate:'19th',lastPaid:''},daughter:{amount:25000,scheduledDate:'anytime',lastPaid:''},other:{amount:0,scheduledDate:'anytime',lastPaid:''}}));
    setHealthFunds(loadData(`healthFunds_${m}`,{hairTransplant:{goal:500000,current:0}})); setHomeExpenses(loadData(`homeExpenses_${m}`,{food:0,gas:0,electricity:0}));
    setCarExpenses(loadData(`carExpenses_${m}`,{dailyOil:2000,maxDailyOil:2000,totalThisMonth:0}));
    setPensionsInsurance(loadData(`pensionsInsurance_${m}`,{nationalPension:0,healthInsurance:0,carInsurance:0,lifeInsurance:0,taxes:0,total:0}));
    setMonthlyIncome(loadData(`monthlyIncome_${m}`,0)); setMonthlyExpenses(loadData(`monthlyExpenses_${m}`,0));
  }, []);

  const calculateClosingDate = useCallback((p) => { const d=parseInt(p); let c=d-15; if(c<=0)c+=30; return c+'th'; }, []);

  const handleAddIncome = useCallback(() => {
    const a = parseFloat(todayIncome); if(!a||a<=0){alert('Please enter a valid amount');return;}
    const n = {id:Date.now(),amount:a,date:new Date().toISOString().split('T')[0]};
    setDailyIncomes(p=>[n,...p]); setCashAvailable(p=>p+a); setMonthlyIncome(p=>p+a);
    const iv = Math.round(a*(investmentPercent/100)); setTrustFund(p=>p+iv); setSavings(p=>p+iv);
    const ga = Math.round(a*(goalAllocationPercent/100));
    if(ga>0&&monthlyGoals.length>0){
      const inc = monthlyGoals.filter(g=>g.current<g.target);
      if(inc.length>0){const pg=Math.round(ga/inc.length); setMonthlyGoals(p=>p.map(g=>inc.find(i=>i.id===g.id)?{...g,current:Math.min(g.target,g.current+pg)}:g));}
    } setTodayIncome(''); alert(`✅ ¥${hideNumbers?'••••':a.toLocaleString()} added!`);
  }, [todayIncome, investmentPercent, goalAllocationPercent, monthlyGoals, hideNumbers]);

  const handleDeleteRecentIncome = useCallback((id) => {
    const inc = dailyIncomes.find(i=>i.id===id); if(!inc)return; if(!confirm(`⚠️ Delete ¥${inc.amount.toLocaleString()}?`))return;
    const iv=Math.round(inc.amount*(investmentPercent/100)), ga=Math.round(inc.amount*(goalAllocationPercent/100));
    setCashAvailable(p=>p-inc.amount); setMonthlyIncome(p=>p-inc.amount); setTrustFund(p=>p-iv); setSavings(p=>p-iv);
    const incGoals=monthlyGoals.filter(g=>g.current<g.target);
    if(incGoals.length>0){const pg=Math.round(ga/incGoals.length); setMonthlyGoals(p=>p.map(g=>incGoals.find(i=>i.id===g.id)?{...g,current:Math.max(0,g.current-pg)}:g));}
    setDailyIncomes(p=>p.filter(i=>i.id!==id)); alert('🗑️ Deleted!');
  }, [dailyIncomes, investmentPercent, goalAllocationPercent, monthlyGoals]);

  const handleAddCard = useCallback(() => {
    if(!newCard.name||!newCard.limit){alert('Fill name & limit');return;}
    const cl=calculateClosingDate(newCard.paymentDate), lim=parseFloat(newCard.limit)||0, av=parseFloat(newCard.available)||0, bal=parseFloat(newCard.balance)||0;
    let fa=av, fb=bal;
    if(av===0&&bal===0){fa=lim;fb=0;} else if(av===0&&bal>0){fa=lim-bal;} else if(bal===0&&av>0){fb=lim-av;}
    if(editingCard){setCreditCards(p=>p.map(c=>c.id===editingCard.id?{...c,name:newCard.name,limit,available:fa,balance:fb,paymentDate:newCard.paymentDate,closingDate:cl,thisCyclePayment:parseFloat(newCard.thisCyclePayment)||c.thisCyclePayment,nextCyclePayment:parseFloat(newCard.nextCyclePayment)||c.nextCyclePayment}:c));setEditingCard(null);alert('✅ Updated!');}
    else{setCreditCards(p=>[...p,{id:Date.now(),name:newCard.name,limit,available:fa,balance:fb,paymentDate:newCard.paymentDate,closingDate:cl,thisCyclePayment:parseFloat(newCard.thisCyclePayment)||0,nextCyclePayment:parseFloat(newCard.nextCyclePayment)||0}]);alert('✅ Added!');}
    setNewCard({name:'',limit:'',available:'',balance:'',paymentDate:'26th',thisCyclePayment:'',nextCyclePayment:''}); setShowAddCard(false);
  }, [newCard, calculateClosingDate, editingCard]);

  const handleEditCard = useCallback((c) => { setEditingCard(c); setNewCard({name:c.name,limit:c.limit.toString(),available:c.available.toString(),balance:c.balance.toString(),paymentDate:c.paymentDate,thisCyclePayment:c.thisCyclePayment.toString(),nextCyclePayment:c.nextCyclePayment.toString()}); setShowAddCard(true); }, []);
  const handleDeleteCard = useCallback((id) => { if(confirm('Delete card?')){setCreditCards(p=>p.filter(c=>c.id!==id));alert('🗑️ Deleted!');} }, []);

  const handleAddCardExpense = useCallback(() => {
    const {cardId,amount,category}=newExpense, a=parseFloat(amount);
    if(!cardId||!a||a<=0){alert('Select card & amount');return;}
    const c=creditCards.find(x=>x.id===parseInt(cardId)); if(!c)return; if(a>c.available){alert('❌ Exceeds limit!');return;}
    const today=new Date().toISOString().split('T')[0], ed=new Date().getDate(), cd=parseInt(c.closingDate), isCur=ed<=cd;
    setCreditCards(p=>p.map(x=>x.id===parseInt(cardId)?{...x,balance:x.balance+a,available:x.limit-(x.balance+a),thisCyclePayment:isCur?x.thisCyclePayment+a:x.thisCyclePayment,nextCyclePayment:isCur?x.nextCyclePayment:x.nextCyclePayment+a}:x));
    setCardExpenses(p=>[{id:Date.now(),cardId:parseInt(cardId),cardName:c.name,amount:a,category,date:today,cycle:isCur?'This Month':'Next Month'},...p]);
    setMonthlyExpenses(p=>p+a); setNewExpense({cardId:'',amount:'',category:'Shopping'}); alert(`✅ ¥${hideNumbers?'••••':a.toLocaleString()} added!`);
  }, [newExpense, creditCards, hideNumbers]);

  const handlePayCard = useCallback((id,a) => { if(a>cashAvailable){alert('❌ Insufficient cash!');return;}
    setCreditCards(p=>p.map(c=>c.id===id?{...c,balance:Math.max(0,c.balance-a),available:c.limit-Math.max(0,c.balance-a),thisCyclePayment:Math.max(0,c.thisCyclePayment-a)}:c));
    setCashAvailable(p=>p-a); setMonthlyExpenses(p=>p+a); alert(`✅ ¥${hideNumbers?'••••':a.toLocaleString()} paid!`);
  }, [cashAvailable, hideNumbers]);

  const handleSendFamilySupport = useCallback((t,a) => { if(a>cashAvailable){alert('❌ Insufficient cash!');return;}
    setFamilySupport(p=>({...p,[t]:{...p[t],lastPaid:new Date().toISOString().split('T')[0]}})); setCashAvailable(p=>p-a); setMonthlyExpenses(p=>p+a); alert(`✅ Sent!`);
  }, [cashAvailable]);

  const handleAddHealthFund = useCallback((a) => { if(a>cashAvailable){alert('❌ Insufficient!');return;}
    setHealthFunds(p=>({...p,hairTransplant:{...p.hairTransplant,current:p.hairTransplant.current+a}})); setCashAvailable(p=>p-a); setSavings(p=>p+a); alert('✅ Added!');
  }, [cashAvailable]);

  const handleAddHomeExpense = useCallback((t,a) => { if(a>cashAvailable){alert('❌ Insufficient!');return;}
    setHomeExpenses(p=>({...p,[t]:p[t]+a})); setCashAvailable(p=>p-a); setMonthlyExpenses(p=>p+a); alert('✅ Recorded!');
  }, [cashAvailable]);

  const handleAddCarExpense = useCallback(() => { if(carExpenses.dailyOil>cashAvailable){alert('❌ Insufficient!');return;}
    if(carExpenses.dailyOil>carExpenses.maxDailyOil){alert('⚠️ Capped!');return;}
    setCarExpenses(p=>({...p,totalThisMonth:p.totalThisMonth+p.dailyOil})); setCashAvailable(p=>p-p.dailyOil); setMonthlyExpenses(p=>p+p.dailyOil); alert('✅ Recorded!');
  }, [carExpenses, cashAvailable]);

  const handleAddPensionInsurance = useCallback((t,a) => { if(a>cashAvailable){alert('❌ Insufficient!');return;}
    setPensionsInsurance(p=>({...p,[t]:p[t]+a,total:p.total+a})); setCashAvailable(p=>p-a); setMonthlyExpenses(p=>p+a); alert('✅ Recorded!');
  }, [cashAvailable]);

  const handleAddGoal = useCallback(() => { if(!newGoal.name||!newGoal.target){alert('Fill name & target');return;}
    const t=parseFloat(newGoal.target);
    if(editingGoal){setMonthlyGoals(p=>p.map(g=>g.id===editingGoal.id?{...g,name:newGoal.name,target:t,color:newGoal.color,priority:newGoal.priority}:g));setEditingGoal(null);alert('✅ Updated!');}
    else{setMonthlyGoals(p=>[...p,{id:Date.now(),name:newGoal.name,target:t,current:0,color:newGoal.color,priority:newGoal.priority}]);alert('✅ Added!');}
    setNewGoal({name:'',target:'',color:'#14b8a6',priority:'medium'}); setShowAddGoal(false);
  }, [newGoal, editingGoal]);

  const handleEditGoal = useCallback((g) => { setEditingGoal(g); setNewGoal({name:g.name,target:g.target.toString(),color:g.color,priority:g.priority}); setShowAddGoal(true); }, []);
  const handleDeleteGoal = useCallback((id) => { if(confirm('Delete goal?')){setMonthlyGoals(p=>p.filter(g=>g.id!==id));alert('🗑️ Deleted!');} }, []);
  const handleContributeToGoal = useCallback((id,a) => { if(a>cashAvailable){alert('❌ Insufficient!');return;}
    setMonthlyGoals(p=>p.map(g=>g.id===id?{...g,current:Math.min(g.target,g.current+a)}:g)); setCashAvailable(p=>p-a); setSavings(p=>p+a); alert('✅ Added!');
  }, [cashAvailable]);

  const handleAddRecurring = useCallback(() => { if(!newRecurring.name||!newRecurring.amount){alert('Fill name & amount');return;}
    setRecurringExpenses(p=>[...p,{id:Date.now(),...newRecurring,amount:parseFloat(newRecurring.amount),active:true}]);
    setNewRecurring({name:'',amount:'',frequency:'monthly',category:'Home',nextDue:new Date().toISOString().split('T')[0]}); setShowAddRecurring(false); alert('✅ Added!');
  }, [newRecurring]);

  const handleDeleteRecurring = useCallback((id) => { if(confirm('Delete recurring?')){setRecurringExpenses(p=>p.filter(r=>r.id!==id));alert('🗑️ Deleted!');} }, []);
  const handleProcessRecurring = useCallback(() => {
    const today=new Date().toISOString().split('T')[0]; let c=0;
    setRecurringExpenses(p=>p.map(r=>{if(r.active&&r.nextDue===today){c++;const d=new Date(r.nextDue);if(r.frequency==='monthly')d.setMonth(d.getMonth()+1);else if(r.frequency==='weekly')d.setDate(d.getDate()+7);else d.setFullYear(d.getFullYear()+1);return{...r,nextDue:d.toISOString().split('T')[0]};}return r;}));
    alert(c?`✅ Processed ${c} recurring expense${c>1?'s':''}`:'ℹ️ None due today');
  }, []);

  const handleExportCSV = useCallback(() => {
    const h=['Date','Type','Category','Amount','Notes'], r=[];
    dailyIncomes.forEach(i=>r.push([i.date,'Income','Salary',i.amount,'']));
    cardExpenses.forEach(e=>r.push([e.date,'Expense',e.category,e.amount,e.cardName]));
    Object.entries(familySupport).forEach(([k,v])=>{if(v.lastPaid)r.push([v.lastPaid,'Family Support',k,v.amount,`Sent to ${k}`]);});
    const b=new Blob([[h.join(','),...r.map(x=>x.join(','))].join('\n')],{type:'text/csv'}), u=URL.createObjectURL(b), a=document.createElement('a');
    a.href=u; a.download=`cksanflow_${currentMonth}.csv`; a.click(); alert('📊 CSV exported!');
  }, [dailyIncomes, cardExpenses, familySupport, currentMonth]);

  const handleExportJSON = useCallback(() => {
    const d={}; Object.keys(localStorage).forEach(k=>{if(k.startsWith('ckSanFlow_'))d[k]=localStorage.getItem(k);});
    const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}), u=URL.createObjectURL(b), a=document.createElement('a');
    a.href=u; a.download=`cksanflow_backup_${new Date().toISOString().split('T')[0]}.json`; a.click(); alert('📦 JSON backup exported!');
  }, []);

  const handleReset = useCallback(() => { if(confirm('⚠️ Reset ALL data?')){localStorage.clear();window.location.reload();} }, []);
  const toggleDarkMode = useCallback(() => { const n=!darkMode; setDarkMode(n); document.documentElement.setAttribute('data-theme',n?'dark':'light'); localStorage.setItem('ckSanFlow_darkMode',n); }, [darkMode]);
  const toggleHideNumbers = useCallback(() => { const n=!hideNumbers; setHideNumbers(n); localStorage.setItem('ckSanFlow_hideNumbers',n); }, [hideNumbers]);
  const getCategoryIcon = useCallback((c) => ({Shopping:'🛒',Food:'🍽️',Gas:'⛽',Transport:'🚗',Entertainment:'🎬',Health:'💊',Other:'📦'}[c]||'📦'), []);
  const generateMonthOptions = useCallback(() => { const m=[], t=new Date(); for(let i=-6;i<=6;i++){const d=new Date(t.getFullYear(),t.getMonth()+i,1);m.push({value:d.toISOString().slice(0,7),label:d.toLocaleDateString('en-US',{month:'short',year:'numeric'})});}return m; }, []);

  // 🎨 UI RENDER
  return (
    <div className="App" style={{ minHeight: '100vh', background: darkMode ? '#0f172a' : '#f8fafc', padding: '24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div><h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: darkMode ? '#f8fafc' : '#0f172a' }}>💰 {appName}</h1><p style={{ margin: '6px 0 0 0', fontSize: '15px', color: darkMode ? '#94a3b8' : '#64748b' }}>Smart Financial Management</p></div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={currentMonth} onChange={(e)=>handleMonthChange(e.target.value)} style={{ padding: '12px 16px', background: darkMode ? '#1e293b' : 'white', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, borderRadius: '14px', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>{generateMonthOptions().map(m=><option key={m.value} value={m.value}>{m.label}</option>)}</select>
          <button onClick={()=>setShowCustomize(!showCustomize)} style={{ padding: '12px 16px', background: darkMode ? '#1e293b' : 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '20px' }}>⚙️</button>
          <button onClick={toggleHideNumbers} style={{ padding: '12px 16px', background: hideNumbers ? '#8b5cf6' : (darkMode ? '#1e293b' : 'white'), border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '20px', color: hideNumbers ? 'white' : (darkMode ? '#f8fafc' : '#0f172a') }}>👁️</button>
          <button onClick={toggleDarkMode} style={{ padding: '12px 16px', background: darkMode ? '#fbbf24' : '#1e293b', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '20px', color: darkMode ? '#0f172a' : 'white' }}>{darkMode ? '☀️' : '🌙'}</button>
          <button onClick={()=>setShowSettings(!showSettings)} style={{ padding: '12px 16px', background: darkMode ? '#1e293b' : 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '20px' }}>📊</button>
        </div>
      </header>

      {showAlerts && alerts.length > 0 && (
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'linear-gradient(135deg, #fef3c7, #fdba74)', padding: '16px 20px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(245, 158, 11, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '24px' }}>🔔</span><div><p style={{ margin: 0, fontWeight: '700', color: darkMode ? '#0f172a' : '#78350f', fontSize: '15px' }}>{alerts.length} Alert{alerts.length>1?'s':''}</p><p style={{ margin: '4px 0 0 0', fontSize: '13px', color: darkMode ? '#1e293b' : '#92400e' }}>{alerts[0].message}</p></div></div>
          <div style={{ display: 'flex', gap: '8px' }}><button onClick={()=>setShowAlerts(false)} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: darkMode ? '#0f172a' : '#78350f' }}>Dismiss</button><button onClick={()=>setShowSettings(true)} style={{ padding: '8px 16px', background: darkMode ? '#0f172a' : 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: darkMode ? '#fbbf24' : '#f59e0b' }}>View All</button></div>
        </div>
      )}

      {showCustomize && (<div style={{ background: darkMode ? '#1e293b' : 'white', padding: '24px', borderRadius: '20px', marginBottom: '24px' }}><h3 style={{ margin: '0 0 20px 0', color: darkMode ? '#f8fafc' : '#0f172a' }}>Customize App</h3><input type="text" value={appName} onChange={(e)=>setAppName(e.target.value)} placeholder="App Name" style={{ width: '100%', padding: '14px', marginBottom: '16px', borderRadius: '12px', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px', boxSizing: 'border-box' }} /><button onClick={()=>setShowCustomize(false)} style={{ width: '100%', padding: '14px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>✅ Save</button></div>)}

      {showSettings && (<div style={{ background: darkMode ? '#1e293b' : 'white', padding: '24px', borderRadius: '20px', marginBottom: '24px' }}><h3 style={{ margin: '0 0 20px 0', color: darkMode ? '#f8fafc' : '#0f172a' }}>Settings & Tools</h3><div style={{ display: 'grid', gap: '12px' }}><button onClick={toggleDarkMode} style={{ padding: '16px', background: darkMode ? '#fbbf24' : '#0f172a', color: darkMode ? '#0f172a' : 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', textAlign: 'left' }}>{darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}</button><button onClick={toggleHideNumbers} style={{ padding: '16px', background: hideNumbers ? '#8b5cf6' : '#0f172a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', textAlign: 'left' }}>{hideNumbers ? '👁️ Show Numbers' : '🙈 Hide Numbers'}</button><button onClick={handleExportCSV} style={{ padding: '16px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', textAlign: 'left' }}>📊 Export CSV (Excel)</button><button onClick={handleExportJSON} style={{ padding: '16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', textAlign: 'left' }}>📦 Export JSON Backup</button><button onClick={handleReset} style={{ padding: '16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', textAlign: 'left' }}>🗑️ Reset All Data</button></div></div>)}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', padding: '28px 20px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 12px 40px rgba(16,185,129,0.3)', gridColumn: 'span 2' }}><div style={{ fontSize: '32px', marginBottom: '12px' }}>💵</div><p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: '8px' }}>TOTAL BALANCE</p><EditableNumber value={cashAvailable} onChange={setCashAvailable} prefix="¥" darkMode={darkMode} hideNumbers={hideNumbers} fontSize="42px" /></div>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' : 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)', padding: '24px 18px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 8px 24px rgba(139,92,246,0.25)' }}><div style={{ fontSize: '28px', marginBottom: '10px' }}>📊</div><p style={{ margin: 0, fontSize: '12px', color: darkMode ? 'rgba(255,255,255,0.9)' : '#6d28d9', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>DAILY AVERAGE <Tooltip text="Average income per day this month" darkMode={darkMode} /></p><p style={{ margin: 0, fontSize: '26px', fontWeight: '700', color: darkMode ? 'white' : '#5b21b6' }}>{hideNumbers ? '¥••••' : `¥${dailyAverageIncome.toLocaleString()}`}</p><p style={{ margin: '8px 0 0 0', fontSize: '12px', color: darkMode ? 'rgba(255,255,255,0.8)' : '#7c3aed' }}>{totalDaysEarned} days earned</p></div>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)' : 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)', padding: '24px 18px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 8px 24px rgba(6,182,212,0.25)' }}><div style={{ fontSize: '28px', marginBottom: '10px' }}>💳</div><p style={{ margin: 0, fontSize: '12px', color: darkMode ? 'rgba(255,255,255,0.9)' : '#0e7490', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>REMAINING CREDIT <Tooltip text="Total credit limit minus what you've used" darkMode={darkMode} /></p><p style={{ margin: 0, fontSize: '26px', fontWeight: '700', color: darkMode ? 'white' : '#164e63' }}>{hideNumbers ? '¥••••' : `¥${totalCreditAvailable.toLocaleString()}`}</p></div>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)', padding: '24px 18px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 8px 24px rgba(239,68,68,0.25)' }}><div style={{ fontSize: '28px', marginBottom: '10px' }}>⚠️</div><p style={{ margin: 0, fontSize: '12px', color: darkMode ? 'rgba(255,255,255,0.9)' : '#b91c1c', fontWeight: '600', marginBottom: '6px' }}>TOTAL DEBTS</p><EditableNumber value={totalDebts} onChange={()=>{}} prefix="¥" darkMode={darkMode} hideNumbers={hideNumbers} fontSize="26px" /></div>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' : 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)', padding: '24px 18px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 8px 24px rgba(139,92,246,0.25)' }}><div style={{ fontSize: '28px', marginBottom: '10px' }}>🎯</div><p style={{ margin: 0, fontSize: '12px', color: darkMode ? 'rgba(255,255,255,0.9)' : '#6d28d9', fontWeight: '600', marginBottom: '6px' }}>GOALS PROGRESS</p><p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: darkMode ? 'white' : '#5b21b6' }}>{hideNumbers ? '••••' : `¥${totalGoalsProgress.toLocaleString()} / ¥${totalGoalsTarget.toLocaleString()}`}</p><p style={{ margin: '6px 0 0 0', fontSize: '14px', color: darkMode ? 'rgba(255,255,255,0.8)' : '#7c3aed' }}>{hideNumbers ? '••••' : `${Math.round((totalGoalsProgress / totalGoalsTarget) * 100) || 0}%`}</p></div>
      </div>

      <div style={{ background: darkMode ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', padding: '28px', borderRadius: '20px', marginBottom: '28px', boxShadow: '0 12px 40px rgba(16,185,129,0.3)', border: `3px solid ${darkMode ? '#064e3b' : '#059669'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}><div style={{ fontSize: '36px' }}>💰</div><div style={{ flex: 1 }}><h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'white' }}>10% Auto-Savings Rule</h3><p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>You should save this month</p></div></div>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>Recommended Savings (10% of income)</span><span style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>{hideNumbers ? '¥••••' : `¥${recommendedSavings.toLocaleString()}`}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>Current Savings</span><EditableNumber value={savings} onChange={setSavings} prefix="¥" darkMode={darkMode} hideNumbers={hideNumbers} fontSize="20px" /></div>
          <div style={{ marginTop: '16px', height: '8px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${Math.min(100, (savings / recommendedSavings) * 100)}%`, height: '100%', background: 'white', borderRadius: '4px' }}></div></div>
        </div>
      </div>

      <CollapsibleSection title="Daily income" icon="📊" darkMode={darkMode} defaultOpen={true}>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}><input type="number" value={todayIncome} onChange={(e)=>setTodayIncome(e.target.value)} placeholder="Amount (¥)" style={{ flex: 1, padding: '16px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px', fontWeight: '600' }} /><button onClick={handleAddIncome} style={{ padding: '16px 32px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>Add</button></div>
        <p style={{ fontSize: '14px', color: darkMode ? '#94a3b8' : '#647480', marginTop: '12px', fontWeight: '500' }}>💡 {hideNumbers ? '••%' : `${investmentPercent}%`} auto-invested, {hideNumbers ? '••%' : `${goalAllocationPercent}%`} to goals</p>
        {dailyIncomes.length > 0 && (<div style={{ marginTop: '20px' }}><p style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', color: darkMode ? '#f8fafc' : '#0f172a' }}>Recent:</p>{dailyIncomes.slice(0, 5).map((inc, i) => (<div key={inc.id} style={{ padding: '14px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><span style={{ color: darkMode ? '#f8fafc' : '#0f172a', fontWeight: '600' }}>{inc.date}</span>{i===0&&<span style={{ marginLeft: '10px', fontSize: '11px', background: '#f59e0b', color: 'white', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>LATEST</span>}</div><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: '#14b8a6', fontWeight: '700', fontSize: '16px' }}>{hideNumbers ? '+¥••••' : `+¥${inc.amount.toLocaleString()}`}</span>{i===0&&<button onClick={()=>handleDeleteRecentIncome(inc.id)} style={{ padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>🗑️</button>}</div></div>))}</div>)}
      </CollapsibleSection>

      <CollapsibleSection title="Credit cards" icon="💳" darkMode={darkMode} defaultOpen={true}>
        <button onClick={()=>{setShowAddCard(true);setEditingCard(null);setNewCard({name:'',limit:'',available:'',balance:'',paymentDate:'26th',thisCyclePayment:'',nextCyclePayment:''});}} style={{ width: '100%', padding: '18px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>➕ Add New Card</button>
        <div style={{ marginTop: '20px', padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '16px' }}>
          <p style={{ margin: '0 0 14px 0', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px' }}>➕ Add Today's Expense</p>
          <div style={{ display: 'grid', gap: '12px' }}>
            <select value={newExpense.cardId} onChange={(e)=>setNewExpense({...newExpense,cardId:e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px', fontWeight: '500' }}><option value="">Select Card</option>{creditCards.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <input type="number" placeholder="Amount (¥)" value={newExpense.amount} onChange={(e)=>setNewExpense({...newExpense,amount:e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px', fontWeight: '500' }} />
            <select value={newExpense.category} onChange={(e)=>setNewExpense({...newExpense,category:e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px', fontWeight: '500' }}><option value="Shopping">🛒 Shopping</option><option value="Food">🍽️ Food</option><option value="Gas">⛽ Gas</option><option value="Transport">🚗 Transport</option><option value="Entertainment">🎬 Entertainment</option><option value="Health">💊 Health</option><option value="Other">📦 Other</option></select>
            <button onClick={handleAddCardExpense} style={{ padding: '14px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>Add Expense</button>
          </div>
        </div>
        {showAddCard && (<div style={{ marginTop: '20px', padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '16px', display: 'grid', gap: '12px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><h4 style={{ margin: 0, color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px', fontWeight: '700' }}>{editingCard ? '✏️ Edit Card' : '➕ New Card'}</h4><button onClick={()=>{setShowAddCard(false);setEditingCard(null);}} style={{ padding: '8px 14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>✕ Cancel</button></div><input type="text" placeholder="Card Name" value={newCard.name} onChange={(e)=>setNewCard({...newCard,name:e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px' }} /><input type="number" placeholder="Credit Limit (¥)" value={newCard.limit} onChange={(e)=>setNewCard({...newCard,limit:e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px' }} /><input type="number" placeholder="Remaining Amount (¥)" value={newCard.available} onChange={(e)=>setNewCard({...newCard,available:e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px' }} /><input type="number" placeholder="Current Debts (¥)" value={newCard.balance} onChange={(e)=>setNewCard({...newCard,balance:e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px' }} /><select value={newCard.paymentDate} onChange={(e)=>setNewCard({...newCard,paymentDate:e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px' }}><option value="10th">10th (Close: 25th)</option><option value="26th">26th (Close: 11th)</option><option value="27th">27th (Close: 12th)</option></select><input type="number" placeholder="This Month Payment (¥)" value={newCard.thisCyclePayment} onChange={(e)=>setNewCard({...newCard,thisCyclePayment:e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px' }} /><input type="number" placeholder="Next Month Payment (¥)" value={newCard.nextCyclePayment} onChange={(e)=>setNewCard({...newCard,nextCyclePayment:e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px' }} /><button onClick={handleAddCard} style={{ padding: '16px', background: editingCard ? '#f59e0b' : '#14b8a6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>{editingCard ? '💾 Update Card' : '➕ Add Card'}</button></div>)}
        <div style={{ marginTop: '20px' }}>
          {creditCards.map((card) => {
            const sp = Math.min(card.thisCyclePayment, cashAvailable), pp = card.thisCyclePayment > 0 ? Math.round((sp / card.thisCyclePayment) * 100) : 0;
            return (<div key={card.id} style={{ background: darkMode ? '#1e293b' : '#f8fafc', padding: '22px', borderRadius: '16px', marginBottom: '16px', boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.06)', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><h4 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a' }}>{card.name}</h4><div style={{ display: 'flex', gap: '10px' }}><button onClick={()=>handleEditCard(card)} style={{ padding: '8px 14px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>✏️</button><button onClick={()=>handleDeleteCard(card.id)} style={{ padding: '8px 14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>🗑️</button></div></div>
              <div style={{ padding: '14px', background: darkMode ? '#0f172a' : '#e2e8f0', borderRadius: '12px', marginBottom: '14px', fontSize: '14px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: darkMode ? '#94a3b8' : '#647480', fontWeight: '500' }}>📅 Closing:</span><strong style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>{card.closingDate}</strong></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: darkMode ? '#94a3b8' : '#647480', fontWeight: '500' }}>💰 Payment:</span><strong style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>{card.paymentDate}</strong></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px', marginBottom: '14px' }}><div><span style={{ color: darkMode ? '#94a3b8' : '#647480', fontWeight: '500' }}>Limit:</span> <strong style={{ color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px' }}>{hideNumbers ? '¥••••' : `¥${card.limit.toLocaleString()}`}</strong></div><div><span style={{ color: darkMode ? '#94a3b8' : '#647480', fontWeight: '500' }}>Remaining:</span> <strong style={{ color: '#14b8a6', fontSize: '16px' }}>{hideNumbers ? '¥••••' : `¥${card.available.toLocaleString()}`}</strong></div><div style={{ gridColumn: 'span 2' }}><span style={{ color: darkMode ? '#94a3b8' : '#647480', fontWeight: '500' }}>Current Debts:</span> <strong style={{ color: '#ef4444', fontSize: '18px', fontWeight: '700' }}>{hideNumbers ? '¥••••' : `¥${card.balance.toLocaleString()}`}</strong></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}><div style={{ padding: '14px', background: darkMode ? '#059669' : '#d1fae5', borderRadius: '12px' }}><p style={{ margin: 0, fontSize: '12px', color: darkMode ? 'rgba(255,255,255,0.9)' : '#059669', fontWeight: '600', marginBottom: '4px' }}>This Month</p><p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: darkMode ? 'white' : '#059669' }}>{hideNumbers ? '¥••••' : `¥${card.thisCyclePayment.toLocaleString()}`}</p></div><div style={{ padding: '14px', background: darkMode ? '#0891b2' : '#cffafe', borderRadius: '12px' }}><p style={{ margin: 0, fontSize: '12px', color: darkMode ? 'rgba(255,255,255,0.9)' : '#0e7490', fontWeight: '600', marginBottom: '4px' }}>Next Month</p><p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: darkMode ? 'white' : '#0e7490' }}>{hideNumbers ? '¥••••' : `¥${card.nextCyclePayment.toLocaleString()}`}</p></div></div>
              {card.thisCyclePayment > 0 && (<div style={{ background: darkMode ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', padding: '16px', borderRadius: '12px', marginBottom: '14px', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}><p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '600', color: 'white' }}>💡 Smart Payment</p><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}><span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>You can pay:</span><span style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>{hideNumbers ? '¥••••' : `¥${sp.toLocaleString()}`}</span></div><p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>{pp}% of this month's payment</p><div style={{ display: 'flex', gap: '10px' }}><input type="number" placeholder="Custom Amount" id={`pay-${card.id}`} defaultValue={sp} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '15px', fontWeight: '600' }} /><button onClick={()=>handlePayCard(card.id,parseFloat(document.getElementById(`pay-${card.id}`).value)||sp)} style={{ padding: '12px 24px', background: 'white', color: '#059669', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>Pay</button></div></div>)}
              <div style={{ display: 'flex', gap: '12px' }}><input type="number" placeholder="Amount" id={`pay-manual-${card.id}`} defaultValue={card.thisCyclePayment} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px', fontWeight: '600' }} /><button onClick={()=>handlePayCard(card.id,parseFloat(document.getElementById(`pay-manual-${card.id}`).value)||card.thisCyclePayment)} style={{ padding: '14px 28px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>Pay</button></div>
            </div>);
          })}
        </div>
        {cardExpenses.length > 0 && (<div style={{ marginTop: '24px' }}><p style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', color: darkMode ? '#f8fafc' : '#0f172a' }}>📜 Recent Expenses:</p>{cardExpenses.slice(0, 10).map((exp) => (<div key={exp.id} style={{ padding: '14px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: darkMode ? '#f8fafc' : '#0f172a' }}>{getCategoryIcon(exp.category)} {exp.category}</p><p style={{ margin: '4px 0 0 0', fontSize: '13px', color: darkMode ? '#94a3b8' : '#647480' }}>{exp.cardName} • {exp.date}</p></div><div style={{ textAlign: 'right' }}><p style={{ margin: 0, fontWeight: '700', color: '#ef4444', fontSize: '16px' }}>{hideNumbers ? '¥••••' : `¥${exp.amount.toLocaleString()}`}</p><p style={{ margin: '4px 0 0 0', fontSize: '12px', color: exp.cycle === 'This Month' ? '#14b8a6' : '#f59e0b', fontWeight: '600' }}>{exp.cycle}</p></div></div>))}</div>)}
      </CollapsibleSection>

      <CollapsibleSection title="🔁 Recurring Expenses" icon="🔄" darkMode={darkMode}>
        <button onClick={()=>{setShowAddRecurring(true);setNewRecurring({name:'',amount:'',frequency:'monthly',category:'Home',nextDue:new Date().toISOString().split('T')[0]});}} style={{ width: '100%', padding: '16px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>➕ Add Recurring Expense</button>
        {showAddRecurring && (<div style={{ padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '16px', marginBottom: '20px', display: 'grid', gap: '12px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h4 style={{ margin: 0, color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px', fontWeight: '700' }}>New Recurring</h4><button onClick={()=>setShowAddRecurring(false)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✕</button></div><input type="text" placeholder="Name (e.g., Netflix, Rent)" value={newRecurring.name} onChange={(e)=>setNewRecurring({...newRecurring,name:e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} /><input type="number" placeholder="Amount (¥)" value={newRecurring.amount} onChange={(e)=>setNewRecurring({...newRecurring,amount:e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} /><select value={newRecurring.frequency} onChange={(e)=>setNewRecurring({...newRecurring,frequency:e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }}><option value="weekly">📅 Weekly</option><option value="monthly">📆 Monthly</option><option value="yearly">🗓️ Yearly</option></select><select value={newRecurring.category} onChange={(e)=>setNewRecurring({...newRecurring,category:e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }}><option value="Home">🏠 Home</option><option value="Transport">🚗 Transport</option><option value="Entertainment">🎬 Entertainment</option><option value="Health">💊 Health</option><option value="Other">📦 Other</option></select><input type="date" value={newRecurring.nextDue} onChange={(e)=>setNewRecurring({...newRecurring,nextDue:e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px' }} /><button onClick={handleAddRecurring} style={{ padding: '14px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>✅ Save</button></div>)}
        {recurringExpenses.length > 0 && (<div><button onClick={handleProcessRecurring} style={{ width: '100%', padding: '12px', background: darkMode ? '#059669' : '#d1fae5', color: darkMode ? 'white' : '#059669', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', marginBottom: '16px' }}>🔄 Process Today's Recurring</button>{recurringExpenses.map(r=>(<div key={r.id} style={{ padding: '14px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><p style={{ margin: 0, fontWeight: '600', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px' }}>{r.name}</p><p style={{ margin: '4px 0 0 0', fontSize: '13px', color: darkMode ? '#94a3b8' : '#647480' }}>{hideNumbers?'¥••••':`¥${r.amount.toLocaleString()}`} • {r.frequency} • Next: {r.nextDue}</p></div><div style={{ display: 'flex', gap: '8px' }}><button onClick={()=>setRecurringExpenses(p=>p.map(x=>x.id===r.id?{...x,active:!x.active}:x))} style={{ padding: '6px 12px', background: r.active ? '#14b8a6' : '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>{r.active?'✓ Active':'⊘ Paused'}</button><button onClick={()=>handleDeleteRecurring(r.id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button></div></div>))}</div>)}
      </CollapsibleSection>

      <CollapsibleSection title="📊 Analytics Dashboard" icon="📈" darkMode={darkMode} defaultOpen={false}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}><select value={analyticsPeriod} onChange={(e)=>setAnalyticsPeriod(parseInt(e.target.value))} style={{ padding: '10px 14px', borderRadius: '10px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '14px', fontWeight: '500' }}><option value={3}>Last 3 months</option><option value={6}>Last 6 months</option><option value={12}>Last 12 months</option></select></div>
        <div style={{ background: darkMode ? '#1e293b' : '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}><h4 style={{ margin: '0 0 16px 0', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px', fontWeight: '700' }}>💰 Income vs Expenses Trend</h4><BarChart data={monthlyTrendData.flatMap(d=>[{label:`${d.label}↗`,value:d.income,color:'#14b8a6'},{label:`${d.label}↘`,value:d.expenses,color:'#ef4444'}])} darkMode={darkMode} hideNumbers={hideNumbers} maxValue={maxTrendValue} /><div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '12px', fontSize: '13px' }}><span style={{ color: '#14b8a6', fontWeight: '600' }}>● Income</span><span style={{ color: '#ef4444', fontWeight: '600' }}>● Expenses</span></div></div>
        {spendingChartData.length > 0 && (<div style={{ background: darkMode ? '#1e293b' : '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}><h4 style={{ margin: '0 0 16px 0', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px', fontWeight: '700' }}>🥧 Spending by Category (This Month)</h4><div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}><PieChart data={spendingChartData} darkMode={darkMode} hideNumbers={hideNumbers} /><div style={{ flex: 1, minWidth: '150px' }}>{spendingChartData.map((item,i)=>(<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}><div style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.color }} /><span style={{ fontSize: '14px', color: darkMode ? '#f8fafc' : '#0f172a', flex: 1 }}>{item.label}</span><span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#94a3b8' : '#647480' }}>{hideNumbers?'••••':`${Math.round((item.value/spendingChartData.reduce((s,x)=>s+x.value,0))*100)}%`}</span></div>))}</div></div></div>)}
        <div style={{ background: darkMode ? '#1e293b' : '#f8fafc', padding: '20px', borderRadius: '16px' }}><h4 style={{ margin: '0 0 16px 0', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px', fontWeight: '700' }}>🎯 Savings Progress (Last {analyticsPeriod} Months)</h4><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>{monthlyTrendData.map((m,i)=>{const r=m.income>0?Math.round((m.income-m.expenses)/m.income*100):0,p=m.income-m.expenses>=0;return(<div key={i} style={{ padding: '14px', borderRadius: '12px', background: p?(darkMode?'linear-gradient(135deg,#059669,#10b981)':'linear-gradient(135deg,#d1fae5,#a7f3d0)'):(darkMode?'linear-gradient(135deg,#dc2626,#ef4444)':'linear-gradient(135deg,#fee2e2,#fecaca)'), textAlign: 'center' }}><p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: p?(darkMode?'white':'#059669'):(darkMode?'white':'#dc2626') }}>{m.label}</p><p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: darkMode?'white':(p?'#059669':'#dc2626') }}>{hideNumbers?'••••':`${r}%`}</p><p style={{ margin: '4px 0 0 0', fontSize: '11px', color: darkMode?'rgba(255,255,255,0.9)':(p?'#059669':'#dc2626'), opacity: 0.9 }}>saved</p></div>);})}</div></div>
      </CollapsibleSection>

      <CollapsibleSection title="📅 Financial Calendar" icon="🗓️" darkMode={darkMode}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}><button onClick={()=>setCalendarView('list')} style={{ padding: '10px 16px', background: calendarView==='list'?'#14b8a6':(darkMode?'#1e293b':'#f1f5f9'), color: calendarView==='list'?'white':(darkMode?'#f8fafc':'#0f172a'), border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>List View</button></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>{calendarEvents.length===0?<p style={{ textAlign: 'center', color: darkMode?'#94a3b8':'#647480', padding: '20px' }}>No events for {currentMonth}</p>:calendarEvents.map((e,i)=>(<div key={i} style={{ padding: '14px', background: darkMode?'#1e293b':'#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${e.type==='income'?'#14b8a6':e.type==='payment'?'#ef4444':e.type==='family'?'#8b5cf6':'#f59e0b'}` }}><div><p style={{ margin: 0, fontWeight: '600', color: darkMode?'#f8fafc':'#0f172a', fontSize: '15px' }}>{e.label}</p><p style={{ margin: '4px 0 0 0', fontSize: '13px', color: darkMode?'#94a3b8':'#647480' }}>{e.date}</p></div><span style={{ fontWeight: '700', fontSize: '16px', color: e.type==='income'?'#14b8a6':'#ef4444' }}>{e.type==='income'?'+':'-'}{hideNumbers?'¥••••':`¥${e.amount.toLocaleString()}`}</span></div>))}</div>
      </CollapsibleSection>

      <CollapsibleSection title="Trust funds & investment" icon="🏦" darkMode={darkMode}>
        <div style={{ marginTop: '20px' }}><label style={{ fontSize: '15px', color: darkMode ? '#94a3b8' : '#647480', fontWeight: '600' }}>Auto-invest %:</label><div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}><input type="number" value={investmentPercent} onChange={(e)=>setInvestmentPercent(parseFloat(e.target.value)||0)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px', fontWeight: '600' }} /><span style={{ padding: '14px', color: darkMode ? '#f8fafc' : '#0f172a', fontWeight: '700', fontSize: '16px' }}>%</span></div></div>
        <div style={{ marginTop: '24px', padding: '20px', background: darkMode ? '#059669' : '#d1fae5', borderRadius: '16px' }}><p style={{ margin: 0, fontSize: '14px', color: darkMode ? 'rgba(255,255,255,0.9)' : '#059669', fontWeight: '600', marginBottom: '6px' }}>Trust Fund Total</p><EditableNumber value={trustFund} onChange={setTrustFund} prefix="¥" darkMode={darkMode} hideNumbers={hideNumbers} fontSize="32px" /></div>
        <div style={{ marginTop: '18px', padding: '18px', background: darkMode ? '#0891b2' : '#cffafe', borderRadius: '16px' }}><p style={{ margin: 0, fontSize: '14px', color: darkMode ? 'rgba(255,255,255,0.9)' : '#0e7490', fontWeight: '600', marginBottom: '6px' }}>SPUS Shares</p><EditableNumber value={spusShares} onChange={setSpusShares} prefix="" darkMode={darkMode} hideNumbers={hideNumbers} fontSize="26px" /></div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}><input type="number" placeholder="Amount to invest" id="invest-amount" style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px', fontWeight: '600' }} /><button onClick={()=>{const a=parseFloat(document.getElementById('invest-amount').value);if(a&&a<=cashAvailable){setTrustFund(p=>p+a);setSavings(p=>p+a);setCashAvailable(p=>p-a);alert('✅ Invested!');}else{alert('❌ Invalid');}}} style={{ padding: '14px 32px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>Invest</button></div>
      </CollapsibleSection>

      <CollapsibleSection title="Family support manager" icon="👨‍👩‍👧" darkMode={darkMode}>
        <div style={{ marginTop: '20px' }}>
          {Object.entries(familySupport).map(([k,v])=>(<div key={k} style={{ padding: '18px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '14px', marginBottom: '12px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><p style={{ margin: 0, fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px' }}>{k==='parents'?'🇯🇵 Parents (Japan)':k==='daughter'?'🇮 Daughter (Italy)':'🎁 Other Expenses'}</p><p style={{ margin: '6px 0 0 0', fontSize: '14px', color: darkMode ? '#94a3b8' : '#647480' }}>Monthly: {hideNumbers?'¥••••':`¥${v.amount.toLocaleString()}`}</p><p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#f59e0b', fontWeight: '600' }}>📅 {v.scheduledDate}</p>{v.lastPaid&&<p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#14b8a6', fontWeight: '600' }}>✓ Last: {v.lastPaid}</p>}<button onClick={()=>handleSendFamilySupport(k,v.amount)} style={{ padding: '12px 24px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>Send</button></div></div>))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Health funds" icon="🏥" darkMode={darkMode}>
        <div style={{ marginTop: '20px', padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '16px' }}>
          <p style={{ margin: 0, fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px' }}>💇 Hair Transplant Plan</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', marginBottom: '12px' }}><span style={{ color: darkMode ? '#94a3b8' : '#647480', fontWeight: '600' }}>Saved:</span><strong style={{ color: '#14b8a6', fontSize: '18px' }}>{hideNumbers?'¥••••':`¥${healthFunds.hairTransplant.current.toLocaleString()}`} / {hideNumbers?'¥••••':`¥${healthFunds.hairTransplant.goal.toLocaleString()}`}</strong></div>
          <div style={{ width: '100%', height: '10px', background: darkMode ? '#0f172a' : '#e2e8f0', borderRadius: '6px', marginTop: '12px', overflow: 'hidden' }}><div style={{ width: `${(healthFunds.hairTransplant.current/healthFunds.hairTransplant.goal)*100}%`, height: '100%', background: '#14b8a6', borderRadius: '6px' }}></div></div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}><input type="number" placeholder="Amount" id="health-amount" style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px', fontWeight: '600' }} /><button onClick={()=>handleAddHealthFund(parseFloat(document.getElementById('health-amount').value))} style={{ padding: '14px 32px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>Add</button></div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Home expenses" icon="🏠" darkMode={darkMode}>
        <div style={{ marginTop: '20px', display: 'grid', gap: '12px' }}>
          {['food','gas','electricity'].map(t=>(<div key={t} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><span style={{ width: '120px', color: darkMode ? '#f8fafc' : '#0f172a', fontWeight: '600', textTransform: 'capitalize', fontSize: '15px' }}>{t}</span><input type="number" placeholder="Amount" id={`home-${t}`} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px', fontWeight: '600' }} /><button onClick={()=>handleAddHomeExpense(t,parseFloat(document.getElementById(`home-${t}`).value))} style={{ padding: '14px 24px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>Add</button></div>))}
        </div>
        <div style={{ marginTop: '18px', padding: '16px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '12px' }}><p style={{ margin: 0, fontSize: '15px', color: darkMode ? '#94a3b8' : '#647480', fontWeight: '600' }}>This Month Total: <strong style={{ color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '18px' }}>{hideNumbers?'¥••••':`¥${(homeExpenses.food+homeExpenses.gas+homeExpenses.electricity).toLocaleString()}`}</strong></p></div>
      </CollapsibleSection>

      <CollapsibleSection title="Car expenses" icon="🚗" darkMode={darkMode}>
        <div style={{ marginTop: '20px' }}>
          <div style={{ padding: '18px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '14px', marginBottom: '18px' }}><p style={{ margin: 0, fontWeight: '700', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px' }}>⛽ Daily Oil</p><div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}><span style={{ color: darkMode ? '#94a3b8' : '#647480', fontWeight: '600' }}>Per Day:</span><strong style={{ color: '#f59e0b', fontSize: '16px' }}>{hideNumbers?'¥••••':`¥${carExpenses.dailyOil.toLocaleString()}`} (Max: {hideNumbers?'¥••••':`¥${carExpenses.maxDailyOil.toLocaleString()}`})</strong></div><div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}><span style={{ color: darkMode ? '#94a3b8' : '#647480', fontWeight: '600' }}>This Month:</span><strong style={{ color: '#ef4444', fontSize: '16px' }}>{hideNumbers?'¥••••':`¥${carExpenses.totalThisMonth.toLocaleString()}`}</strong></div></div>
          <button onClick={handleAddCarExpense} style={{ width: '100%', padding: '16px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>Add Today's Oil ({hideNumbers?'¥••••':`¥${carExpenses.dailyOil.toLocaleString()}`})</button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Pensions & Insurance" icon="🛡️" darkMode={darkMode}>
        <div style={{ marginTop: '20px', display: 'grid', gap: '12px' }}>
          {[{k:'nationalPension',l:'🏛️ National Pension'},{k:'healthInsurance',l:'🏥 Health Insurance'},{k:'carInsurance',l:'🚗 Car Insurance'},{k:'lifeInsurance',l:'💼 Life Insurance'},{k:'taxes',l:'📋 Taxes'}].map(i=>(<div key={i.k} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><span style={{ width: '160px', color: darkMode ? '#f8fafc' : '#0f172a', fontWeight: '600', fontSize: '14px' }}>{i.l}</span><input type="number" placeholder="Amount" id={`pension-${i.k}`} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px', fontWeight: '600' }} /><button onClick={()=>handleAddPensionInsurance(i.k,parseFloat(document.getElementById(`pension-${i.k}`).value))} style={{ padding: '14px 24px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>Add</button></div>))}
        </div>
        <div style={{ marginTop: '18px', padding: '18px', background: darkMode ? '#7c3aed' : '#ddd6fe', borderRadius: '14px' }}><p style={{ margin: 0, fontSize: '15px', color: darkMode ? 'white' : '#6d28d9', fontWeight: '600' }}>Total This Month: <strong style={{ fontSize: '20px', color: darkMode ? 'white' : '#5b21b6' }}>{hideNumbers?'¥••••':`¥${pensionsInsurance.total.toLocaleString()}`}</strong></p></div>
      </CollapsibleSection>

      <CollapsibleSection title="Monthly Goals" icon="🎯" darkMode={darkMode}>
        <button onClick={()=>{setShowAddGoal(true);setEditingGoal(null);setNewGoal({name:'',target:'',color:'#14b8a6',priority:'medium'});}} style={{ width: '100%', padding: '18px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>➕ Add Goal</button>
        {showAddGoal && (<div style={{ marginTop: '20px', padding: '20px', background: darkMode ? '#1e293b' : '#f8fafc', borderRadius: '16px', display: 'grid', gap: '12px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h4 style={{ margin: 0, color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '16px', fontWeight: '700' }}>{editingGoal?'✏️ Edit Goal':'➕ New Goal'}</h4><button onClick={()=>{setShowAddGoal(false);setEditingGoal(null);}} style={{ padding: '8px 14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>✕ Cancel</button></div><input type="text" placeholder="Goal Name" value={newGoal.name} onChange={(e)=>setNewGoal({...newGoal,name:e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px' }} /><input type="number" placeholder="Target Amount (¥)" value={newGoal.target} onChange={(e)=>setNewGoal({...newGoal,target:e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px' }} /><select value={newGoal.priority} onChange={(e)=>setNewGoal({...newGoal,priority:e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${darkMode ? '#334155' : '#e2e8f0'}`, background: darkMode ? '#0f172a' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '15px' }}><option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option></select><button onClick={handleAddGoal} style={{ padding: '16px', background: editingGoal?'#f59e0b':'#14b8a6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>{editingGoal?'💾 Update':'➕ Add'}</button></div>)}
        <div style={{ marginTop: '20px' }}>{monthlyGoals.map(g=>{const p=g.target>0?Math.round((g.current/g.target)*100):0;return(<div key={g.id} style={{ background: darkMode?'#1e293b':'#f8fafc',padding:'18px',borderRadius:'14px',marginBottom:'12px',borderLeft:`4px solid ${g.color}` }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><h4 style={{ margin: 0, color: darkMode?'#f8fafc':'#0f172a', fontSize: '16px', fontWeight: '700' }}>{g.name} <span style={{ fontSize: '12px', padding: '2px 6px', borderRadius: '6px', background: g.priority==='high'?'#ef4444':g.priority==='medium'?'#f59e0b':'#14b8a6', color: 'white', marginLeft: '8px' }}>{g.priority}</span></h4><div style={{ display: 'flex', gap: '8px' }}><button onClick={()=>handleEditGoal(g)} style={{ padding: '6px 10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✏️</button><button onClick={()=>handleDeleteGoal(g.id)} style={{ padding: '6px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button></div></div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: darkMode?'#94a3b8':'#647480', fontSize: '14px' }}>{hideNumbers?'¥••••':`¥${g.current.toLocaleString()}`} / {hideNumbers?'¥••••':`¥${g.target.toLocaleString()}`}</span><span style={{ color: darkMode?'#f8fafc':'#0f172a', fontWeight: '600', fontSize: '14px' }}>{p}%</span></div><div style={{ width: '100%', height: '8px', background: darkMode?'#0f172a':'#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${p}%`, height: '100%', background: g.color, borderRadius: '4px' }}></div></div><div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}><input type="number" placeholder="Contribute" id={`goal-${g.id}`} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${darkMode?'#334155':'#e2e8f0'}`, background: darkMode?'#0f172a':'white', color: darkMode?'#f8fafc':'#0f172a', fontSize: '14px' }} /><button onClick={()=>handleContributeToGoal(g.id,parseFloat(document.getElementById(`goal-${g.id}`).value))} style={{ padding: '10px 20px', background: '#14b8a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Add</button></div></div>);})}</div>
      </CollapsibleSection>

      <CollapsibleSection title="Monthly summary" icon="📈" darkMode={darkMode} defaultOpen={true}>
        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          <div style={{ padding: '18px', background: darkMode ? '#059669' : '#d1fae5', borderRadius: '14px', textAlign: 'center' }}><p style={{ margin: 0, fontSize: '13px', color: darkMode ? 'rgba(255,255,255,0.9)' : '#059669', fontWeight: '600', marginBottom: '6px' }}>M Income</p><EditableNumber value={monthlyIncome} onChange={setMonthlyIncome} prefix="¥" darkMode={darkMode} hideNumbers={hideNumbers} fontSize="24px" /></div>
          <div style={{ padding: '18px', background: darkMode ? '#dc2626' : '#fee2e2', borderRadius: '14px', textAlign: 'center' }}><p style={{ margin: 0, fontSize: '13px', color: darkMode ? 'rgba(255,255,255,0.9)' : '#b91c1c', fontWeight: '600', marginBottom: '6px' }}>M Expenses</p><EditableNumber value={monthlyExpenses} onChange={setMonthlyExpenses} prefix="¥" darkMode={darkMode} hideNumbers={hideNumbers} fontSize="24px" /></div>
          <div style={{ padding: '18px', background: darkMode ? '#0891b2' : '#cffafe', borderRadius: '14px', textAlign: 'center' }}><p style={{ margin: 0, fontSize: '13px', color: darkMode ? 'rgba(255,255,255,0.9)' : '#0e7490', fontWeight: '600', marginBottom: '6px' }}>M Savings</p><EditableNumber value={savings} onChange={setSavings} prefix="¥" darkMode={darkMode} hideNumbers={hideNumbers} fontSize="24px" /></div>
        </div>
      </CollapsibleSection>

      <footer style={{ textAlign: 'center', padding: '24px', color: darkMode ? '#64748b' : '#94a3b8', fontSize: '14px', marginTop: '32px', borderTop: `2px solid ${darkMode ? '#1e293b' : '#e2e8f0'}` }}><p style={{ margin: 0, fontWeight: '500' }}>© 2026 {appName} • Smart Financial Management</p><p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: 0.8 }}>✨ Analytics • Recurring • CSV Export • Alerts • Calendar • Optimized</p></footer>
    </div>
  );
}

export default App;
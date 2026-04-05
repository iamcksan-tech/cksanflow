import { useState, useEffect } from 'react';
import './App.css';
import DailyIncome from './DailyIncome';
import CreditCards from './CreditCards';
import TrustFund from './TrustFund';
import FamilySupport from './FamilySupport';
import GoalTracker from './GoalTracker';
import MonthlySummary from './MonthlySummary';
import Settings from './Settings';
import { saveData, loadData } from './dataStorage';

function App() {
  const [cashAvailable, setCashAvailable] = useState(() => loadData('cash', 0));
  const [totalDebts, setTotalDebts] = useState(() => loadData('debts', 300000));
  const [incomeHistory, setIncomeHistory] = useState(() => loadData('income', []));
  const [dailyIncomeInput, setDailyIncomeInput] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ckSanFlow_darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    saveData('cash', cashAvailable);
    saveData('debts', totalDebts);
    saveData('income', incomeHistory);
  }, [cashAvailable, totalDebts, incomeHistory]);

  useEffect(() => {
    const saved = localStorage.getItem('ckSanFlow_darkMode');
    if (saved) {
      const isDark = JSON.parse(saved);
      setDarkMode(isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
  }, []);

  const handleIncomeAdded = (incomeData) => {
    setIncomeHistory([incomeData, ...incomeHistory]);
    setCashAvailable(cashAvailable + incomeData.amount);
    setDailyIncomeInput(incomeData.amount);
  };

  const handleReset = () => {
    setCashAvailable(0);
    setTotalDebts(300000);
    setIncomeHistory([]);
    setDailyIncomeInput(0);
  };

  return (
    <div className="App">
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px',
        color: 'white',
        textAlign: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{ margin: 0, fontSize: '42px' }}>💰 CkSanFlow</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '18px', opacity: 0.9 }}>
          Your Financial Freedom Journey
        </p>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.8 }}>
          💵 Cash: ¥{cashAvailable.toLocaleString()} | 📉 Debts: ¥{totalDebts.toLocaleString()}
        </p>
      </header>

      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            padding: '25px',
            borderRadius: '15px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>💵 Cash Available</h3>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>¥{cashAvailable.toLocaleString()}</p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: '25px',
            borderRadius: '15px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>📉 Total Debts</h3>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>¥{totalDebts.toLocaleString()}</p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            padding: '25px',
            borderRadius: '15px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>📋 Other Debts</h3>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>2 Active</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>Parents + Daughter</p>
          </div>
        </div>

        <MonthlySummary 
          cashAvailable={cashAvailable}
          totalDebts={totalDebts}
          incomeHistory={incomeHistory}
        />

        <DailyIncome onIncomeAdded={handleIncomeAdded} />

        <CreditCards 
          totalDebts={totalDebts} 
          setTotalDebts={setTotalDebts}
          cashAvailable={cashAvailable}
          setCashAvailable={setCashAvailable}
        />

        <TrustFund 
          cashAvailable={cashAvailable}
          setCashAvailable={setCashAvailable}
          dailyIncome={dailyIncomeInput}
        />

        <FamilySupport 
          cashAvailable={cashAvailable}
          setCashAvailable={setCashAvailable}
        />

        <GoalTracker 
          cashAvailable={cashAvailable}
          setCashAvailable={setCashAvailable}
        />

        <Settings 
          onReset={handleReset}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {incomeHistory.length > 0 && (
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <h2 style={{ color: '#333', marginBottom: '20px', fontSize: '24px' }}>📜 Recent Income</h2>
            {incomeHistory.slice(0, 10).map((income) => (
              <div key={income.id} style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>{income.date}</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                    {income.hoursWorked && `${income.hoursWorked} hrs • `}
                    {income.projectsCompleted && `${income.projectsCompleted} projects`}
                  </p>
                </div>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#11998e', fontSize: '20px' }}>
                  +¥{income.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer style={{
        background: '#f8f9fa',
        padding: '20px',
        textAlign: 'center',
        color: '#666',
        marginTop: '30px'
      }}>
        <p style={{ margin: 0 }}>
          🚀 Built with ❤️ for your financial freedom journey
        </p>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
          © 2026 CkSanFlow - All your finances in one place
        </p>
      </footer>
    </div>
  );
}

export default App;
import { useState, useEffect } from 'react';

function MonthlySummary({ cashAvailable, totalDebts, incomeHistory }) {
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));

  const monthlyIncome = incomeHistory
    .filter(income => income.date.startsWith(currentMonth))
    .reduce((sum, income) => sum + income.amount, 0);

  const monthlyExpenses = incomeHistory.length > 0 ? monthlyIncome - cashAvailable : 0;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  const months = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push(date.toISOString().slice(0, 7));
  }

  return (
    <div style={{
      background: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginBottom: '30px'
    }}>
      <h2 style={{ color: '#333', fontSize: '24px', margin: '0 0 20px 0' }}>
        📊 Monthly Summary
      </h2>

      {/* Month Selector */}
      <select
        value={currentMonth}
        onChange={(e) => setCurrentMonth(e.target.value)}
        style={{
          padding: '10px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          fontSize: '16px',
          marginBottom: '20px',
          width: '200px'
        }}
      >
        {months.map(month => (
          <option key={month} value={month}>
            {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </option>
        ))}
      </select>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          padding: '20px',
          borderRadius: '15px',
          color: 'white'
        }}>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Income This Month</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>¥{monthlyIncome.toLocaleString()}</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '20px',
          borderRadius: '15px',
          color: 'white'
        }}>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Expenses This Month</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>¥{monthlyExpenses.toLocaleString()}</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '20px',
          borderRadius: '15px',
          color: 'white'
        }}>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Savings Rate</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>{savingsRate.toFixed(1)}%</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '15px',
          color: 'white'
        }}>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Current Cash</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>¥{cashAvailable.toLocaleString()}</p>
        </div>
      </div>

      {/* Debt Overview */}
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📉 Debt Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Total Debts</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>¥{totalDebts.toLocaleString()}</p>
          </div>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Days to Debt-Free</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>
              {monthlyIncome > 0 ? Math.ceil(totalDebts / (monthlyIncome * 0.5)) : '∞'} days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonthlySummary;
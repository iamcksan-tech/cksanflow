import { useState } from 'react';

function TrustFund({ cashAvailable, setCashAvailable, dailyIncome }) {
  const [trustFund, setTrustFund] = useState({
    current: 50000,
    goal: 500000,
    monthlyContribution: 0
  });

  const [spusInvestment, setSpusInvestment] = useState({
    shares: 0,
    pricePerShare: 2500,
    monthlyGoal: 2,
    invested: 0
  });

  const [charity, setCharity] = useState({
    monthly: 10000,
    totalGiven: 0
  });

  const [dailyExpenses, setDailyExpenses] = useState({
    gas: 2000,
    electricity: 0,
    gasWater: 0,
    shopping: 0
  });

  const [contributions, setContributions] = useState([]);

  // Calculate suggested amounts based on daily income
  const calculateSuggestions = () => {
    if (!dailyIncome || dailyIncome === 0) return null;

    return {
      trustFund: Math.round(dailyIncome * 0.1), // 10% to trust fund
      spus: spusInvestment.pricePerShare * spusInvestment.monthlyGoal, // 2 shares
      charity: charity.monthly / 30, // Daily portion
      gas: dailyExpenses.gas
    };
  };

  const suggestions = calculateSuggestions();

  const handleContribute = (type, amount) => {
    if (amount > cashAvailable) {
      alert('❌ Insufficient cash available!');
      return;
    }

    if (type === 'trust') {
      setTrustFund({
        ...trustFund,
        current: trustFund.current + amount,
        monthlyContribution: trustFund.monthlyContribution + amount
      });
    } else if (type === 'spus') {
      const shares = Math.floor(amount / spusInvestment.pricePerShare);
      setSpusInvestment({
        ...spusInvestment,
        shares: spusInvestment.shares + shares,
        invested: spusInvestment.invested + amount
      });
    } else if (type === 'charity') {
      setCharity({
        ...charity,
        totalGiven: charity.totalGiven + amount
      });
    }

    setCashAvailable(cashAvailable - amount);
    setContributions([{
      id: Date.now(),
      type,
      amount,
      date: new Date().toISOString().split('T')[0]
    }, ...contributions]);

    alert(`✅ ¥${amount.toLocaleString()} contributed to ${type.toUpperCase()}!`);
  };

  const trustFundProgress = (trustFund.current / trustFund.goal) * 100;
  const remainingToGoal = trustFund.goal - trustFund.current;

  return (
    <div style={{
      background: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginBottom: '30px'
    }}>
      <h2 style={{ color: '#333', fontSize: '24px', margin: '0 0 20px 0' }}>
        🏦 Trust Fund & Investments
      </h2>

      {/* Suggestions based on daily income */}
      {suggestions && (
        <div style={{
          background: '#fef3c7',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '2px solid #f59e0b'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#92400e', fontSize: '16px' }}>
            💡 Today's Suggestions (based on ¥{dailyIncome?.toLocaleString()} income):
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Trust Fund:</p>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#11998e' }}>¥{suggestions.trustFund.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>SPUS (2 shares):</p>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#667eea' }}>¥{suggestions.spus.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Charity:</p>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#f59e0b' }}>¥{suggestions.charity.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Gas:</p>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#ef4444' }}>¥{suggestions.gas.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Trust Fund Goal */}
      <div style={{
        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        padding: '25px',
        borderRadius: '15px',
        color: 'white',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>🏦 Trust Fund</h3>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Emergency Savings</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>¥{trustFund.current.toLocaleString()}</p>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>of ¥{trustFund.goal.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '15px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '15px'
        }}>
          <div style={{
            width: `${trustFundProgress}%`,
            height: '100%',
            background: 'white',
            borderRadius: '10px',
            transition: 'width 0.3s'
          }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span>Progress: {trustFundProgress.toFixed(1)}%</span>
          <span>Remaining: ¥{remainingToGoal.toLocaleString()}</span>
        </div>

        {/* Contribute Button */}
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <input
            type="number"
            placeholder="Amount (¥)"
            id="trust-amount"
            defaultValue={suggestions?.trustFund}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px'
            }}
          />
          <button
            onClick={() => {
              const amount = document.getElementById('trust-amount').value;
              handleContribute('trust', parseFloat(amount) || suggestions.trustFund);
            }}
            style={{
              background: 'white',
              color: '#11998e',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            💰 Contribute
          </button>
        </div>
      </div>

      {/* SPUS Investment */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '25px',
        borderRadius: '15px',
        color: 'white',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>📈 SPUS Investment</h3>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>{spusInvestment.shares} shares owned</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>¥{spusInvestment.invested.toLocaleString()}</p>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Invested Total</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Price per Share:</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: 'bold' }}>¥{spusInvestment.pricePerShare.toLocaleString()}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Monthly Goal:</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: 'bold' }}>{spusInvestment.monthlyGoal} shares</p>
          </div>
        </div>

        {/* Buy Shares Button */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number"
            placeholder="Amount (¥)"
            id="spus-amount"
            defaultValue={suggestions?.spus}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px'
            }}
          />
          <button
            onClick={() => {
              const amount = document.getElementById('spus-amount').value;
              handleContribute('spus', parseFloat(amount) || suggestions.spus);
            }}
            style={{
              background: 'white',
              color: '#667eea',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📊 Buy Shares
          </button>
        </div>
      </div>

      {/* Charity */}
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        padding: '25px',
        borderRadius: '15px',
        color: 'white',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>🤲 Charity</h3>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Monthly: ¥{charity.monthly.toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>¥{charity.totalGiven.toLocaleString()}</p>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Total Given</p>
          </div>
        </div>

        <button
          onClick={() => handleContribute('charity', charity.monthly)}
          style={{
            marginTop: '15px',
            background: 'white',
            color: '#f59e0b',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          💝 Donate Monthly Amount
        </button>
      </div>

      {/* Daily Expenses */}
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📊 Daily Expenses</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>⛽ Gas/Oil</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>¥{dailyExpenses.gas.toLocaleString()}/day</p>
          </div>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>💡 Electricity</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>¥{dailyExpenses.electricity.toLocaleString()}</p>
          </div>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>💧 Gas/Water</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>¥{dailyExpenses.gasWater.toLocaleString()}</p>
          </div>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>🛒 Shopping</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#8b5cf6' }}>¥{dailyExpenses.shopping.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Contribution History */}
      {contributions.length > 0 && (
        <div style={{
          marginTop: '20px',
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📜 Recent Contributions</h3>
          {contributions.slice(0, 5).map((contribution) => (
            <div key={contribution.id} style={{
              padding: '10px',
              borderBottom: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{contribution.type}</span>
              <span style={{ color: '#11998e', fontWeight: 'bold' }}>+¥{contribution.amount.toLocaleString()}</span>
              <span style={{ color: '#666', fontSize: '14px' }}>{contribution.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrustFund;
import { useState } from 'react';

function FamilySupport({ cashAvailable, setCashAvailable }) {
  const [familyMembers, setFamilyMembers] = useState([
    {
      id: 1,
      name: 'Parents (Japan)',
      monthlyAmount: 75000,
      eidAmount: 120000,
      lastPaid: '',
      totalPaid: 0,
      isEid: false
    },
    {
      id: 2,
      name: 'Daughter (Italy)',
      monthlyAmount: 25000,
      eidAmount: 25000,
      lastPaid: '',
      totalPaid: 0,
      isEid: false
    }
  ]);

  const [amazonCard, setAmazonCard] = useState({
    monthlyLimit: 25000,
    used: 0,
    remaining: 25000
  });

  const [paymentHistory, setPaymentHistory] = useState([]);

  const handleSendMoney = (memberId, amount) => {
    if (amount > cashAvailable) {
      alert('❌ Insufficient cash available!');
      return;
    }

    setFamilyMembers(familyMembers.map(member => {
      if (member.id === memberId) {
        return {
          ...member,
          lastPaid: new Date().toISOString().split('T')[0],
          totalPaid: member.totalPaid + amount
        };
      }
      return member;
    }));

    setCashAvailable(cashAvailable - amount);

    const member = familyMembers.find(m => m.id === memberId);
    setPaymentHistory([{
      id: Date.now(),
      recipient: member.name,
      amount,
      date: new Date().toISOString().split('T')[0],
      type: member.isEid ? 'Eid Bonus' : 'Monthly Support'
    }, ...paymentHistory]);

    alert(`✅ ¥${amount.toLocaleString()} sent to ${member.name}!`);
  };

  const handleAmazonExpense = (amount) => {
    if (amount > cashAvailable) {
      alert('❌ Insufficient cash available!');
      return;
    }

    if (amount > amazonCard.remaining) {
      alert('⚠️ This will exceed the monthly Amazon limit!');
    }

    setAmazonCard({
      ...amazonCard,
      used: amazonCard.used + amount,
      remaining: Math.max(0, amazonCard.monthlyLimit - (amazonCard.used + amount))
    });

    setCashAvailable(cashAvailable - amount);

    setPaymentHistory([{
      id: Date.now(),
      recipient: 'Amazon (Daughter)',
      amount,
      date: new Date().toISOString().split('T')[0],
      type: 'Amazon Expense'
    }, ...paymentHistory]);

    alert(`✅ ¥${amount.toLocaleString()} charged to Amazon card!`);
  };

  const resetAmazonCard = () => {
    setAmazonCard({
      monthlyLimit: 25000,
      used: 0,
      remaining: 25000
    });
    alert('🔄 Amazon card reset for new month!');
  };

  const totalMonthlySupport = familyMembers.reduce((sum, m) => sum + m.monthlyAmount, 0);
  const totalPaid = familyMembers.reduce((sum, m) => sum + m.totalPaid, 0);

  return (
    <div style={{
      background: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginBottom: '30px'
    }}>
      <h2 style={{ color: '#333', fontSize: '24px', margin: '0 0 20px 0' }}>
        👨‍👩‍👧 Family Support Manager
      </h2>

      {/* Monthly Summary */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        borderRadius: '15px',
        color: 'white',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Monthly Support</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>¥{totalMonthlySupport.toLocaleString()}</p>
          </div>
          <div>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Total Paid (All Time)</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>¥{totalPaid.toLocaleString()}</p>
          </div>
          <div>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Family Members</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>{familyMembers.length}</p>
          </div>
        </div>
      </div>

      {/* Family Members */}
      <div style={{ display: 'grid', gap: '20px', marginBottom: '30px' }}>
        {familyMembers.map((member) => (
          <div key={member.id} style={{
            border: '1px solid #ddd',
            borderRadius: '10px',
            padding: '20px',
            background: member.lastPaid ? '#f0fdf4' : 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>
                  {member.name}
                  {member.isEid && <span style={{ fontSize: '12px', background: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' }}>EID</span>}
                </h3>
                {member.lastPaid && (
                  <p style={{ margin: '5px 0 0 0', color: '#22c55e', fontSize: '14px' }}>
                    ✓ Last paid: {member.lastPaid}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                  ¥{member.isEid ? member.eidAmount.toLocaleString() : member.monthlyAmount.toLocaleString()}
                </p>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                  {member.isEid ? 'Eid Amount' : 'Monthly'}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div style={{
              width: '100%',
              height: '10px',
              background: '#e5e7eb',
              borderRadius: '5px',
              marginBottom: '15px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min(100, (member.totalPaid / member.monthlyAmount) * 100)}%`,
                height: '100%',
                background: '#22c55e',
                transition: 'width 0.3s'
              }}></div>
            </div>

            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
              Total sent: <strong>¥{member.totalPaid.toLocaleString()}</strong>
            </p>

            {/* Send Money Button */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                placeholder="Amount (¥)"
                id={`family-${member.id}`}
                defaultValue={member.isEid ? member.eidAmount : member.monthlyAmount}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '16px'
                }}
              />
              <button
                onClick={() => {
                  const amount = document.getElementById(`family-${member.id}`).value;
                  handleSendMoney(member.id, parseFloat(amount) || member.monthlyAmount);
                }}
                style={{
                  background: '#22c55e',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                💸 Send
              </button>
            </div>

            {/* Eid Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', marginTop: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={member.isEid}
                onChange={(e) => {
                  setFamilyMembers(familyMembers.map(m => 
                    m.id === member.id ? { ...m, isEid: e.target.checked } : m
                  ));
                }}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontSize: '14px', color: '#666' }}>Eid Bonus (¥{member.eidAmount.toLocaleString()})</span>
            </label>
          </div>
        ))}
      </div>

      {/* Amazon Card for Daughter */}
      <div style={{
        background: 'linear-gradient(135deg, #FF9900 0%, #FFB84D 100%)',
        padding: '25px',
        borderRadius: '15px',
        color: 'white',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>🛒 Amazon Card (Daughter)</h3>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Monthly Limit: ¥{amazonCard.monthlyLimit.toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>¥{amazonCard.remaining.toLocaleString()}</p>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Remaining</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '10px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '5px',
          marginBottom: '15px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(amazonCard.used / amazonCard.monthlyLimit) * 100}%`,
            height: '100%',
            background: 'white',
            borderRadius: '5px',
            transition: 'width 0.3s'
          }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Used This Month:</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: 'bold' }}>¥{amazonCard.used.toLocaleString()}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Remaining:</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: 'bold' }}>¥{amazonCard.remaining.toLocaleString()}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number"
            placeholder="Amount (¥)"
            id="amazon-amount"
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
              const amount = document.getElementById('amazon-amount').value;
              handleAmazonExpense(parseFloat(amount));
            }}
            style={{
              background: 'white',
              color: '#FF9900',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            💳 Charge
          </button>
          <button
            onClick={resetAmazonCard}
            style={{
              background: 'rgba(255,255,255,0.3)',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📜 Payment History</h3>
          {paymentHistory.slice(0, 10).map((payment) => (
            <div key={payment.id} style={{
              padding: '10px',
              borderBottom: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>{payment.recipient}</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>{payment.type}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#22c55e' }}>-¥{payment.amount.toLocaleString()}</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>{payment.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FamilySupport;
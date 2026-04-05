import { useState } from 'react';

function CreditCards({ totalDebts, setTotalDebts, cashAvailable, setCashAvailable }) {
  const [cards, setCards] = useState([
    {
      id: 1,
      name: 'SMBC Olive Card',
      limit: 500000,
      balance: 150000,
      dueDate: '26th',
      minPayment: 10000,
      isExpenseCard: false,
      paid: false
    },
    {
      id: 2,
      name: 'Credit Card 2',
      limit: 300000,
      balance: 80000,
      dueDate: '10th',
      minPayment: 5000,
      isExpenseCard: false,
      paid: false
    },
    {
      id: 3,
      name: 'Grocery Card',
      limit: 200000,
      balance: 45000,
      dueDate: '27th',
      minPayment: 45000,
      isExpenseCard: true,
      paid: false
    }
  ]);

  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    name: '',
    limit: '',
    balance: '',
    dueDate: '10th'
  });

  const [suggestedPayments, setSuggestedPayments] = useState({});

  const calculatePayments = (dailyIncome) => {
    const unpaidCards = cards.filter(card => !card.paid && card.balance > 0);
    const totalBalance = unpaidCards.reduce((sum, card) => sum + card.balance, 0);
    
    if (totalBalance === 0 || dailyIncome === 0) return;

    const payments = {};
    let remainingIncome = dailyIncome;

    const expenseCard = unpaidCards.find(card => card.isExpenseCard);
    if (expenseCard) {
      payments[expenseCard.id] = Math.min(expenseCard.balance, remainingIncome);
      remainingIncome -= payments[expenseCard.id];
    }

    const sortedCards = unpaidCards
      .filter(card => !card.isExpenseCard)
      .sort((a, b) => a.balance - b.balance);

    sortedCards.forEach(card => {
      const payment = Math.min(card.balance, remainingIncome * 0.3);
      if (payment > 0) {
        payments[card.id] = payment;
        remainingIncome -= payment;
      }
    });

    setSuggestedPayments(payments);
  };

  const handleAddCard = () => {
    if (!newCard.name || !newCard.limit || !newCard.balance) {
      alert('Please fill in all fields!');
      return;
    }

    setCards([...cards, {
      id: Date.now(),
      name: newCard.name,
      limit: parseFloat(newCard.limit),
      balance: parseFloat(newCard.balance),
      dueDate: newCard.dueDate,
      minPayment: parseFloat(newCard.balance) * 0.1,
      isExpenseCard: false,
      paid: false
    }]);

    setNewCard({ name: '', limit: '', balance: '', dueDate: '10th' });
    setShowAddCard(false);
  };

  const handleMarkAsPaid = (cardId, paymentAmount) => {
    setCards(cards.map(card => {
      if (card.id === cardId) {
        const newBalance = card.balance - paymentAmount;
        return {
          ...card,
          balance: Math.max(0, newBalance),
          paid: newBalance <= 0
        };
      }
      return card;
    }));

    setCashAvailable(cashAvailable - paymentAmount);
    setTotalDebts(totalDebts - paymentAmount);
    alert(`✅ Payment of ¥${paymentAmount.toLocaleString()} recorded!`);
  };

  const totalCardDebt = cards.reduce((sum, card) => sum + card.balance, 0);
  const paidCards = cards.filter(card => card.paid).length;

  return (
    <div style={{
      background: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginBottom: '30px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#333', fontSize: '24px', margin: 0 }}>
          💳 Credit Cards Manager
        </h2>
        <button
          onClick={() => setShowAddCard(!showAddCard)}
          style={{
            background: '#667eea',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {showAddCard ? '✕ Cancel' : '+ Add Card'}
        </button>
      </div>

      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Total Cards</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{cards.length}</p>
          </div>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Paid Cards</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>{paidCards}</p>
          </div>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Total Balance</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>¥{totalCardDebt.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {showAddCard && (
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Add New Credit Card</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <input
              type="text"
              placeholder="Card Name"
              value={newCard.name}
              onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <input
              type="number"
              placeholder="Credit Limit (¥)"
              value={newCard.limit}
              onChange={(e) => setNewCard({ ...newCard, limit: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <input
              type="number"
              placeholder="Current Balance (¥)"
              value={newCard.balance}
              onChange={(e) => setNewCard({ ...newCard, balance: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <select
              value={newCard.dueDate}
              onChange={(e) => setNewCard({ ...newCard, dueDate: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            >
              <option value="10th">10th of month</option>
              <option value="26th">26th of month</option>
              <option value="27th">27th of month</option>
            </select>
            <button
              onClick={handleAddCard}
              style={{
                background: '#22c55e',
                color: 'white',
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Add Card
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '15px' }}>
        {cards.map((card) => (
          <div key={card.id} style={{
            border: card.isExpenseCard ? '2px solid #667eea' : '1px solid #ddd',
            borderRadius: '10px',
            padding: '20px',
            background: card.paid ? '#f0fdf4' : 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>
                  {card.name} {card.isExpenseCard && <span style={{ fontSize: '12px', background: '#667eea', color: 'white', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' }}>EXPENSE CARD</span>}
                  {card.paid && <span style={{ fontSize: '12px', background: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' }}>PAID ✓</span>}
                </h3>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Due: {card.dueDate}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: card.paid ? '#22c55e' : '#ef4444' }}>
                  ¥{card.balance.toLocaleString()}
                </p>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>of ¥{card.limit.toLocaleString()}</p>
              </div>
            </div>

            <div style={{
              width: '100%',
              height: '10px',
              background: '#e5e7eb',
              borderRadius: '5px',
              marginBottom: '15px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(card.balance / card.limit) * 100}%`,
                height: '100%',
                background: card.paid ? '#22c55e' : card.isExpenseCard ? '#667eea' : '#ef4444',
                transition: 'width 0.3s'
              }}></div>
            </div>

            {!card.paid && (
              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
                  💡 Suggested: <strong style={{ color: '#667eea' }}>
                    ¥{suggestedPayments[card.id] ? suggestedPayments[card.id].toLocaleString() : card.minPayment.toLocaleString()}
                  </strong>
                </p>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
                    Custom Payment Amount (¥):
                  </label>
                  <input
                    type="number"
                    defaultValue={suggestedPayments[card.id] || card.minPayment}
                    id={`payment-${card.id}`}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <button
                  onClick={() => {
                    const customAmount = document.getElementById(`payment-${card.id}`).value;
                    handleMarkAsPaid(card.id, parseFloat(customAmount) || card.minPayment);
                  }}
                  style={{
                    background: '#22c55e',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    width: '100%'
                  }}
                >
                  ✅ Mark as Paid
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CreditCards;
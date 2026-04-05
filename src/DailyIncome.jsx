import { useState } from 'react';

function DailyIncome({ onIncomeAdded }) {
  const [incomeData, setIncomeData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    hoursWorked: '',
    projectsCompleted: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!incomeData.amount || !incomeData.date) {
      alert('Please fill in at least the date and amount!');
      return;
    }

    // Pass the data to parent component
    onIncomeAdded({
      ...incomeData,
      id: Date.now(),
      amount: parseFloat(incomeData.amount)
    });

    // Reset form
    setIncomeData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      hoursWorked: '',
      projectsCompleted: '',
      notes: ''
    });

    alert('✅ Income recorded successfully!');
  };

  const handleChange = (e) => {
    setIncomeData({
      ...incomeData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{
      background: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginBottom: '30px'
    }}>
      <h2 style={{ color: '#333', marginBottom: '20px', fontSize: '24px' }}>
        💰 Enter Daily Income
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
        {/* Date */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
            📅 Date
          </label>
          <input
            type="date"
            name="date"
            value={incomeData.date}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px'
            }}
          />
        </div>

        {/* Amount */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
            💴 Daily Income (¥)
          </label>
          <input
            type="number"
            name="amount"
            value={incomeData.amount}
            onChange={handleChange}
            placeholder="e.g., 15000"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px'
            }}
            required
          />
        </div>

        {/* Hours Worked */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
            ⏱️ Hours Worked
          </label>
          <input
            type="number"
            name="hoursWorked"
            value={incomeData.hoursWorked}
            onChange={handleChange}
            placeholder="e.g., 8"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px'
            }}
          />
        </div>

        {/* Projects Completed */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
            📦 Projects Completed
          </label>
          <input
            type="number"
            name="projectsCompleted"
            value={incomeData.projectsCompleted}
            onChange={handleChange}
            placeholder="e.g., 3"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px'
            }}
          />
        </div>

        {/* Notes */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
            📝 Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={incomeData.notes}
            onChange={handleChange}
            placeholder="Any notes about today's work..."
            rows="3"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          ✅ Record Income
        </button>
      </form>
    </div>
  );
}

export default DailyIncome;
import { useState } from 'react';

function GoalTracker({ cashAvailable, setCashAvailable }) {
  const [goals, setGoals] = useState([
    {
      id: 1,
      name: 'Emergency Fund',
      target: 1000000,
      current: 150000,
      deadline: '2026-12-31',
      priority: 'high',
      completed: false
    },
    {
      id: 2,
      name: 'Vacation Fund',
      target: 500000,
      current: 50000,
      deadline: '2026-08-01',
      priority: 'medium',
      completed: false
    },
    {
      id: 3,
      name: 'New Laptop',
      target: 200000,
      current: 0,
      deadline: '2026-06-01',
      priority: 'low',
      completed: false
    }
  ]);

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    target: '',
    current: 0,
    deadline: '',
    priority: 'medium'
  });

  const [contributionHistory, setContributionHistory] = useState([]);

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target || !newGoal.deadline) {
      alert('Please fill in all fields!');
      return;
    }

    setGoals([...goals, {
      id: Date.now(),
      name: newGoal.name,
      target: parseFloat(newGoal.target),
      current: parseFloat(newGoal.current) || 0,
      deadline: newGoal.deadline,
      priority: newGoal.priority,
      completed: false
    }]);

    setNewGoal({ name: '', target: '', current: 0, deadline: '', priority: 'medium' });
    setShowAddGoal(false);
    alert('✅ Goal added successfully!');
  };

  const handleContribute = (goalId, amount) => {
    if (amount > cashAvailable) {
      alert('❌ Insufficient cash available!');
      return;
    }

    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const newCurrent = goal.current + amount;
        return {
          ...goal,
          current: newCurrent,
          completed: newCurrent >= goal.target
        };
      }
      return goal;
    }));

    setCashAvailable(cashAvailable - amount);

    const goal = goals.find(g => g.id === goalId);
    setContributionHistory([{
      id: Date.now(),
      goalName: goal.name,
      amount,
      date: new Date().toISOString().split('T')[0]
    }, ...contributionHistory]);

    alert(`✅ ¥${amount.toLocaleString()} added to "${goal.name}"!`);
  };

  const handleWithdraw = (goalId, amount) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          current: Math.max(0, goal.current - amount),
          completed: false
        };
      }
      return goal;
    }));

    setCashAvailable(cashAvailable + amount);
    alert(`✅ ¥${amount.toLocaleString()} withdrawn from goal!`);
  };

  const deleteGoal = (goalId) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      setGoals(goals.filter(goal => goal.id !== goalId));
      alert('🗑️ Goal deleted!');
    }
  };

  const totalSaved = goals.reduce((sum, goal) => sum + goal.current, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const completedGoals = goals.filter(goal => goal.completed).length;
  const overallProgress = (totalSaved / totalTarget) * 100;

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const targetDate = new Date(deadline);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

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
          🎯 Goal Tracker
        </h2>
        <button
          onClick={() => setShowAddGoal(!showAddGoal)}
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
          {showAddGoal ? '✕ Cancel' : '+ Add Goal'}
        </button>
      </div>

      {/* Overall Progress */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '25px',
        borderRadius: '15px',
        color: 'white',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Total Saved</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>¥{totalSaved.toLocaleString()}</p>
          </div>
          <div>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Total Target</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>¥{totalTarget.toLocaleString()}</p>
          </div>
          <div>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Completed Goals</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>{completedGoals}/{goals.length}</p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div style={{
          width: '100%',
          height: '20px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '10px'
        }}>
          <div style={{
            width: `${Math.min(100, overallProgress)}%`,
            height: '100%',
            background: 'white',
            borderRadius: '10px',
            transition: 'width 0.3s'
          }}></div>
        </div>
        <p style={{ margin: 0, textAlign: 'center', fontSize: '14px' }}>
          Overall Progress: {overallProgress.toFixed(1)}%
        </p>
      </div>

      {/* Add Goal Form */}
      {showAddGoal && (
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Add New Goal</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <input
              type="text"
              placeholder="Goal Name (e.g., Emergency Fund)"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <input
              type="number"
              placeholder="Target Amount (¥)"
              value={newGoal.target}
              onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <input
              type="number"
              placeholder="Current Saved (¥)"
              value={newGoal.current}
              onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <input
              type="date"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <select
              value={newGoal.priority}
              onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            >
              <option value="high">🔴 High Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="low">🟢 Low Priority</option>
            </select>
            <button
              onClick={handleAddGoal}
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
              Add Goal
            </button>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          const remaining = goal.target - goal.current;
          const daysLeft = getDaysRemaining(goal.deadline);

          return (
            <div key={goal.id} style={{
              border: `2px solid ${getPriorityColor(goal.priority)}`,
              borderRadius: '15px',
              padding: '20px',
              background: goal.completed ? '#f0fdf4' : 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>
                    {goal.name}
                    {goal.completed && <span style={{ fontSize: '12px', background: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' }}>✓ COMPLETED</span>}
                  </h3>
                  <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                    📅 Deadline: {goal.deadline} ({daysLeft} days left)
                  </p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: getPriorityColor(goal.priority) }}>
                    ● {goal.priority.toUpperCase()} PRIORITY
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: goal.completed ? '#22c55e' : '#667eea' }}>
                    ¥{goal.current.toLocaleString()}
                  </p>
                  <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                    of ¥{goal.target.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '15px',
                background: '#e5e7eb',
                borderRadius: '10px',
                marginBottom: '15px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(100, progress)}%`,
                  height: '100%',
                  background: goal.completed ? '#22c55e' : getPriorityColor(goal.priority),
                  transition: 'width 0.3s'
                }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px' }}>
                <span>Progress: {progress.toFixed(1)}%</span>
                <span>Remaining: ¥{remaining.toLocaleString()}</span>
              </div>

              {/* Action Buttons */}
              {!goal.completed && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="number"
                    placeholder="Amount (¥)"
                    id={`goal-${goal.id}`}
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
                      const amount = document.getElementById(`goal-${goal.id}`).value;
                      handleContribute(goal.id, parseFloat(amount) || 10000);
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
                    💰 Add
                  </button>
                  <button
                    onClick={() => {
                      const amount = document.getElementById(`goal-${goal.id}`).value;
                      handleWithdraw(goal.id, parseFloat(amount) || 10000);
                    }}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    💸 Withdraw
                  </button>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    style={{
                      background: '#6b7280',
                      color: 'white',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contribution History */}
      {contributionHistory.length > 0 && (
        <div style={{
          marginTop: '20px',
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📜 Recent Contributions</h3>
          {contributionHistory.slice(0, 5).map((contribution) => (
            <div key={contribution.id} style={{
              padding: '10px',
              borderBottom: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontWeight: 'bold' }}>{contribution.goalName}</span>
              <span style={{ color: '#22c55e', fontWeight: 'bold' }}>+¥{contribution.amount.toLocaleString()}</span>
              <span style={{ color: '#666', fontSize: '14px' }}>{contribution.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GoalTracker;
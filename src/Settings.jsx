import { clearAllData } from './dataStorage';

function Settings({ onReset, darkMode, setDarkMode }) {
  const handleReset = () => {
    if (confirm('⚠️ Are you sure you want to reset ALL data?')) {
      clearAllData();
      onReset();
      alert('🔄 All data has been reset!');
    }
  };

  const handleExport = () => {
    const data = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('ckSanFlow_')) {
        data[key] = localStorage.getItem(key);
      }
    });
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

  return (
    <div style={{
      background: darkMode ? '#1f2937' : 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginBottom: '30px',
      color: darkMode ? 'white' : '#333'
    }}>
      <h2 style={{ fontSize: '24px', margin: '0 0 20px 0' }}>
        ⚙️ Settings & Display
      </h2>

      <div style={{ display: 'grid', gap: '15px' }}>
        {/* Dark Mode Toggle - FIRST BUTTON */}
        <button
          onClick={toggleDarkMode}
          style={{
            background: darkMode ? '#fbbf24' : '#1f2937',
            color: darkMode ? '#1f2937' : 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          {darkMode ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
        </button>

        {/* Export Data - SECOND BUTTON */}
        <button
          onClick={handleExport}
          style={{
            background: '#667eea',
            color: 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          📦 Export All Data (Backup)
        </button>

        {/* Reset Data - THIRD BUTTON */}
        <button
          onClick={handleReset}
          style={{
            background: '#ef4444',
            color: 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          🗑️ Reset All Data (Danger!)
        </button>
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: darkMode ? '#374151' : '#fef3c7',
        borderRadius: '8px',
        border: `1px solid ${darkMode ? '#4b5563' : '#f59e0b'}`,
        color: darkMode ? 'white' : '#92400e',
        fontSize: '14px'
      }}>
        💡 <strong>Tip:</strong> Export your data regularly to create backups.
      </div>
    </div>
  );
}

export default Settings;
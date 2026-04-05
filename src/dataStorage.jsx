// Save data to localStorage
export const saveData = (key, data) => {
  localStorage.setItem(`ckSanFlow_${key}`, JSON.stringify(data));
};

// Load data from localStorage
export const loadData = (key, defaultValue) => {
  const saved = localStorage.getItem(`ckSanFlow_${key}`);
  return saved ? JSON.parse(saved) : defaultValue;
};

// Clear all data
export const clearAllData = () => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('ckSanFlow_')) {
      localStorage.removeItem(key);
    }
  });
};
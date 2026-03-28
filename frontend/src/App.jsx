import { useState } from 'react';
import useMachineStore from './store/machineStore';
import CustomGrid from './components/CustomGrid';
import SettingsModal from './components/SettingsModal';
import './App.css';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newMachineName, setNewMachineName] = useState('');
  const [cellWidth, setCellWidth] = useState(140);
  const machines = useMachineStore((state) => state.machines);
  const addMachine = useMachineStore((state) => state.addMachine);

  const handleAdd = () => {
    if (!newMachineName.trim()) {
      alert('Введите название станка');
      return;
    }
    addMachine(newMachineName);
    setNewMachineName('');
    setShowForm(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">🏭</div>
            <h1>Мониторинг станков</h1>
          </div>
          <div className="header-actions">
            <button 
              className="settings-btn"
              onClick={() => setShowSettings(true)}
              title="Настройки размера"
            >
              ⚙️
            </button>
            <button 
              className="add-machine-btn"
              onClick={() => setShowForm(true)}
            >
              + Добавить станок
            </button>
          </div>
        </div>
      </header>
      
      <main className="app-main">
        <CustomGrid cellWidth={cellWidth} />
      </main>
      
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Добавить станок</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                value={newMachineName}
                onChange={(e) => setNewMachineName(e.target.value)}
                placeholder="Название станка"
                className="machine-input"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowForm(false)} className="btn-cancel">
                Отмена
              </button>
              <button onClick={handleAdd} className="btn-submit">
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
      
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        cellWidth={cellWidth}
        onCellWidthChange={setCellWidth}
      />
    </div>
  );
}

export default App;
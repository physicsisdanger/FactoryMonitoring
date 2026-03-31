import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import useMachineStore from './store/machineStore';
import useAuthStore from './store/authStore';
import ZoneCard from './components/ZoneCard';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import { USE_API } from './config';
import './App.css';

function App() {
  const [showAddZone, setShowAddZone] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [cellWidth, setCellWidth] = useState(140);
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const zones = useMachineStore((state) => state.zones);
  const addZone = useMachineStore((state) => state.addZone);
  const deleteZone = useMachineStore((state) => state.deleteZone);
  const renameZone = useMachineStore((state) => state.renameZone);
  const reorderZone = useMachineStore((state) => state.reorderZone);
  const addMachineToZone = useMachineStore((state) => state.addMachineToZone);
  const init = useMachineStore((state) => state.init);
  const loadInitialData = useMachineStore((state) => state.loadInitialData);

  // Инициализация при загрузке
  useEffect(() => {
    if (USE_API && isAuthenticated) {
      init();
    } else if (!USE_API) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && USE_API) {
      // Валидация токена
      fetch('http://localhost:8000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(res => {
        if (res.ok) return res.json();
        throw new Error('Invalid token');
      }).then(user => {
        useAuthStore.getState().setUser(user);
      }).catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, []);

  const handleAddZone = () => {
    if (!newZoneName.trim()) {
      alert('Введите название зоны');
      return;
    }
    addZone(newZoneName);
    setNewZoneName('');
    setShowAddZone(false);
  };

  const handleMoveZone = (zoneId, targetIndex) => {
    reorderZone(zoneId, targetIndex);
  };

  const handleAuthSuccess = (user) => {
    console.log('Welcome:', user);
    if (USE_API) {
      init();
    }
  };

  const sortedZones = [...zones].sort((a, b) => b.order - a.order);

  // Если нужна авторизация и пользователь не авторизован - показываем окно входа
  if (USE_API && !isAuthenticated) {
    return (
      <AuthModal 
        isOpen={true}
        onClose={() => {}}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">🏭</div>
              <h1>Мониторинг станков</h1>
            </div>
            <div className="header-actions">
              {USE_API && user && (
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  👤 {user.username}
                </span>
              )}
              <button 
                className="settings-btn"
                onClick={() => setShowSettings(true)}
                title="Настройки размера ячеек"
              >
                ⚙️
              </button>
              <button 
                className="add-machine-btn"
                onClick={() => setShowAddZone(true)}
              >
                + Добавить участок
              </button>
              {USE_API && (
                <button 
                  onClick={logout}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#475569'
                  }}
                >
                  🚪 Выйти
                </button>
              )}
            </div>
          </div>
        </header>
        
        <main className="app-main">
          <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            {sortedZones.map((zone, index) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                index={index}
                totalZones={sortedZones.length}
                onRename={renameZone}
                onDelete={deleteZone}
                onAddMachine={addMachineToZone}
                onMoveZone={handleMoveZone}
                cellWidth={cellWidth}
              />
            ))}
            
            {zones.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px',
                background: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                color: '#64748b'
              }}>
                <p style={{ fontSize: '16px', marginBottom: '16px' }}>
                  🏭 Нет добавленных участков
                </p>
                <button 
                  onClick={() => setShowAddZone(true)}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  + Создать первый участок
                </button>
              </div>
            )}
          </div>
        </main>
        
        {showAddZone && (
          <div className="modal-overlay" onClick={() => setShowAddZone(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🏭 Добавить участок</h2>
                <button className="modal-close" onClick={() => setShowAddZone(false)}>✕</button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="Название участка (например: Механический цех)"
                  className="machine-input"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleAddZone()}
                />
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowAddZone(false)} className="btn-cancel">
                  Отмена
                </button>
                <button onClick={handleAddZone} className="btn-submit">
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
    </DndProvider>
  );
}

export default App;
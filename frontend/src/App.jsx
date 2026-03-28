import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import useMachineStore from './store/machineStore';
import ZoneCard from './components/ZoneCard';
import SettingsModal from './components/SettingsModal';
import './App.css';

function App() {
  const [showAddZone, setShowAddZone] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [cellWidth, setCellWidth] = useState(140);
  
  const zones = useMachineStore((state) => state.zones);
  const addZone = useMachineStore((state) => state.addZone);
  const deleteZone = useMachineStore((state) => state.deleteZone);
  const renameZone = useMachineStore((state) => state.renameZone);
  const reorderZone = useMachineStore((state) => state.reorderZone);
  const addMachineToZone = useMachineStore((state) => state.addMachineToZone);

  const handleAddZone = () => {
    if (!newZoneName.trim()) {
      alert('Введите название зоны');
      return;
    }
    addZone(newZoneName);
    setNewZoneName('');
    setShowAddZone(false);
  };

  // Функция перемещения зоны вверх
  const handleMoveUp = (index) => {
    if (index > 0) {
      const zone = sortedZones[index];
      const targetOrder = sortedZones[index - 1].order;
      reorderZone(zone.id, targetOrder);
    }
  };

  // Функция перемещения зоны вниз
  const handleMoveDown = (index) => {
    if (index < sortedZones.length - 1) {
      const zone = sortedZones[index];
      const targetOrder = sortedZones[index + 1].order;
      reorderZone(zone.id, targetOrder);
    }
  };

  // Сортируем зоны по order (чем меньше order, тем выше)
  const sortedZones = [...zones].sort((a, b) => a.order - b.order);

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
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
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
        
        {/* Модальное окно добавления зоны */}
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
        
        {/* Модальное окно настроек размера ячеек */}
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
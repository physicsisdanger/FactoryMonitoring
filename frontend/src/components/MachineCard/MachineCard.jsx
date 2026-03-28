cat > frontend/src/components/MachineCard/MachineCard.jsx << 'EOF'
import { useState } from 'react';
import useMachineStore from '../../store/machineStore';
import './MachineCard.css';

const MachineCard = ({ machine }) => {
  const [showDetails, setShowDetails] = useState(false);
  const removeMachine = useMachineStore((state) => state.removeMachine);
  const updateMachine = useMachineStore((state) => state.updateMachine);

  const getStatusColor = (status) => {
    switch(status) {
      case 'running': return '#4CAF50';
      case 'idle': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'running': return 'Работает';
      case 'idle': return 'Ожидание';
      case 'error': return 'Ошибка';
      default: return 'Неизвестно';
    }
  };

  const handleStatusChange = (e) => {
    updateMachine(machine.id, { status: e.target.value });
  };

  const handleDelete = () => {
    if (window.confirm(`Удалить станок "${machine.name}"?`)) {
      removeMachine(machine.id);
    }
  };

  return (
    <div 
      className="machine-card"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <div className="card-header">
        <img 
          src={machine.imageUrl} 
          alt={machine.name}
          className="machine-image"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/150/2196F3/FFFFFF?text=${encodeURIComponent(machine.name.slice(0, 10))}`;
          }}
        />
        <div className="status-indicator" style={{ backgroundColor: getStatusColor(machine.status) }}>
          <span className="status-text">{getStatusText(machine.status)}</span>
        </div>
      </div>
      
      <div className="card-body">
        <h4 className="machine-name">{machine.name}</h4>
        <div className="machine-temp">
          🌡️ {machine.temperature}°C
        </div>
        
        {showDetails && (
          <div className="card-details">
            {machine.description && (
              <p className="machine-description">{machine.description}</p>
            )}
            {machine.lastMaintenance && (
              <div className="maintenance-info">
                🔧 Последнее ТО: {machine.lastMaintenance}
              </div>
            )}
            
            <select 
              value={machine.status} 
              onChange={handleStatusChange}
              className="status-select"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="running">🟢 Работает</option>
              <option value="idle">🟡 Ожидание</option>
              <option value="error">🔴 Ошибка</option>
            </select>
            
            <button 
              onClick={handleDelete}
              className="delete-btn"
            >
              🗑️ Удалить
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineCard;
EOF
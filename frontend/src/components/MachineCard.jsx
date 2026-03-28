import useMachineStore from '../store/machineStore';

const MachineCard = ({ machine }) => {
  const updateStatus = useMachineStore((state) => state.updateStatus);
  const deleteMachine = useMachineStore((state) => state.deleteMachine);

  const getStatusColor = (status) => {
    if (status === 'running') return '#4CAF50';
    if (status === 'idle') return '#FF9800';
    return '#F44336';
  };

  const getStatusText = (status) => {
    if (status === 'running') return 'Работает';
    if (status === 'idle') return 'Ожидание';
    return 'Ошибка';
  };

  const getMachineIcon = (name) => {
    if (name.toLowerCase().includes('фрезер')) return '⚙';
    if (name.toLowerCase().includes('токар')) return '⚙';
    return '🏭';
  };

  return (
    <div className="machine-card">
      <div className="card-header">
        <div className="machine-icon">
          {getMachineIcon(machine.name)}
        </div>
        <div className="status-indicator" style={{ backgroundColor: getStatusColor(machine.status) }}>
          {getStatusText(machine.status)}
        </div>
      </div>
      
      <div className="card-body">
        <h3 className="machine-name">{machine.name}</h3>
        <div className="machine-temp">Температура: {machine.temperature}°C</div>
        
        <select 
          value={machine.status}
          onChange={(e) => updateStatus(machine.id, e.target.value)}
          className="status-select"
        >
          <option value="running">Работает</option>
          <option value="idle">Ожидание</option>
          <option value="error">Ошибка</option>
        </select>
        
        <button 
          onClick={() => deleteMachine(machine.id)}
          className="delete-btn"
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

export default MachineCard;
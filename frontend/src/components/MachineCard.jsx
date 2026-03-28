import useMachineStore from '../store/machineStore';

const MachineCard = ({ machine, cellWidth = 140 }) => {
  const updateStatus = useMachineStore((state) => state.updateStatus);
  const deleteMachine = useMachineStore((state) => state.deleteMachine);

  const getStatusColor = (status) => {
    if (status === 'running') return '#22c55e';
    if (status === 'idle') return '#f59e0b';
    return '#ef4444';
  };

  const getStatusText = (status) => {
    if (status === 'running') return 'Работает';
    if (status === 'idle') return 'Ожидание';
    return 'Ошибка';
  };

  const getMachineIcon = (name) => {
    if (name.toLowerCase().includes('фрезер')) return '⚙️';
    if (name.toLowerCase().includes('токар')) return '🔧';
    if (name.toLowerCase().includes('сверл')) return '🔨';
    if (name.toLowerCase().includes('шлиф')) return '✨';
    return '🏭';
  };

  const shortenName = (name) => {
    const maxLen = Math.floor(cellWidth / 9);
    if (name.length > maxLen) {
      return name.slice(0, maxLen - 2) + '...';
    }
    return name;
  };

  // Автоматические размеры в зависимости от cellWidth
  const iconSize = Math.max(24, Math.min(48, cellWidth / 3.5));
  const headerPadding = Math.max(8, cellWidth / 15);
  const bodyPadding = Math.max(8, cellWidth / 18);
  const nameFontSize = Math.max(11, cellWidth / 11);
  const tempFontSize = Math.max(10, cellWidth / 14);
  const selectFontSize = Math.max(10, cellWidth / 14);
  const selectPadding = Math.max(6, cellWidth / 20);
  const buttonFontSize = Math.max(10, cellWidth / 14);
  const buttonPadding = Math.max(6, cellWidth / 20);
  const indicatorPadding = Math.max(4, cellWidth / 30);
  const indicatorFontSize = Math.max(10, cellWidth / 14);
  const borderRadius = Math.max(12, cellWidth / 12);

  return (
    <div 
      className="machine-card"
      data-drag-id={machine.id}
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
        border: '1px solid #e2e8f0'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
      }}
    >
      <div style={{
        padding: `${headerPadding}px`,
        textAlign: 'center',
        position: 'relative',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{
          fontSize: `${iconSize}px`,
          margin: `${iconSize / 8}px 0`
        }}>
          {getMachineIcon(machine.name)}
        </div>
        <div style={{
          position: 'absolute',
          top: `${indicatorPadding}px`,
          right: `${indicatorPadding}px`,
          padding: `${indicatorPadding}px ${indicatorPadding * 2}px`,
          borderRadius: `${indicatorPadding * 3}px`,
          fontSize: `${indicatorFontSize}px`,
          fontWeight: 600,
          color: 'white',
          backgroundColor: getStatusColor(machine.status),
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          {getStatusText(machine.status)}
        </div>
      </div>
      
      <div style={{
        padding: `${bodyPadding}px`,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: `${bodyPadding / 2}px`,
        background: '#ffffff'
      }}>
        <div style={{
          margin: 0,
          fontSize: `${nameFontSize}px`,
          fontWeight: 600,
          color: '#0f172a',
          wordBreak: 'break-word',
          lineHeight: 1.3,
          textAlign: 'center'
        }} title={machine.name}>
          {shortenName(machine.name)}
        </div>
        <div style={{
          fontSize: `${tempFontSize}px`,
          color: '#64748b',
          fontWeight: 500,
          textAlign: 'center'
        }}>
          🌡️ {machine.temperature}°C
        </div>
        
        <select 
          value={machine.status}
          onChange={(e) => updateStatus(machine.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            padding: `${selectPadding}px`,
            fontSize: `${selectFontSize}px`,
            border: '1px solid #e2e8f0',
            borderRadius: `${selectPadding * 1.5}px`,
            cursor: 'pointer',
            background: '#ffffff',
            fontWeight: 500,
            color: '#334155',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#e2e8f0';
          }}
        >
          <option value="running">🟢 Работает</option>
          <option value="idle">🟡 Ожидание</option>
          <option value="error">🔴 Ошибка</option>
        </select>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Удалить станок "${machine.name}"?`)) {
              deleteMachine(machine.id);
            }
          }}
          style={{
            width: '100%',
            padding: `${buttonPadding}px`,
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            color: '#ef4444',
            borderRadius: `${buttonPadding * 1.5}px`,
            fontSize: `${buttonFontSize}px`,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#ef4444';
            e.target.style.color = 'white';
            e.target.style.borderColor = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#fef2f2';
            e.target.style.color = '#ef4444';
            e.target.style.borderColor = '#fee2e2';
          }}
        >
          🗑️ Удалить
        </button>
      </div>
    </div>
  );
};

export default MachineCard;
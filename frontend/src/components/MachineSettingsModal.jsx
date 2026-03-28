import React, { useState } from 'react';
import useMachineStore from '../store/machineStore';

const MachineSettingsModal = ({ isOpen, onClose, machine, zoneId }) => {
  const [newName, setNewName] = useState(machine?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  
  const renameMachine = useMachineStore((state) => state.renameMachine);
  const deleteMachine = useMachineStore((state) => state.deleteMachineFromZone);
  const clearHistory = useMachineStore((state) => state.clearMachineHistory);

  if (!isOpen || !machine) return null;

  const handleRename = () => {
    if (newName.trim() && newName !== machine.name) {
      renameMachine(zoneId, machine.id, newName);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Удалить станок "${machine.name}"? Это действие нельзя отменить!`)) {
      deleteMachine(zoneId, machine.id);
      onClose();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm(`Очистить историю станка "${machine.name}"? Это действие нельзя отменить!`)) {
      clearHistory(zoneId, machine.id);
    }
  };

  const getStatusName = (status) => {
    const statuses = {
      running: 'В работе',
      ready: 'Готов к работе',
      waiting_qc: 'Ждет QC',
      qc_ng: 'QC NG',
      error: 'Ошибка',
      need_check: 'Требуется проверка',
      need_repair: 'Требуется ремонт',
      blocked: 'Заблокирован'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      running: '#22c55e',
      ready: '#86efac',
      waiting_qc: '#f97316',
      qc_ng: '#ef4444',
      error: '#dc2626',
      need_check: '#f97316',
      need_repair: '#dc2626',
      blocked: '#1f2937'
    };
    return colors[status] || '#64748b';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content machine-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Настройки станка</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="settings-section">
            <h3>📝 Информация о станке</h3>
            <div className="info-row">
              <span className="info-label">Название:</span>
              {isEditing ? (
                <div className="edit-name">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                    autoFocus
                  />
                  <button onClick={handleRename}>✓</button>
                  <button onClick={() => {
                    setIsEditing(false);
                    setNewName(machine.name);
                  }}>✕</button>
                </div>
              ) : (
                <div className="name-display">
                  <span>{machine.name}</span>
                  <button onClick={() => setIsEditing(true)}>✏️</button>
                </div>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">Статус:</span>
              <span className="info-value status-badge" style={{
                backgroundColor: getStatusColor(machine.status),
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                display: 'inline-block'
              }}>
                {getStatusName(machine.status)}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Записей в истории:</span>
              <span className="info-value">{machine.history?.length || 0}</span>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>🔧 Действия</h3>
            <button className="action-btn clear-history" onClick={handleClearHistory}>
              🗑️ Очистить историю
            </button>
            <button className="action-btn delete" onClick={handleDelete}>
              ⚠️ Удалить станок
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-submit">
            Закрыть
          </button>
        </div>
      </div>
      
      <style>{`
        .machine-settings-modal {
          max-width: 500px;
        }
        
        .settings-section {
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .settings-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .settings-section h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: #0f172a;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 12px;
          align-items: center;
        }
        
        .info-label {
          width: 120px;
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }
        
        .info-value {
          flex: 1;
          font-size: 13px;
          color: #1e293b;
        }
        
        .name-display {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        
        .name-display button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        
        .name-display button:hover {
          background: #f1f5f9;
        }
        
        .edit-name {
          display: flex;
          gap: 8px;
          flex: 1;
        }
        
        .edit-name input {
          flex: 1;
          padding: 6px 10px;
          border: 1px solid #3b82f6;
          border-radius: 8px;
          font-size: 13px;
        }
        
        .edit-name button {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .edit-name button:first-of-type {
          background: #22c55e;
          color: white;
        }
        
        .edit-name button:last-of-type {
          background: #ef4444;
          color: white;
        }
        
        .action-btn {
          width: 100%;
          padding: 10px 16px;
          margin-bottom: 10px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          text-align: left;
        }
        
        .action-btn.clear-history {
          background: #fff3e0;
          color: #ed6c02;
          border: 1px solid #ffe0b2;
        }
        
        .action-btn.clear-history:hover {
          background: #ffe0b2;
          transform: translateX(4px);
        }
        
        .action-btn.delete {
          background: #ffebee;
          color: #f44336;
          border: 1px solid #ffcdd2;
          margin-bottom: 0;
        }
        
        .action-btn.delete:hover {
          background: #ffcdd2;
          transform: translateX(4px);
        }
        
        .status-badge {
          display: inline-block;
        }
      `}</style>
    </div>
  );
};

export default MachineSettingsModal;
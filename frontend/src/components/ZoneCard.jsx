import React, { useState } from 'react';
import ZoneGrid from './ZoneGrid';
import useMachineStore from '../store/machineStore';

const ZoneCard = ({ zone, index, totalZones, onRename, onDelete, onAddMachine, onMoveUp, onMoveDown, cellWidth }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(zone.name);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddMachine, setShowAddMachine] = useState(false);
  const [newMachineName, setNewMachineName] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const updateMachineStatus = useMachineStore((state) => state.updateMachineStatus);
  const deleteMachineFromZone = useMachineStore((state) => state.deleteMachineFromZone);

  const handleRename = () => {
    if (editName.trim()) {
      onRename(zone.id, editName);
      setIsEditing(false);
    }
  };

  const handleAddMachine = () => {
    if (!newMachineName.trim()) {
      alert('Введите название станка');
      return;
    }
    onAddMachine(zone.id, newMachineName.trim());
    setNewMachineName('');
    setShowAddMachine(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      style={{
        position: 'relative',
        marginBottom: '24px'
      }}
    >
      {/* Основной контент зоны */}
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease'
      }}>
        {/* Заголовок зоны */}
        <div style={{
          padding: '16px 24px',
          background: '#f8fafc',
          borderBottom: isCollapsed ? 'none' : '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '4px',
              height: '32px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '2px'
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isEditing ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                    style={{
                      padding: '6px 12px',
                      fontSize: '18px',
                      fontWeight: 600,
                      border: '1px solid #3b82f6',
                      borderRadius: '10px',
                      background: '#ffffff',
                      color: '#0f172a'
                    }}
                    autoFocus
                  />
                  <button onClick={handleRename} style={{
                    background: '#22c55e',
                    border: 'none',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}>
                    ✓
                  </button>
                  <button onClick={() => {
                    setIsEditing(false);
                    setEditName(zone.name);
                  }} style={{
                    background: '#ef4444',
                    border: 'none',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}>
                    ✕
                  </button>
                </div>
              ) : (
                <h2 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#0f172a'
                }}>
                  {zone.name}
                </h2>
              )}
            </div>
            {!isCollapsed && (
              <span style={{
                background: '#f1f5f9',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                color: '#64748b'
              }}>
                {zone.machines?.length || 0} станков
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Кнопки перемещения вверх/вниз */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => onMoveUp(index)}
                disabled={index === 0}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  cursor: index === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  color: index === 0 ? '#94a3b8' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  opacity: index === 0 ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (index !== 0) {
                    e.target.style.background = '#e2e8f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== 0) {
                    e.target.style.background = '#f1f5f9';
                  }
                }}
                title="Переместить выше"
              >
                ↑
              </button>
              <button
                onClick={() => onMoveDown(index)}
                disabled={index === totalZones - 1}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  cursor: index === totalZones - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  color: index === totalZones - 1 ? '#94a3b8' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  opacity: index === totalZones - 1 ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (index !== totalZones - 1) {
                    e.target.style.background = '#e2e8f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== totalZones - 1) {
                    e.target.style.background = '#f1f5f9';
                  }
                }}
                title="Переместить ниже"
              >
                ↓
              </button>
            </div>
            
            <button
              onClick={toggleCollapse}
              style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                padding: '8px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                minWidth: '70px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f1f5f9';
              }}
            >
              {isCollapsed ? '➕ Развернуть' : '➖ Свернуть'}
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                padding: '8px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f1f5f9';
              }}
            >
              ⚙️ Управление
            </button>
            
            <button
              onClick={() => setShowAddMachine(true)}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(59,130,246,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              + Добавить станок
            </button>
          </div>
        </div>
        
        {/* Панель управления зоной - показывается только если не свернуто */}
        {!isCollapsed && showSettings && (
          <div style={{
            padding: '16px 24px',
            background: '#fefce8',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ✏️ Переименовать
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Удалить зону "${zone.name}"? Все станки в ней будут удалены!`)) {
                  onDelete(zone.id);
                }
              }}
              style={{
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🗑️ Удалить зону
            </button>
            <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748b' }}>
              💡 Используйте стрелки ↑↓ для перемещения зоны
            </div>
          </div>
        )}
        
        {/* Сетка станков в зоне - показывается только если не свернуто */}
        {!isCollapsed && (
          <ZoneGrid 
            zone={zone} 
            cellWidth={cellWidth}
            onUpdateStatus={updateMachineStatus}
            onDeleteMachine={deleteMachineFromZone}
          />
        )}
        
        {/* Компактный вид для свернутой зоны */}
        {isCollapsed && (
          <div style={{
            padding: '12px 24px',
            background: '#fafcff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            color: '#64748b'
          }}>
            <span>📊 {zone.machines?.length || 0} станков</span>
            <span style={{ fontSize: '12px' }}>
              Нажмите "Развернуть" чтобы увидеть планировку
            </span>
          </div>
        )}
      </div>
      
      {/* Модальное окно добавления станка */}
      {showAddMachine && (
        <div className="modal-overlay" onClick={() => setShowAddMachine(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Добавить станок в "{zone.name}"</h2>
              <button className="modal-close" onClick={() => setShowAddMachine(false)}>✕</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                value={newMachineName}
                onChange={(e) => setNewMachineName(e.target.value)}
                placeholder="Название станка"
                className="machine-input"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleAddMachine()}
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAddMachine(false)} className="btn-cancel">
                Отмена
              </button>
              <button onClick={handleAddMachine} className="btn-submit">
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneCard;
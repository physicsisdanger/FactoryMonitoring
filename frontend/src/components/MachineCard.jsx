import React, { useState, useEffect, useRef } from 'react';
import useMachineStore from '../store/machineStore';
import HistoryModal from './HistoryModal';
import MachineSettingsModal from './MachineSettingsModal';

const MachineCard = ({ machine, cellWidth = 140, zoneId }) => {
  const updateStatus = useMachineStore((state) => state.updateMachineStatus);
  const deleteMachine = useMachineStore((state) => state.deleteMachineFromZone);
  
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [pendingStatus, setPendingStatus] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const statuses = {
    running: { name: 'В работе', color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', blink: false, icon: '⚙️' },
    ready: { name: 'Готов к работе', color: '#86efac', bg: '#f0fdf4', border: '#bbf7d0', blink: true, icon: '✅' },
    waiting_qc: { name: 'Ждет QC', color: '#f97316', bg: '#fff7ed', border: '#fed7aa', blink: true, icon: '🔍' },
    qc_ng: { name: 'QC NG', color: '#ef4444', bg: '#fef2f2', border: '#fee2e2', blink: true, icon: '❌' },
    error: { name: 'Ошибка', color: '#dc2626', bg: '#fef2f2', border: '#fee2e2', blink: true, icon: '⚠️' },
    need_check: { name: 'Требуется проверка', color: '#f97316', bg: '#fff7ed', border: '#fed7aa', blink: true, icon: '🔧' },
    need_repair: { name: 'Требуется ремонт', color: '#dc2626', bg: '#fef2f2', border: '#fee2e2', blink: false, icon: '🔨' },
    blocked: { name: 'Заблокирован', color: '#1f2937', bg: '#f9fafb', border: '#e5e7eb', blink: false, icon: '🔒' }
  };

  const [isBlinking, setIsBlinking] = useState(false);
  const currentStatus = statuses[machine.status] || statuses.running;
  
  const isSmallSize = cellWidth < 150;

  useEffect(() => {
    if (currentStatus.blink) {
      const interval = setInterval(() => setIsBlinking(prev => !prev), 800);
      return () => clearInterval(interval);
    } else {
      setIsBlinking(false);
    }
  }, [currentStatus.blink]);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setPendingStatus(newStatus);
    setSelectedPhotos([]);
    setPhotoPreviews([]);
    setShowCommentModal(true);
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = [...selectedPhotos, ...files];
    setSelectedPhotos(newPhotos);
    
    const newPreviews = [...photoPreviews];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        setPhotoPreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    const newPhotos = [...selectedPhotos];
    const newPreviews = [...photoPreviews];
    newPhotos.splice(index, 1);
    newPreviews.splice(index, 1);
    setSelectedPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleConfirmStatusChange = () => {
    if (zoneId && pendingStatus) {
      const photoPromises = selectedPhotos.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              id: Date.now().toString() + Math.random(),
              data: reader.result,
              date: new Date().toISOString()
            });
          };
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(photoPromises).then(photos => {
        updateStatus(zoneId, machine.id, pendingStatus, commentText, photos);
      });
    }
    setShowCommentModal(false);
    setCommentText('');
    setPendingStatus(null);
    setSelectedPhotos([]);
    setPhotoPreviews([]);
  };

  const getMachineIcon = (name) => {
    if (!name) return '🏭';
    const lowerName = name.toLowerCase();
    if (lowerName.includes('фрезер')) return '⚙️';
    if (lowerName.includes('токар')) return '🔧';
    if (lowerName.includes('сверл')) return '🔨';
    if (lowerName.includes('шлиф')) return '✨';
    return '🏭';
  };

  const shortenName = (name) => {
    if (!name) return 'Станок';
    let maxLen = Math.floor(cellWidth / 9);
    if (isSmallSize) maxLen = 6;
    return name.length > maxLen ? name.slice(0, maxLen - 2) + '...' : name;
  };

  const iconSize = Math.max(24, Math.min(44, cellWidth / 3.5));
  const headerPadding = Math.max(8, cellWidth / 14);
  const bodyPadding = Math.max(8, cellWidth / 16);
  const nameFontSize = Math.max(11, cellWidth / 11);
  const selectFontSize = Math.max(10, cellWidth / 13);
  const selectPadding = Math.max(6, cellWidth / 20);
  const buttonFontSize = Math.max(10, cellWidth / 13);
  const buttonPadding = Math.max(6, cellWidth / 20);
  const indicatorPadding = Math.max(4, cellWidth / 30);
  const indicatorFontSize = Math.max(10, cellWidth / 13);
  const borderRadius = Math.max(10, cellWidth / 13);

  return (
    <>
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
          border: `1px solid ${currentStatus.border}`,
          animation: isBlinking ? 'blinkCard 0.8s ease-in-out infinite' : 'none'
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
          background: `linear-gradient(135deg, ${currentStatus.bg} 0%, #ffffff 100%)`,
          borderBottom: `1px solid ${currentStatus.border}`
        }}>
          <div style={{
            fontSize: `${iconSize}px`,
            margin: `${iconSize / 8}px 0`,
            position: 'relative'
          }}>
            {getMachineIcon(machine.name)}
            {currentStatus.icon && (
              <span style={{
                position: 'absolute',
                bottom: '-5px',
                right: '-5px',
                fontSize: `${iconSize / 2}px`,
                background: 'white',
                borderRadius: '50%',
                padding: '2px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                {currentStatus.icon}
              </span>
            )}
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
            backgroundColor: currentStatus.color,
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            animation: isBlinking ? 'blinkStatus 0.8s ease-in-out infinite' : 'none'
          }}>
            {currentStatus.name}
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
          }} title={machine.name || 'Станок'}>
            {shortenName(machine.name)}
          </div>
          
          <select 
            value={machine.status || 'running'}
            onChange={handleStatusChange}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              padding: `${selectPadding}px`,
              fontSize: `${selectFontSize}px`,
              border: `1px solid ${currentStatus.border}`,
              borderRadius: `${selectPadding * 1.5}px`,
              cursor: 'pointer',
              background: '#ffffff',
              fontWeight: 500,
              color: '#334155',
              transition: 'all 0.2s'
            }}
          >
            <option value="running">⚙️ В работе</option>
            <option value="ready">✅ Готов к работе</option>
            <option value="waiting_qc">🔍 Ждет QC</option>
            <option value="qc_ng">❌ QC NG</option>
            <option value="error">⚠️ Ошибка</option>
            <option value="need_check">🔧 Требуется проверка</option>
            <option value="need_repair">🔨 Требуется ремонт</option>
            <option value="blocked">🔒 Заблокирован</option>
          </select>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '8px',
            marginTop: '4px',
            width: '100%'
          }}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowHistory(true);
              }}
              style={{
                width: '100%',
                padding: `${buttonPadding}px`,
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#475569',
                borderRadius: `${buttonPadding * 1.5}px`,
                fontSize: `${buttonFontSize}px`,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f1f5f9';
              }}
              title={isSmallSize ? "История" : ""}
            >
              {isSmallSize ? "📜" : "📜 История"}
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(true);
              }}
              style={{
                width: '100%',
                padding: `${buttonPadding}px`,
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#475569',
                borderRadius: `${buttonPadding * 1.5}px`,
                fontSize: `${buttonFontSize}px`,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f1f5f9';
              }}
              title={isSmallSize ? "Настройки" : ""}
            >
              {isSmallSize ? "⚙️" : "⚙️ Настройки"}
            </button>
          </div>
        </div>
      </div>
      
      <HistoryModal 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        machine={machine}
        zoneId={zoneId}
      />
      
      <MachineSettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        machine={machine}
        zoneId={zoneId}
      />
      
      {showCommentModal && (
        <div className="modal-overlay" onClick={() => setShowCommentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h2>✏️ Изменение статуса</h2>
              <button className="modal-close" onClick={() => setShowCommentModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  Новый статус:
                </label>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  backgroundColor: statuses[pendingStatus]?.color || '#64748b',
                  color: 'white'
                }}>
                  {statuses[pendingStatus]?.name || pendingStatus}
                </span>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  Комментарий (необязательно):
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Например: Причина изменения статуса..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  📷 Фото (необязательно, можно несколько):
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  style={{ marginBottom: '12px' }}
                />
                
                {photoPreviews.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {photoPreviews.map((preview, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img
                          src={preview}
                          alt={`preview-${idx}`}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}
                        />
                        <button
                          onClick={() => removePhoto(idx)}
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCommentModal(false)} className="btn-cancel">
                Отмена
              </button>
              <button onClick={handleConfirmStatusChange} className="btn-submit">
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes blinkCard {
          0% {
            border-color: ${currentStatus.border};
            box-shadow: 0 0 0 0 ${currentStatus.color}40;
          }
          50% {
            border-color: ${currentStatus.color};
            box-shadow: 0 0 0 3px ${currentStatus.color}20;
          }
          100% {
            border-color: ${currentStatus.border};
            box-shadow: 0 0 0 0 ${currentStatus.color}40;
          }
        }
        
        @keyframes blinkStatus {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.98);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default MachineCard;
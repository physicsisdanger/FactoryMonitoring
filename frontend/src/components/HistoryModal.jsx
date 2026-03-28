import React, { useState, useRef } from 'react';
import useMachineStore from '../store/machineStore';

const HistoryModal = ({ isOpen, onClose, machine, zoneId }) => {
  const [commentText, setCommentText] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const fileInputRef = useRef(null);
  
  const addCommentToHistory = useMachineStore((state) => state.addCommentToHistoryEntry);

  if (!isOpen || !machine) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const handleAddComment = () => {
    if ((commentText.trim() || selectedPhotos.length > 0) && selectedHistoryId && zoneId) {
      // Конвертируем фото в base64
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
        addCommentToHistory(zoneId, machine.id, selectedHistoryId, commentText, photos);
      });
    }
    
    // Сброс
    setCommentText('');
    setSelectedPhotos([]);
    setPhotoPreviews([]);
    setSelectedHistoryId(null);
    setShowCommentInput(false);
  };

  const openCommentInput = (historyId) => {
    setSelectedHistoryId(historyId);
    setShowCommentInput(true);
    setCommentText('');
    setSelectedPhotos([]);
    setPhotoPreviews([]);
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
      <div className="modal-content history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📜 История изменений</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="machine-info">
            <h3>{machine.name}</h3>
            <p>Текущий статус: 
              <span style={{
                display: 'inline-block',
                marginLeft: '8px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: getStatusColor(machine.status),
                color: 'white'
              }}>
                {getStatusName(machine.status)}
              </span>
            </p>
          </div>
          
          <div className="history-list">
            {machine.history && machine.history.length > 0 ? (
              machine.history.map(record => (
                <div key={record.id} className="history-item">
                  <div className="history-date">{formatDate(record.date)}</div>
                  <div className="history-content">
                    {record.isCommentOnly ? (
                      <div className="history-comment">
                        <span className="comment-icon">💬</span>
                        <span className="comment-text">{record.comment}</span>
                      </div>
                    ) : (
                      <div className="history-status-change">
                        <div className="status-change">
                          {record.oldStatus ? (
                            <>
                              <span className="old-status" style={{ backgroundColor: getStatusColor(record.oldStatus) }}>
                                {getStatusName(record.oldStatus)}
                              </span>
                              <span className="arrow">→</span>
                              <span className="new-status" style={{ backgroundColor: getStatusColor(record.newStatus) }}>
                                {getStatusName(record.newStatus)}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="new-status" style={{ backgroundColor: getStatusColor(record.newStatus) }}>
                                {getStatusName(record.newStatus)}
                              </span>
                            </>
                          )}
                        </div>
                        {record.comment && (
                          <div className="history-comment">
                            <span className="comment-icon">💬</span>
                            <span className="comment-text">{record.comment}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Фото в записи */}
                    {record.photos && record.photos.length > 0 && (
                      <div className="history-photos">
                        {record.photos.map(photo => (
                          <img 
                            key={photo.id}
                            src={photo.data}
                            alt="Фото"
                            className="history-photo"
                            onClick={() => window.open(photo.data, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Комментарии к истории */}
                    {record.comments && record.comments.length > 0 && (
                      <div className="history-comments-section">
                        <div className="comments-title">💬 Комментарии:</div>
                        {record.comments.map(comment => (
                          <div key={comment.id} className="history-subcomment">
                            <div className="subcomment-date">{formatDate(comment.date)}</div>
                            <div className="subcomment-text">{comment.text}</div>
                            {comment.photos && comment.photos.length > 0 && (
                              <div className="subcomment-photos">
                                {comment.photos.map(photo => (
                                  <img 
                                    key={photo.id}
                                    src={photo.data}
                                    alt="Фото"
                                    className="subcomment-photo"
                                    onClick={() => window.open(photo.data, '_blank')}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="history-footer">
                      <div className="history-user">👤 {record.user || 'Оператор'}</div>
                      <button 
                        className="comment-btn"
                        onClick={() => openCommentInput(record.id)}
                      >
                        💬 Комментировать
                      </button>
                    </div>
                    
                    {/* Форма добавления комментария */}
                    {showCommentInput && selectedHistoryId === record.id && (
                      <div className="comment-input-area">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Напишите комментарий..."
                          rows={2}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            marginBottom: '8px'
                          }}
                          autoFocus
                        />
                        
                        <div style={{ marginBottom: '8px' }}>
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            multiple
                            onChange={handlePhotoSelect}
                            style={{ fontSize: '11px' }}
                          />
                          
                          {photoPreviews.length > 0 && (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                              {photoPreviews.map((preview, idx) => (
                                <div key={idx} style={{ position: 'relative' }}>
                                  <img
                                    src={preview}
                                    alt={`preview-${idx}`}
                                    style={{
                                      width: '50px',
                                      height: '50px',
                                      objectFit: 'cover',
                                      borderRadius: '6px',
                                      border: '1px solid #e2e8f0'
                                    }}
                                  />
                                  <button
                                    onClick={() => removePhoto(idx)}
                                    style={{
                                      position: 'absolute',
                                      top: '-4px',
                                      right: '-4px',
                                      width: '18px',
                                      height: '18px',
                                      borderRadius: '50%',
                                      background: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontSize: '10px',
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
                        
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              setShowCommentInput(false);
                              setCommentText('');
                              setSelectedPhotos([]);
                              setPhotoPreviews([]);
                              setSelectedHistoryId(null);
                            }}
                            style={{
                              padding: '4px 12px',
                              background: '#f1f5f9',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '11px'
                            }}
                          >
                            Отмена
                          </button>
                          <button
                            onClick={handleAddComment}
                            style={{
                              padding: '4px 12px',
                              background: '#3b82f6',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              color: 'white'
                            }}
                          >
                            Добавить
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-history">
                <p>📭 История изменений пуста</p>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-submit">
            Закрыть
          </button>
        </div>
      </div>
      
      <style>{`
        .history-modal {
          max-width: 650px;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .modal-body {
          flex: 1;
          overflow-y: auto;
        }
        
        .machine-info {
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .machine-info h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #0f172a;
        }
        
        .machine-info p {
          margin: 0;
          font-size: 14px;
          color: #64748b;
        }
        
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .history-item {
          padding: 12px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }
        
        .history-item:hover {
          background: #f1f5f9;
        }
        
        .history-date {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 8px;
          font-family: monospace;
        }
        
        .history-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .status-change {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .old-status, .new-status {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          color: white;
        }
        
        .arrow {
          font-size: 14px;
          color: #64748b;
        }
        
        .history-comment {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 8px 12px;
          background: #ffffff;
          border-radius: 8px;
          border-left: 3px solid #3b82f6;
        }
        
        .comment-icon {
          font-size: 14px;
        }
        
        .comment-text {
          font-size: 13px;
          color: #334155;
          line-height: 1.4;
          flex: 1;
        }
        
        .history-photos {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }
        
        .history-photo {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
          border: 1px solid #e2e8f0;
        }
        
        .history-photo:hover {
          transform: scale(1.05);
        }
        
        .history-comments-section {
          margin-top: 8px;
          padding: 8px;
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .comments-title {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 8px;
        }
        
        .history-subcomment {
          padding: 8px;
          background: #f8fafc;
          border-radius: 8px;
          margin-bottom: 8px;
        }
        
        .history-subcomment:last-child {
          margin-bottom: 0;
        }
        
        .subcomment-date {
          font-size: 10px;
          color: #94a3b8;
          margin-bottom: 4px;
        }
        
        .subcomment-text {
          font-size: 12px;
          color: #334155;
          margin-bottom: 6px;
        }
        
        .subcomment-photos {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        
        .subcomment-photo {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 6px;
          cursor: pointer;
          border: 1px solid #e2e8f0;
        }
        
        .history-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #e2e8f0;
        }
        
        .history-user {
          font-size: 11px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .comment-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 11px;
          color: #3b82f6;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        
        .comment-btn:hover {
          background: #e2e8f0;
        }
        
        .comment-input-area {
          margin-top: 8px;
          padding: 8px;
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .empty-history {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default HistoryModal;
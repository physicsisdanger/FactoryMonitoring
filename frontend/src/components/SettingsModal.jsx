import React from 'react';

const SettingsModal = ({ isOpen, onClose, cellWidth, onCellWidthChange }) => {
  if (!isOpen) return null;

  const handleSliderChange = (e) => {
    onCellWidthChange(parseInt(e.target.value));
  };

  const cellHeight = Math.floor(cellWidth * 2);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Настройки отображения</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="settings-section">
            <label className="settings-label">
              <span className="settings-icon">📐</span>
              Размер ячеек
            </label>
            <div className="slider-container">
              <input
                type="range"
                min="100"
                max="200"
                step="5"
                value={cellWidth}
                onChange={handleSliderChange}
                className="modern-slider"
              />
              <div className="slider-value">
                <span className="value-display">{cellWidth}×{cellHeight}px</span>
              </div>
            </div>
            <p className="settings-hint">
              Перетащите ползунок для изменения размера ячеек.<br />
              Ячейки имеют формат 1:2 (ширина : высота)
            </p>
          </div>
          
          <div className="settings-preview">
            <div className="preview-title">Предпросмотр:</div>
            <div className="preview-cell" style={{ width: cellWidth, height: cellHeight }}>
              <div className="preview-content">
                <span>📦</span>
                <span style={{ fontSize: Math.max(10, cellWidth / 10) }}>{cellWidth}×{cellHeight}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-submit">
            Готово
          </button>
        </div>
      </div>
      
      <style>{`
        .settings-modal {
          max-width: 500px;
        }
        
        .settings-section {
          margin-bottom: 24px;
        }
        
        .settings-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 12px;
        }
        
        .settings-icon {
          font-size: 18px;
        }
        
        .slider-container {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        
        .modern-slider {
          flex: 1;
          -webkit-appearance: none;
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        
        .modern-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
        }
        
        .modern-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        
        .slider-value {
          background: #f1f5f9;
          padding: 6px 14px;
          border-radius: 12px;
          min-width: 100px;
          text-align: center;
        }
        
        .value-display {
          font-size: 13px;
          font-weight: 600;
          color: #3b82f6;
        }
        
        .settings-hint {
          font-size: 12px;
          color: #64748b;
          margin-top: 12px;
          line-height: 1.4;
        }
        
        .settings-preview {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
        
        .preview-title {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 12px;
        }
        
        .preview-cell {
          background: linear-gradient(135deg, #f1f5f9 0%, #ffffff 100%);
          border-radius: 12px;
          border: 2px solid #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          margin: 0 auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .preview-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-size: 20px;
          color: #3b82f6;
        }
      `}</style>
    </div>
  );
};

export default SettingsModal;
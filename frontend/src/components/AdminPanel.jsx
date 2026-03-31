
import React, { useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AdminPanel = ({ isOpen, onClose }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newInvitation, setNewInvitation] = useState({ expires_days: 7 });

  const loadInvitations = async () => {
    try {
      const data = await authApi.getInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    }
  };

  const createInvitation = async () => {
    setLoading(true);
    try {
      await authApi.createInvitation(newInvitation);
      await loadInvitations();
      setNewInvitation({ expires_days: 7 });
    } catch (error) {
      console.error('Failed to create invitation:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadInvitations();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👑 Админ-панель</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="admin-section">
            <h3>🎫 Создать приглашение</h3>
            <div className="form-group">
              <label>Срок действия (дней)</label>
              <input
                type="number"
                value={newInvitation.expires_days}
                onChange={(e) => setNewInvitation({ expires_days: parseInt(e.target.value) })}
                min="1"
                max="365"
              />
            </div>
            <button onClick={createInvitation} disabled={loading} className="btn-submit">
              {loading ? 'Создание...' : 'Создать код приглашения'}
            </button>
          </div>
          
          <div className="admin-section">
            <h3>📋 Активные приглашения</h3>
            {invitations.length === 0 ? (
              <p style={{ color: '#64748b' }}>Нет активных приглашений</p>
            ) : (
              <div className="invitations-list">
                {invitations.map(inv => (
                  <div key={inv.id} className="invitation-item">
                    <code className="invitation-code">{inv.code}</code>
                    <span className="invitation-status">
                      {inv.is_used ? '✅ Использован' : '🟢 Активен'}
                    </span>
                    <span className="invitation-expires">
                      До: {new Date(inv.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
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
        .admin-modal {
          max-width: 600px;
        }
        
        .admin-section {
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .admin-section h3 {
          margin-bottom: 16px;
          font-size: 16px;
        }
        
        .invitations-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .invitation-item {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 10px;
          background: #f8fafc;
          border-radius: 8px;
        }
        
        .invitation-code {
          background: #1e293b;
          color: #white;
          padding: 4px 8px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 12px;
        }
        
        .invitation-status {
          font-size: 12px;
        }
        
        .invitation-expires {
          font-size: 11px;
          color: #64748b;
          margin-left: auto;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
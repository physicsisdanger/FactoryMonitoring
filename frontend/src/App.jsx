import { useState } from 'react';
import useMachineStore from './store/machineStore';
import MachineCard from './components/MachineCard';
import './components/MachineCard.css';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [newMachineName, setNewMachineName] = useState('');
  const machines = useMachineStore((state) => state.machines);
  const addMachine = useMachineStore((state) => state.addMachine);

  const handleAdd = () => {
    if (!newMachineName.trim()) {
      alert('Введите название станка');
      return;
    }
    addMachine(newMachineName);
    setNewMachineName('');
    setShowForm(false);
  };

  return (
    <div>
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>🏭 Мониторинг станков</h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '5px 12px',
              borderRadius: '20px'
            }}>
              Всего: {machines.length}
            </span>
            <button 
              onClick={() => setShowForm(true)}
              style={{
                background: 'white',
                color: '#667eea',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              + Добавить станок
            </button>
          </div>
        </div>
      </header>
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {machines.map(machine => (
            <MachineCard key={machine.id} machine={machine} />
          ))}
        </div>
        
        {machines.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            background: 'white',
            borderRadius: '12px',
            color: '#999'
          }}>
            Нет станков. Нажмите кнопку "Добавить станок" чтобы начать
          </div>
        )}
      </main>
      
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h2 style={{ marginTop: 0 }}>Добавить станок</h2>
            <input
              type="text"
              value={newMachineName}
              onChange={(e) => setNewMachineName(e.target.value)}
              placeholder="Название станка"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                marginBottom: '20px',
                fontSize: '16px'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowForm(false)}
                style={{
                  padding: '8px 16px',
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Отмена
              </button>
              <button 
                onClick={handleAdd}
                style={{
                  padding: '8px 16px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
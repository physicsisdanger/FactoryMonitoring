import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useMachineStore = create(
  persist(
    (set, get) => ({
      machines: [
        {
          id: '1',
          name: 'Фрезерный станок CNC-01',
          status: 'running',
          temperature: 45,
          position: { x: 0, y: 0, w: 1, h: 1 }
        },
        {
          id: '2',
          name: 'Токарный станок T-200',
          status: 'idle',
          temperature: 28,
          position: { x: 1, y: 0, w: 1, h: 1 }
        },
        {
          id: '3',
          name: 'Сверлильный станок Drill-300',
          status: 'idle',
          temperature: 22,
          position: { x: 2, y: 0, w: 1, h: 1 }
        },
        {
          id: '4',
          name: 'Шлифовальный станок Grind-500',
          status: 'idle',
          temperature: 35,
          position: { x: 0, y: 2, w: 1, h: 1 }
        },
        {
          id: '5',
          name: 'Расточной станок Bore-100',
          status: 'idle',
          temperature: 30,
          position: { x: 1, y: 2, w: 1, h: 1 }
        }
      ],
      
      addMachine: (name) => set((state) => {
        // Находим первую свободную позицию
        let newX = 0;
        let newY = 0;
        let found = false;
        
        for (let y = 0; y < 50 && !found; y++) {
          for (let x = 0; x < 20 && !found; x++) {
            const occupied = state.machines.some(m => m.position.x === x && m.position.y === y);
            if (!occupied) {
              newX = x;
              newY = y;
              found = true;
            }
          }
        }
        
        const newMachine = {
          id: Date.now().toString(),
          name: name,
          status: 'idle',
          temperature: 20,
          position: { x: newX, y: newY, w: 1, h: 1 }
        };
        
        return {
          machines: [...state.machines, newMachine]
        };
      }),
      
      updateStatus: (id, status) => set((state) => ({
        machines: state.machines.map(m => 
          m.id === id ? { ...m, status: status } : m
        )
      })),
      
      deleteMachine: (id) => set((state) => ({
        machines: state.machines.filter(m => m.id !== id)
      })),
      
      moveMachine: (id, newX, newY) => set((state) => {
        const machine = state.machines.find(m => m.id === id);
        if (!machine) return state;
        
        // Проверяем, свободно ли место
        const isOccupied = state.machines.some(m => 
          m.id !== id && m.position.x === newX && m.position.y === newY
        );
        
        if (isOccupied) return state;
        
        // Обновляем позицию
        const updatedMachines = state.machines.map(m =>
          m.id === id 
            ? { ...m, position: { x: newX, y: newY, w: 1, h: 1 } }
            : m
        );
        
        return { machines: updatedMachines };
      })
    }),
    {
      name: 'machine-storage',
    }
  )
);

export default useMachineStore;
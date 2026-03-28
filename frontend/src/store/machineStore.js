import { create } from 'zustand';

const useMachineStore = create((set) => ({
  machines: [
    {
      id: '1',
      name: 'Фрезерный станок CNC-01',
      status: 'running',
      temperature: 45,
    },
    {
      id: '2',
      name: 'Токарный станок T-200',
      status: 'idle',
      temperature: 28,
    }
  ],
  
  addMachine: (name) => set((state) => ({
    machines: [...state.machines, {
      id: Date.now().toString(),
      name: name,
      status: 'idle',
      temperature: 20,
    }]
  })),
  
  updateStatus: (id, status) => set((state) => ({
    machines: state.machines.map(m => 
      m.id === id ? { ...m, status: status } : m
    )
  })),
  
  deleteMachine: (id) => set((state) => ({
    machines: state.machines.filter(m => m.id !== id)
  }))
}));

export default useMachineStore;
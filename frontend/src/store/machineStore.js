import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useMachineStore = create(
  persist(
    (set, get) => ({
      zones: [
        {
          id: 'zone-1',
          name: 'Механический участок',
          order: 0,
          machines: [
            {
              id: '1',
              name: 'Фрезерный станок CNC-01',
              status: 'running',
              temperature: 45,
              position: { x: 0, y: 0, w: 1, h: 1 },
              photos: [],
              history: [
                {
                  id: 'hist-1',
                  date: new Date().toISOString(),
                  oldStatus: 'ready',
                  newStatus: 'running',
                  comment: 'Запущен в работу',
                  user: 'Оператор',
                  photos: [],
                  comments: []
                }
              ]
            },
            {
              id: '2',
              name: 'Токарный станок T-200',
              status: 'ready',
              temperature: 28,
              position: { x: 1, y: 0, w: 1, h: 1 },
              photos: [],
              history: []
            }
          ]
        },
        {
          id: 'zone-2',
          name: 'Сборочный участок',
          order: 1,
          machines: [
            {
              id: '3',
              name: 'Сверлильный станок Drill-300',
              status: 'waiting_qc',
              temperature: 22,
              position: { x: 0, y: 0, w: 1, h: 1 },
              photos: [],
              history: []
            },
            {
              id: '4',
              name: 'Шлифовальный станок Grind-500',
              status: 'need_check',
              temperature: 35,
              position: { x: 1, y: 0, w: 1, h: 1 },
              photos: [],
              history: []
            }
          ]
        }
      ],
      
      addZone: (name) => set((state) => {
        const maxOrder = Math.max(...state.zones.map(z => z.order), -1);
        return {
          zones: [...state.zones, {
            id: Date.now().toString(),
            name: name,
            order: maxOrder + 1,
            machines: []
          }]
        };
      }),
      
      deleteZone: (zoneId) => set((state) => ({
        zones: state.zones.filter(z => z.id !== zoneId)
      })),
      
      renameZone: (zoneId, newName) => set((state) => ({
        zones: state.zones.map(z => 
          z.id === zoneId ? { ...z, name: newName } : z
        )
      })),
      
      reorderZone: (zoneId, targetOrder) => set((state) => {
        const zones = [...state.zones];
        const sourceIndex = zones.findIndex(z => z.id === zoneId);
        const targetIndex = zones.findIndex(z => z.order === targetOrder);
        
        if (sourceIndex === -1 || targetIndex === -1) return state;
        
        const [movedZone] = zones.splice(sourceIndex, 1);
        zones.splice(targetIndex, 0, movedZone);
        
        const updatedZones = zones.map((zone, idx) => ({
          ...zone,
          order: idx
        }));
        
        return { zones: updatedZones };
      }),
      
      addMachineToZone: (zoneId, machineName) => set((state) => {
        const zone = state.zones.find(z => z.id === zoneId);
        if (!zone) return state;
        
        let newX = 0;
        let newY = 0;
        let found = false;
        
        for (let y = 0; y < 50 && !found; y++) {
          for (let x = 0; x < 20 && !found; x++) {
            const occupied = zone.machines.some(m => m.position.x === x && m.position.y === y);
            if (!occupied) {
              newX = x;
              newY = y;
              found = true;
            }
          }
        }
        
        const newMachine = {
          id: Date.now().toString(),
          name: machineName,
          status: 'ready',
          temperature: 20,
          position: { x: newX, y: newY, w: 1, h: 1 },
          photos: [],
          history: [{
            id: Date.now().toString(),
            date: new Date().toISOString(),
            oldStatus: null,
            newStatus: 'ready',
            comment: 'Станок добавлен',
            user: 'Система',
            photos: [],
            comments: []
          }]
        };
        
        return {
          zones: state.zones.map(z =>
            z.id === zoneId 
              ? { ...z, machines: [...z.machines, newMachine] }
              : z
          )
        };
      }),
      
      deleteMachineFromZone: (zoneId, machineId) => set((state) => ({
        zones: state.zones.map(z =>
          z.id === zoneId 
            ? { ...z, machines: z.machines.filter(m => m.id !== machineId) }
            : z
        )
      })),
      
      renameMachine: (zoneId, machineId, newName) => set((state) => ({
        zones: state.zones.map(z =>
          z.id === zoneId 
            ? { ...z, machines: z.machines.map(m =>
                m.id === machineId 
                  ? { ...m, name: newName }
                  : m
              ) }
            : z
        )
      })),
      
      clearMachineHistory: (zoneId, machineId) => set((state) => ({
        zones: state.zones.map(z =>
          z.id === zoneId 
            ? { ...z, machines: z.machines.map(m =>
                m.id === machineId 
                  ? { ...m, history: [] }
                  : m
              ) }
            : z
        )
      })),
      
      addPhotoToMachine: (zoneId, machineId, photoData) => set((state) => ({
        zones: state.zones.map(z =>
          z.id === zoneId 
            ? { ...z, machines: z.machines.map(m =>
                m.id === machineId 
                  ? { ...m, photos: [...(m.photos || []), photoData] }
                  : m
              ) }
            : z
        )
      })),
      
      updateMachineStatus: (zoneId, machineId, status, comment = '', photos = []) => set((state) => {
        const zone = state.zones.find(z => z.id === zoneId);
        if (!zone) return state;
        
        const machine = zone.machines.find(m => m.id === machineId);
        if (!machine) return state;
        
        const oldStatus = machine.status;
        
        const historyEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          oldStatus: oldStatus,
          newStatus: status,
          comment: comment || `Изменение статуса`,
          user: 'Оператор',
          photos: photos,
          comments: []
        };
        
        return {
          zones: state.zones.map(z =>
            z.id === zoneId 
              ? { ...z, machines: z.machines.map(m =>
                  m.id === machineId 
                    ? { 
                        ...m, 
                        status: status,
                        history: [historyEntry, ...(m.history || [])]
                      } 
                    : m
                ) }
              : z
          )
        };
      }),
      
      addCommentToHistoryEntry: (zoneId, machineId, historyId, comment, photos) => set((state) => {
        const zone = state.zones.find(z => z.id === zoneId);
        if (!zone) return state;
        
        const machine = zone.machines.find(m => m.id === machineId);
        if (!machine) return state;
        
        const historyEntry = machine.history.find(h => h.id === historyId);
        if (!historyEntry) return state;
        
        const newComment = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          text: comment,
          photos: photos || [],
          user: 'Оператор'
        };
        
        return {
          zones: state.zones.map(z =>
            z.id === zoneId 
              ? { ...z, machines: z.machines.map(m =>
                  m.id === machineId 
                    ? { 
                        ...m, 
                        history: m.history.map(h =>
                          h.id === historyId 
                            ? { 
                                ...h, 
                                comments: [...(h.comments || []), newComment]
                              } 
                            : h
                        )
                      } 
                    : m
                ) }
              : z
          )
        };
      }),
      
      moveMachineInZone: (zoneId, machineId, newX, newY) => set((state) => {
        const zone = state.zones.find(z => z.id === zoneId);
        if (!zone) return state;
        
        const machine = zone.machines.find(m => m.id === machineId);
        if (!machine) return state;
        
        const isOccupied = zone.machines.some(m => 
          m.id !== machineId && m.position.x === newX && m.position.y === newY
        );
        
        if (isOccupied) return state;
        
        return {
          zones: state.zones.map(z =>
            z.id === zoneId 
              ? { ...z, machines: z.machines.map(m =>
                  m.id === machineId 
                    ? { ...m, position: { x: newX, y: newY, w: 1, h: 1 } }
                    : m
                ) }
              : z
          )
        };
      })
    }),
    {
      name: 'factory-storage',
    }
  )
);

export default useMachineStore;
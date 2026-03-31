import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { USE_API } from '../config';
import { zonesApi, machinesApi, connectWebSocket, disconnectWebSocket, sendWSMessage } from '../services/api';

const useMachineStore = create(
  (set, get) => ({
    zones: [],
    loading: false,
    error: null,
    
    // Инициализация - загрузка данных
    init: async () => {
      if (!USE_API) return;
      
      set({ loading: true });
      try {
        const zones = await zonesApi.getAll();
        set({ zones, loading: false });
      } catch (error) {
        console.error('Failed to load zones:', error);
        set({ error: error.message, loading: false });
      }
    },
    
    // Добавить зону
    addZone: async (name) => {
      if (USE_API) {
        try {
          const newZone = await zonesApi.create({ name, order: 0 });
          set((state) => ({ zones: [...state.zones, newZone] }));
          sendWSMessage({ type: 'zone_created', data: newZone });
        } catch (error) {
          console.error('Failed to create zone:', error);
        }
      } else {
        // localStorage режим
        set((state) => {
          const maxOrder = Math.max(...state.zones.map(z => z.order), -1);
          const newZone = {
            id: Date.now().toString(),
            name: name,
            order: maxOrder + 1,
            machines: []
          };
          return { zones: [...state.zones, newZone] };
        });
      }
    },
    
    // Удалить зону
    deleteZone: async (zoneId) => {
      if (USE_API) {
        try {
          await zonesApi.delete(zoneId);
          set((state) => ({ zones: state.zones.filter(z => z.id !== zoneId) }));
          sendWSMessage({ type: 'zone_deleted', data: { id: zoneId } });
        } catch (error) {
          console.error('Failed to delete zone:', error);
        }
      } else {
        set((state) => ({ zones: state.zones.filter(z => z.id !== zoneId) }));
      }
    },
    
    // Переименовать зону
    renameZone: async (zoneId, newName) => {
      if (USE_API) {
        try {
          await zonesApi.update(zoneId, { name: newName });
          set((state) => ({
            zones: state.zones.map(z => z.id === zoneId ? { ...z, name: newName } : z)
          }));
          sendWSMessage({ type: 'zone_updated', data: { id: zoneId, name: newName } });
        } catch (error) {
          console.error('Failed to rename zone:', error);
        }
      } else {
        set((state) => ({
          zones: state.zones.map(z => z.id === zoneId ? { ...z, name: newName } : z)
        }));
      }
    },
    
    // Добавить станок в зону
    addMachineToZone: async (zoneId, machineName) => {
      if (USE_API) {
        try {
          const newMachine = await machinesApi.create(zoneId, {
            name: machineName,
            status: 'ready',
            temperature: 20,
            position_x: 0,
            position_y: 0,
            position_w: 1,
            position_h: 1
          });
          set((state) => ({
            zones: state.zones.map(z =>
              z.id === zoneId 
                ? { ...z, machines: [...(z.machines || []), newMachine] }
                : z
            )
          }));
          sendWSMessage({ type: 'machine_created', data: newMachine });
        } catch (error) {
          console.error('Failed to create machine:', error);
        }
      } else {
        // localStorage режим
        set((state) => {
          const zone = state.zones.find(z => z.id === zoneId);
          if (!zone) return state;
          
          let newX = 0;
          let newY = 0;
          let found = false;
          
          for (let y = 0; y < 50 && !found; y++) {
            for (let x = 0; x < 20 && !found; x++) {
              const occupied = (zone.machines || []).some(m => m.position.x === x && m.position.y === y);
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
            history: []
          };
          
          return {
            zones: state.zones.map(z =>
              z.id === zoneId 
                ? { ...z, machines: [...(z.machines || []), newMachine] }
                : z
            )
          };
        });
      }
    },
    
    // Обновить статус станка
    updateMachineStatus: async (zoneId, machineId, status, comment, photos) => {
      if (USE_API) {
        try {
          await machinesApi.changeStatus(machineId, status, comment, photos);
          set((state) => ({
            zones: state.zones.map(z =>
              z.id === zoneId 
                ? { ...z, machines: (z.machines || []).map(m =>
                    m.id === machineId ? { ...m, status: status } : m
                  ) }
                : z
            )
          }));
        } catch (error) {
          console.error('Failed to update status:', error);
        }
      } else {
        // localStorage режим (существующая логика)
        set((state) => ({
          zones: state.zones.map(z =>
            z.id === zoneId 
              ? { ...z, machines: (z.machines || []).map(m =>
                  m.id === machineId 
                    ? { 
                        ...m, 
                        status: status,
                        history: [{
                          id: Date.now().toString(),
                          date: new Date().toISOString(),
                          oldStatus: m.status,
                          newStatus: status,
                          comment: comment,
                          user: 'Оператор',
                          photos: photos || []
                        }, ...(m.history || [])]
                      } 
                    : m
                ) }
              : z
          )
        }));
      }
    },
    
    // Удалить станок
    deleteMachineFromZone: async (zoneId, machineId) => {
      if (USE_API) {
        try {
          await machinesApi.delete(machineId);
          set((state) => ({
            zones: state.zones.map(z =>
              z.id === zoneId 
                ? { ...z, machines: (z.machines || []).filter(m => m.id !== machineId) }
                : z
            )
          }));
        } catch (error) {
          console.error('Failed to delete machine:', error);
        }
      } else {
        set((state) => ({
          zones: state.zones.map(z =>
            z.id === zoneId 
              ? { ...z, machines: (z.machines || []).filter(m => m.id !== machineId) }
              : z
          )
        }));
      }
    },
    
    // Переместить станок в зоне
    moveMachineInZone: async (zoneId, machineId, newX, newY) => {
      if (USE_API) {
        try {
          await machinesApi.update(machineId, {
            position_x: newX,
            position_y: newY
          });
          set((state) => ({
            zones: state.zones.map(z =>
              z.id === zoneId 
                ? { ...z, machines: (z.machines || []).map(m =>
                    m.id === machineId 
                      ? { ...m, position: { x: newX, y: newY, w: m.position.w, h: m.position.h } }
                      : m
                  ) }
                : z
            )
          }));
        } catch (error) {
          console.error('Failed to move machine:', error);
        }
      } else {
        set((state) => ({
          zones: state.zones.map(z =>
            z.id === zoneId 
              ? { ...z, machines: (z.machines || []).map(m =>
                  m.id === machineId 
                    ? { ...m, position: { x: newX, y: newY, w: m.position.w, h: m.position.h } }
                    : m
                ) }
              : z
          )
        }));
      }
    },
    
    // Очистить историю станка
    clearMachineHistory: async (zoneId, machineId) => {
      // API метод нужно добавить на бэкенде
      set((state) => ({
        zones: state.zones.map(z =>
          z.id === zoneId 
            ? { ...z, machines: (z.machines || []).map(m =>
                m.id === machineId 
                  ? { ...m, history: [] }
                  : m
              ) }
            : z
        )
      }));
    },
    
    // Переименовать станок
    renameMachine: async (zoneId, machineId, newName) => {
      if (USE_API) {
        try {
          await machinesApi.update(machineId, { name: newName });
          set((state) => ({
            zones: state.zones.map(z =>
              z.id === zoneId 
                ? { ...z, machines: (z.machines || []).map(m =>
                    m.id === machineId ? { ...m, name: newName } : m
                  ) }
                : z
            )
          }));
        } catch (error) {
          console.error('Failed to rename machine:', error);
        }
      } else {
        set((state) => ({
          zones: state.zones.map(z =>
            z.id === zoneId 
              ? { ...z, machines: (z.machines || []).map(m =>
                  m.id === machineId ? { ...m, name: newName } : m
                ) }
              : z
          )
        }));
      }
    },
    
    // Подключить WebSocket
    connectWebSocket: (userId, onMessage) => {
      if (USE_API) {
        connectWebSocket(userId, (data) => {
          // Обработка входящих сообщений
          switch (data.type) {
            case 'zone_created':
            case 'zone_updated':
            case 'zone_deleted':
            case 'machine_created':
            case 'machine_updated':
            case 'machine_deleted':
            case 'status_changed':
              // Обновляем данные
              get().init();
              break;
            default:
              if (onMessage) onMessage(data);
          }
        });
      }
    },
    
    // Отключить WebSocket
    disconnectWebSocket: () => {
      if (USE_API) {
        disconnectWebSocket();
      }
    },
    
    // Загрузить начальные данные (для localStorage режима)
    loadInitialData: () => {
      if (!USE_API) {
        const saved = localStorage.getItem('factory-storage');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.state && parsed.state.zones) {
              set({ zones: parsed.state.zones });
            }
          } catch (e) {
            console.error('Failed to load saved data:', e);
          }
        }
      }
    }
  })
);

export default useMachineStore;
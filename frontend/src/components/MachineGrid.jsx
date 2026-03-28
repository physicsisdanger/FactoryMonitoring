import React, { useState, useEffect, useRef } from 'react';
import GridLayout from 'react-grid-layout';
import MachineCard from './MachineCard';
import useMachineStore from '../store/machineStore';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const MachineGrid = () => {
  const { machines, updatePosition } = useMachineStore();
  const [containerWidth, setContainerWidth] = useState(1400);
  const layoutRef = useRef(null);

  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector('.grid-container');
      if (container) {
        setContainerWidth(container.clientWidth - 40);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Создаем layout с фиксированными координатами
  const getLayout = () => {
    return machines.map(machine => ({
      i: machine.id,
      x: machine.position?.x ?? 0,
      y: machine.position?.y ?? 0,
      w: machine.position?.w ?? 2,
      h: machine.position?.h ?? 2,
      minW: 1,
      minH: 1,
      maxW: 6,
      maxH: 6,
      static: false,
      isDraggable: true,
      isResizable: true
    }));
  };

  const handleLayoutChange = (newLayout) => {
    // Обновляем позиции, сохраняя точные координаты
    newLayout.forEach(item => {
      const machine = machines.find(m => m.id === item.i);
      if (machine) {
        const oldPos = machine.position;
        // Обновляем только если координаты реально изменились
        if (!oldPos || 
            oldPos.x !== item.x || 
            oldPos.y !== item.y || 
            oldPos.w !== item.w || 
            oldPos.h !== item.h) {
          updatePosition(item.i, {
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h
          });
        }
      }
    });
  };

  // Вычисляем максимальную Y координату
  const getMaxY = () => {
    if (machines.length === 0) return 10;
    return Math.max(...machines.map(m => (m.position?.y || 0) + (m.position?.h || 2)));
  };

  // Создаем фиксированную сетку с пустыми ячейками
  const createFixedLayout = () => {
    const maxY = getMaxY();
    const fixedLayout = [];
    
    // Добавляем все существующие станки
    machines.forEach(machine => {
      fixedLayout.push({
        i: machine.id,
        x: machine.position.x,
        y: machine.position.y,
        w: machine.position.w,
        h: machine.position.h,
        static: false
      });
    });
    
    return fixedLayout;
  };

  return (
    <div className="grid-container" style={{
      background: '#f5f5f5',
      borderRadius: '12px',
      padding: '20px',
      minHeight: '700px'
    }}>
      <div style={{
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '2px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#333' }}>Планировка цеха</h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
            💡 Перетаскивайте станки мышкой. Каждый станок имеет фиксированную позицию.
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#f44336', fontWeight: 'bold' }}>
            ⚠️ ВАЖНО: Станки НЕ сдвигаются при удалении! Координаты Y фиксированы.
          </p>
        </div>
        <div style={{
          background: '#e8eaf6',
          padding: '5px 12px',
          borderRadius: '16px',
          fontSize: '12px',
          color: '#3f51b5'
        }}>
          Станков: {machines.length} / 50
        </div>
      </div>
      
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'auto',
        maxHeight: '70vh'
      }}>
        <GridLayout
          layout={createFixedLayout()}
          cols={20}
          rowHeight={120}
          width={containerWidth}
          isDraggable={true}
          isResizable={true}
          onLayoutChange={handleLayoutChange}
          margin={[12, 12]}
          containerPadding={[20, 20]}
          compactType={null}
          preventCollision={true}
          allowOverlap={false}
          autoSize={false}
          verticalCompact={false}
          style={{
            background: `
              linear-gradient(90deg, #e0e0e0 1px, transparent 1px),
              linear-gradient(0deg, #e0e0e0 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            backgroundPosition: 'center center',
            minHeight: `${(getMaxY() + 3) * 130}px`,
            height: `${(getMaxY() + 3) * 130}px`
          }}
        >
          {machines.map(machine => (
            <div key={machine.id} style={{ cursor: 'move' }}>
              <MachineCard machine={machine} />
            </div>
          ))}
        </GridLayout>
      </div>
      
      <div style={{
        marginTop: '15px',
        padding: '10px',
        background: '#e3f2fd',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#1565c0',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <span>📌 Фиксированные координаты:</span>
        <span>• Станок на Y=0 (верх) НЕ сдвигает станки на Y=2</span>
        <span>• При удалении станка его место остается пустым</span>
        <span>• Перетащите станок на любую Y координату</span>
        <span>• Координаты сохраняются автоматически</span>
      </div>
      
      {machines.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: 'white',
          borderRadius: '12px',
          color: '#999',
          marginTop: '20px'
        }}>
          Нет станков. Нажмите кнопку "Добавить станок" чтобы начать
        </div>
      )}
    </div>
  );
};

export default MachineGrid;
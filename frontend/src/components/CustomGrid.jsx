import React, { useState, useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MachineCard from './MachineCard';
import useMachineStore from '../store/machineStore';

const ItemTypes = {
  MACHINE: 'machine'
};

// Соотношение сторон: высота в 2 раза больше ширины
const CELL_HEIGHT_RATIO = 2;

const DraggableMachine = ({ machine, cellWidth }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.MACHINE,
    item: { id: machine.id, type: ItemTypes.MACHINE },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.4 : 1,
        cursor: 'grab',
        height: '100%',
        width: '100%',
        transition: 'opacity 0.2s ease',
      }}
    >
      <MachineCard machine={machine} cellWidth={cellWidth} />
    </div>
  );
};

const GridCell = ({ x, y, machine, onDrop, onDragOver, isPreview, cellWidth }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.MACHINE,
    drop: (item) => onDrop(item.id, x, y),
    hover: () => onDragOver(x, y),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const cellHeight = Math.floor(cellWidth * CELL_HEIGHT_RATIO);

  if (machine) {
    return (
      <div
        ref={drop}
        style={{
          gridColumn: `${x + 1} / span 1`,
          gridRow: `${y + 1} / span 1`,
          borderRadius: '16px',
          padding: '4px',
          backgroundColor: isOver ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
          transition: 'all 0.2s'
        }}
      >
        <DraggableMachine machine={machine} cellWidth={cellWidth} />
      </div>
    );
  }

  return (
    <div
      ref={drop}
      style={{
        gridColumn: `${x + 1} / span 1`,
        gridRow: `${y + 1} / span 1`,
        backgroundColor: isOver ? 'rgba(59, 130, 246, 0.08)' : '#fafcff',
        borderRadius: '16px',
        border: isOver ? '2px dashed #3b82f6' : '1px solid #e2e8f0',
        transition: 'all 0.2s ease',
        position: 'relative',
        cursor: 'pointer'
      }}
    >
      {isPreview && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '85%',
          height: '85%',
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          borderRadius: '14px',
          border: '2px solid #22c55e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 0.5s ease-in-out'
        }}>
          <span style={{
            background: '#22c55e',
            color: 'white',
            padding: '6px 14px',
            borderRadius: '24px',
            fontSize: '12px',
            fontWeight: 500
          }}>
            📍 Сюда
          </span>
        </div>
      )}
    </div>
  );
};

const CustomGrid = ({ cellWidth = 140 }) => {
  const { machines, moveMachine } = useMachineStore();
  const [previewCell, setPreviewCell] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [gridSize, setGridSize] = useState({ cols: 2, rows: 2 });

  const getGridSize = () => {
    let maxX = 0, maxY = 0;
    machines.forEach(machine => {
      if (machine.position.x > maxX) maxX = machine.position.x;
      if (machine.position.y > maxY) maxY = machine.position.y;
    });
    return { cols: Math.max(maxX + 2, 2), rows: Math.max(maxY + 2, 2) };
  };

  useEffect(() => {
    setGridSize(getGridSize());
  }, [machines]);

  const getMachineAt = (x, y) => machines.find(m => m.position.x === x && m.position.y === y);
  const isCellFree = (x, y) => !machines.some(m => m.position.x === x && m.position.y === y);

  const handleDrop = (machineId, newX, newY) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return;
    if (machine.position.x === newX && machine.position.y === newY) {
      setPreviewCell(null);
      setDraggingId(null);
      return;
    }
    if (isCellFree(newX, newY)) {
      moveMachine(machineId, newX, newY);
    }
    setPreviewCell(null);
    setDraggingId(null);
  };

  const handleDragOver = (x, y) => {
    if (draggingId) {
      const machine = machines.find(m => m.id === draggingId);
      if (machine && isCellFree(x, y)) {
        setPreviewCell({ x, y });
      } else {
        setPreviewCell(null);
      }
    }
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < gridSize.rows; y++) {
      for (let x = 0; x < gridSize.cols; x++) {
        const machine = getMachineAt(x, y);
        cells.push(
          <GridCell
            key={`${x}-${y}`}
            x={x}
            y={y}
            machine={machine}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            isPreview={previewCell && previewCell.x === x && previewCell.y === y}
            cellWidth={cellWidth}
          />
        );
      }
    }
    return cells;
  };

  const cellHeight = Math.floor(cellWidth * CELL_HEIGHT_RATIO);
  const gap = 12;
  const padding = 24;
  const gridWidth = gridSize.cols * (cellWidth + gap) + padding * 2;
  const gridHeight = gridSize.rows * (cellHeight + gap) + padding * 2;

  useEffect(() => {
    const handleDragStart = (e) => {
      const target = e.target.closest('[data-drag-id]');
      if (target) setDraggingId(target.getAttribute('data-drag-id'));
    };
    const handleDragEnd = () => {
      setPreviewCell(null);
      setDraggingId(null);
    };
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    return () => {
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{
        background: '#f8fafc',
        borderRadius: '24px',
        padding: '20px'
      }}>
        <style>{`
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.5; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
        `}</style>
        
        <div style={{
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: 600 }}>Планировка цеха</h3>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              💡 Перетаскивайте станки на свободные ячейки
            </p>
          </div>
          <div style={{
            background: '#f1f5f9',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#475569'
          }}>
            📊 {machines.length} станков
          </div>
        </div>
        
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          overflow: 'auto',
          maxHeight: 'calc(100vh - 280px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize.cols}, ${cellWidth}px)`,
            gridAutoRows: `${cellHeight}px`,
            gap: `${gap}px`,
            padding: `${padding}px`,
            width: `${gridWidth}px`,
            minHeight: `${gridHeight}px`,
            background: '#ffffff',
            transition: 'all 0.2s ease'
          }}>
            {renderGrid()}
          </div>
        </div>
        
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: '#f8fafc',
          borderRadius: '14px',
          fontSize: '12px',
          color: '#64748b',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          🖱️ Перетаскивайте станки | Размер ячейки: {cellWidth}×{cellHeight}px (ширина × высота)
        </div>
      </div>
    </DndProvider>
  );
};

export default CustomGrid;
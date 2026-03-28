import React, { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import MachineCard from './MachineCard';
import useMachineStore from '../store/machineStore';

const ItemTypes = {
  MACHINE: 'machine'
};

const CELL_HEIGHT_RATIO = 2;

const DraggableMachine = ({ machine, cellWidth, zoneId, onUpdateStatus, onDeleteMachine }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.MACHINE,
    item: { id: machine.id, zoneId: zoneId, type: ItemTypes.MACHINE },
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
      <MachineCard 
        machine={machine} 
        cellWidth={cellWidth}
        updateStatus={onUpdateStatus}
        deleteMachine={onDeleteMachine}
      />
    </div>
  );
};

const GridCell = ({ x, y, machine, onDrop, onDragOver, isPreview, cellWidth, zoneId, onUpdateStatus, onDeleteMachine }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.MACHINE,
    drop: (item) => onDrop(item.id, x, y, item.zoneId),
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
        <DraggableMachine 
          machine={machine} 
          cellWidth={cellWidth} 
          zoneId={zoneId}
          onUpdateStatus={onUpdateStatus}
          onDeleteMachine={onDeleteMachine}
        />
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

const ZoneGrid = ({ zone, cellWidth = 140, onUpdateStatus, onDeleteMachine }) => {
  const { moveMachineInZone } = useMachineStore();
  const [previewCell, setPreviewCell] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [gridSize, setGridSize] = useState({ cols: 2, rows: 2 });

  const getGridSize = () => {
    let maxX = 0, maxY = 0;
    if (zone.machines && zone.machines.length > 0) {
      zone.machines.forEach(machine => {
        if (machine.position.x > maxX) maxX = machine.position.x;
        if (machine.position.y > maxY) maxY = machine.position.y;
      });
    }
    return { cols: Math.max(maxX + 2, 2), rows: Math.max(maxY + 2, 2) };
  };

  useEffect(() => {
    setGridSize(getGridSize());
  }, [zone.machines]);

  const getMachineAt = (x, y) => {
    if (!zone.machines) return null;
    return zone.machines.find(m => m.position.x === x && m.position.y === y);
  };
  
  const isCellFree = (x, y) => {
    if (!zone.machines) return true;
    return !zone.machines.some(m => m.position.x === x && m.position.y === y);
  };

  const handleDrop = (machineId, newX, newY, sourceZoneId) => {
    if (sourceZoneId !== zone.id) {
      alert('Перемещение между зонами пока в разработке');
      setPreviewCell(null);
      setDraggingId(null);
      return;
    }
    
    if (!zone.machines) return;
    const machine = zone.machines.find(m => m.id === machineId);
    if (!machine) return;
    
    if (machine.position.x === newX && machine.position.y === newY) {
      setPreviewCell(null);
      setDraggingId(null);
      return;
    }
    
    if (isCellFree(newX, newY)) {
      moveMachineInZone(zone.id, machineId, newX, newY);
    }
    setPreviewCell(null);
    setDraggingId(null);
  };

  const handleDragOver = (x, y) => {
    if (draggingId && isCellFree(x, y)) {
      setPreviewCell({ x, y });
    } else {
      setPreviewCell(null);
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
            zoneId={zone.id}
            onUpdateStatus={onUpdateStatus}
            onDeleteMachine={onDeleteMachine}
          />
        );
      }
    }
    return cells;
  };

  const cellHeight = Math.floor(cellWidth * CELL_HEIGHT_RATIO);
  const gap = 12;
  const padding = 20;
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

  if (!zone.machines) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Загрузка...</div>;
  }

  return (
    <div style={{
      background: '#ffffff',
      padding: '20px'
    }}>
      <style>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
      
      <div style={{
        background: '#fafcff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'auto',
        maxHeight: '500px'
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
    </div>
  );
};

export default ZoneGrid;
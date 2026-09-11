import React, { useRef, useEffect } from 'react';
import { Zone, ResourceDepot, TaskItem } from '../types';

interface CommandMapProps {
  zones: Zone[];
  depots: ResourceDepot[];
  tasks: TaskItem[];
  selectedZone: Zone | null;
  onSelectZone: (zone: Zone) => void;
}

export const CommandMap: React.FC<CommandMapProps> = ({
  zones,
  depots,
  tasks,
  selectedZone,
  onSelectZone
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const width = canvas.width = canvas.parentElement?.clientWidth || 800;
    const height = canvas.height = canvas.parentElement?.clientHeight || 600;

    // Coordinate bounds mapping (Lucknow region: Lat 26.75 - 26.95, Lng 80.80 - 81.00)
    const minLat = 26.75, maxLat = 26.95;
    const minLng = 80.80, maxLng = 81.00;

    const toCanvasCoords = (lat: number, lng: number) => {
      const x = ((lng - minLng) / (maxLng - minLng)) * (width - 100) + 50;
      const y = height - (((lat - minLat) / (maxLat - minLat)) * (height - 100) + 50);
      return { x, y };
    };

    // Draw Dark Command Grid Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 1. Draw Resource Movement Vectors (Depots -> Zones)
    tasks.forEach(t => {
      if (t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS') {
        const targetZone = zones.find(z => z.id === t.zone_id);
        const sourceDepot = depots[0]; // Primary logistics depot
        if (targetZone && sourceDepot) {
          const p1 = toCanvasCoords(sourceDepot.latitude, sourceDepot.longitude);
          const p2 = toCanvasCoords(targetZone.latitude, targetZone.longitude);

          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([6, 6]);
          ctx.strokeStyle = t.priority === 'CRITICAL' ? '#ef4444' : '#38bdf8';
          ctx.lineWidth = 2;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    });

    // 2. Draw Zone Polygons & Markers
    zones.forEach(z => {
      const center = toCanvasCoords(z.latitude, z.longitude);
      const isSelected = selectedZone?.id === z.id;
      const isCritical = z.priority_level === 'CRITICAL';
      const isBlocked = z.accessibility === 'BLOCKED';

      // Draw Polygon surrounding area
      const radius = isCritical ? 65 : 45;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
      
      let fillColor = 'rgba(16, 185, 129, 0.15)'; // STABLE
      let strokeColor = '#10b981';
      if (z.priority_level === 'CRITICAL') {
        fillColor = 'rgba(239, 68, 68, 0.25)';
        strokeColor = '#ef4444';
      } else if (z.priority_level === 'HIGH') {
        fillColor = 'rgba(249, 115, 22, 0.2)';
        strokeColor = '#f97316';
      } else if (z.priority_level === 'WATCH') {
        fillColor = 'rgba(234, 179, 8, 0.15)';
        strokeColor = '#eab308';
      }

      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeStyle = isSelected ? '#38bdf8' : strokeColor;
      ctx.stroke();

      // Blocked route indicator
      if (isBlocked) {
        ctx.beginPath();
        ctx.arc(center.x + 35, center.y - 25, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('X', center.x + 31, center.y - 21);
      }

      // Zone Label Badge
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(center.x - 55, center.y - 12, 110, 24, 6);
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(z.name.split('—')[0].trim(), center.x, center.y + 4);

      // Score Badge
      ctx.fillStyle = strokeColor;
      ctx.beginPath();
      ctx.arc(center.x + 45, center.y - 10, 11, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(Math.round(z.priority_score).toString(), center.x + 45, center.y - 7);
    });

    // 3. Draw Depots
    depots.forEach(d => {
      const pos = toCanvasCoords(d.latitude, d.longitude);
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.depot_name.split('—')[0].trim(), pos.x, pos.y + 20);
    });

  }, [zones, depots, tasks, selectedZone]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const minLat = 26.75, maxLat = 26.95, minLng = 80.80, maxLng = 81.00;

    zones.forEach(z => {
      const x = ((z.longitude - minLng) / (maxLng - minLng)) * (width - 100) + 50;
      const y = height - (((z.latitude - minLat) / (maxLat - minLat)) * (height - 100) + 50);

      const dist = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
      if (dist <= 60) {
        onSelectZone(z);
      }
    });
  };

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Overlay Layer Control Badges */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        <span className="px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700 text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Live Command Map
        </span>
        <span className="px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700 text-[11px] font-semibold text-slate-400">
          5 Affected Zones
        </span>
      </div>

      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-pointer"
      />
    </div>
  );
};

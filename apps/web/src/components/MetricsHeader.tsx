import React from 'react';
import { AlertTriangle, ShieldAlert, Users, PackageX, Truck, CheckSquare } from 'lucide-react';
import { Zone, Incident, TaskItem, ResourceDepot } from '../types';

interface MetricsHeaderProps {
  zones: Zone[];
  incidents: Incident[];
  tasks: TaskItem[];
  depots: ResourceDepot[];
}

export const MetricsHeader: React.FC<MetricsHeaderProps> = ({ zones, incidents, tasks, depots }) => {
  const activeIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
  const criticalZonesCount = zones.filter(z => z.priority_level === 'CRITICAL').length;
  const totalPopulation = zones.reduce((sum, z) => sum + z.population, 0);

  // Compute unmet needs
  let unmetQuantity = 0;
  zones.forEach(z => {
    (z.needs || []).forEach(n => {
      unmetQuantity += n.quantity_required;
    });
  });

  // Total available stock
  let totalStockAvailable = 0;
  depots.forEach(d => {
    (d.resources || []).forEach(r => {
      totalStockAvailable += r.available_quantity;
    });
  });

  const activeTasksCount = tasks.filter(t => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS').length;

  const metrics = [
    { label: 'Active Incidents', value: activeIncidentsCount, icon: AlertTriangle, color: 'text-[#D6C09A]', bg: 'bg-white border-[#D9CEC1]' },
    { label: 'Critical Zones', value: criticalZonesCount, icon: ShieldAlert, color: 'text-[#9E3F45]', bg: 'bg-[#9E3F45]/10 border-[#9E3F45]/30' },
    { label: 'Affected Population', value: totalPopulation.toLocaleString(), icon: Users, color: 'text-[#2F7775]', bg: 'bg-[#2F7775]/10 border-[#2F7775]/30' },
    { label: 'Total Demand Required', value: unmetQuantity.toLocaleString(), icon: PackageX, color: 'text-[#542126]', bg: 'bg-white border-[#D9CEC1]' },
    { label: 'Available Depot Stock', value: totalStockAvailable.toLocaleString(), icon: Truck, color: 'text-[#718B78]', bg: 'bg-[#718B78]/10 border-[#718B78]/30' },
    { label: 'Active Agency Tasks', value: activeTasksCount, icon: CheckSquare, color: 'text-[#2F7775]', bg: 'bg-white border-[#D9CEC1]' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-[#F8F4EE] border-b border-[#D9CEC1] select-none font-sans">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div key={idx} className={`p-3 rounded-2xl border ${m.bg} flex items-center gap-3 transition-transform hover:scale-[1.02] shadow-sm`}>
            <div className={`p-2 rounded-xl ${m.color} bg-[#F4EDE3]`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#B5A69D] uppercase tracking-wider">{m.label}</p>
              <p className="text-lg font-black font-mono tracking-tight text-[#542126]">{m.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};



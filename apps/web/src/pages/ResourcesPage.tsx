import React from 'react';
import { ResourceDepot } from '../types';
import { Package, Truck, ShieldCheck, Database } from 'lucide-react';

interface ResourcesPageProps {
  depots: ResourceDepot[];
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ depots }) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#F8F4EE] text-[#2E2E2E] font-sans">
      <div className="border-b border-[#D9CEC1] pb-4">
        <h2 className="text-xl font-extrabold text-[#542126] flex items-center gap-2 font-mono">
          <Package className="w-5 h-5 text-[#2F7775]" /> RESOURCE INVENTORY & DEPOT STOCK
        </h2>
        <p className="text-xs text-[#B5A69D] mt-1">Realtime stock ledger and inventory reservation control across regional logistics hubs</p>
      </div>

      <div className="space-y-6">
        {depots.map((depot) => (
          <div key={depot.depot_id} className="bg-white border border-[#D9CEC1] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#D9CEC1] bg-[#F4EDE3] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#542126] flex items-center gap-2 font-mono">
                  <Truck className="w-4 h-4 text-[#2F7775]" /> {depot.depot_name}
                </h3>
                <p className="text-xs text-[#2E2E2E] font-mono mt-0.5">{depot.location_name} • Managed by: <span className="text-[#2F7775] font-semibold">{depot.agency_name}</span></p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-[#718B78]/20 text-[#718B78] border border-[#718B78]/40">
                  {depot.status}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4EDE3] text-[#542126] uppercase font-mono text-[10px] border-b border-[#D9CEC1]">
                  <tr>
                    <th className="p-3">Resource Type</th>
                    <th className="p-3">Total Quantity</th>
                    <th className="p-3">Reserved (Policy)</th>
                    <th className="p-3">Deployed</th>
                    <th className="p-3">Available Stock</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE1]">
                  {depot.resources.map((res) => (
                    <tr key={res.id} className="hover:bg-[#F4EDE3]/40">
                      <td className="p-3 font-bold text-[#542126]">{res.resource_type}</td>
                      <td className="p-3 font-mono text-[#2E2E2E]">{res.total_quantity.toLocaleString()} {res.unit}</td>
                      <td className="p-3 font-mono text-[#542126] font-semibold">{res.reserved_quantity.toLocaleString()} {res.unit}</td>
                      <td className="p-3 font-mono text-[#2F7775] font-semibold">{res.deployed_quantity.toLocaleString()} {res.unit}</td>
                      <td className="p-3 font-mono font-bold text-[#718B78] text-sm">{res.available_quantity.toLocaleString()} {res.unit}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-[#718B78]/20 text-[#718B78] font-bold border border-[#718B78]/40">{res.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

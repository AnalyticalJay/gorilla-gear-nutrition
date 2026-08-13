import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Terminal, X } from "lucide-react";
import { generateMockCourierEvents, getMockCourierScenarioMeta, MOCK_COURIER_SCENARIOS, type MockCourierScenario } from "@shared/mockCourierEvents";
import type { OrderTrackingEventInput } from "@shared/orderTracking";

type MockCourierSimulatorProps = {
  onPreview: (scenario: MockCourierScenario, events: OrderTrackingEventInput[]) => void;
  onClear: () => void;
  activeScenario: MockCourierScenario | null;
};

export default function MockCourierSimulator({ onPreview, onClear, activeScenario }: MockCourierSimulatorProps) {
  const [scenario, setScenario] = useState<MockCourierScenario>("out_for_delivery");
  const selectedMeta = getMockCourierScenarioMeta(scenario);

  return (
    <div className="glass-card rounded-xl border border-[#0EA5E9]/30 bg-[#0EA5E9]/5 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0EA5E9]/15 text-[#38BDF8]"><Sparkles className="h-4 w-4" /></span>
            <h2 className="font-bold text-white">Courier Timeline Simulator (Testing Tool)</h2>
          </div>
          <p className="mt-1 text-xs leading-5 text-[#94A3B8]">Preview realistic courier scan histories before connecting the live API. Mock events stay in this browser session and never change the order record.</p>
        </div>
        <span className="rounded-full border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#7DD3FC]">Browser preview</span>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={scenario} onValueChange={(value) => setScenario(value as MockCourierScenario)}>
          <SelectTrigger className="w-full border-[#334155] bg-[#0B0B0B] text-white sm:w-72"><SelectValue placeholder="Select test scenario" /></SelectTrigger>
          <SelectContent className="border-[#334155] bg-[#111111] text-white">
            {MOCK_COURIER_SCENARIOS.map((item) => <SelectItem key={item.value} value={item.value} className="focus:bg-[#1E293B] focus:text-white">{item.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button className="min-h-10 bg-[#0EA5E9] font-black uppercase tracking-wide text-black hover:bg-[#38BDF8]" onClick={() => onPreview(scenario, generateMockCourierEvents(scenario))}>
          <Terminal className="mr-2 h-4 w-4" /> Preview scenario
        </Button>
        {activeScenario && <Button variant="outline" className="min-h-10 border-[#334155] text-[#CBD5E1]" onClick={onClear}><X className="mr-2 h-4 w-4" /> Clear preview</Button>}
      </div>
      <p className="mt-3 text-xs leading-5 text-[#7DD3FC]">{selectedMeta.description}</p>
      {activeScenario && <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-[#FBBF24]">Previewing: {getMockCourierScenarioMeta(activeScenario).label} · not saved to this order</p>}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";

interface CompoundHarvestSliderProps {
  initialSettings: {
    compoundPercent: number;
    harvestPercent: number;
    autoCompound: boolean;
    autoHarvest: boolean;
  };
}

export function CompoundHarvestSlider({ initialSettings }: CompoundHarvestSliderProps) {
  const [compound, setCompound] = useState(initialSettings.compoundPercent);
  const [autoCompound, setAutoCompound] = useState(initialSettings.autoCompound);
  const [autoHarvest, setAutoHarvest] = useState(initialSettings.autoHarvest);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Yield Strategy</h3>
        <Settings className="w-4 h-4 text-text-tertiary cursor-pointer hover:text-brand-teal transition-colors" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-brand-teal uppercase tracking-wider">Compound</span>
            <span className="text-2xl font-bold text-text-primary">{compound}%</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-bold text-purple-500 uppercase tracking-wider">Harvest</span>
            <span className="text-2xl font-bold text-text-primary">{100 - compound}%</span>
          </div>
        </div>

        <Slider
          value={compound}
          max={100}
          step={1}
          onValueChange={(val) => setCompound(val as number)}
          className="py-4"
        />

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex items-center justify-between p-3 border border-border rounded-xl">
            <span className="text-xs font-medium text-text-secondary">Auto Compound</span>
            <Switch checked={autoCompound} onCheckedChange={setAutoCompound} />
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded-xl">
            <span className="text-xs font-medium text-text-secondary">Auto Harvest</span>
            <Switch checked={autoHarvest} onCheckedChange={setAutoHarvest} />
          </div>
        </div>
      </div>
    </div>
  );
}

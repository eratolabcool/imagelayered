'use client';

import React, { useState } from 'react';
import { ToolType, AdvancedDecompositionConfig } from '../types';
import { Icons } from './Icon';

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  onDecompose: (count: number) => void;
  isProcessing: boolean;
  layerCount: number;
  setLayerCount: (count: number) => void;
  advancedConfig: AdvancedDecompositionConfig;
  setAdvancedConfig: (config: AdvancedDecompositionConfig) => void;
}

const CrookedToolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  onDecompose,
  isProcessing,
  layerCount,
  setLayerCount,
  advancedConfig,
  setAdvancedConfig
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const tools: Array<{ id: ToolType; icon: React.ReactNode; label: string }> = [
    { id: 'select', icon: <Icons.ChevronRight />, label: 'Selection' },
    { id: 'move', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 9-3 3 3 3"/><path d="M22 12H2"/><path d="m19 15 3-3-3-3"/><path d="m15 5-3-3-3 3"/><path d="M12 2v20"/><path d="m9 19 3 3 3-3"/></svg>, label: 'Pan View' },
    { id: 'recolor', icon: <Icons.Colors />, label: 'Recolor' },
    { id: 'replace', icon: <Icons.Magic />, label: 'AI Replace' },
    { id: 'remove', icon: <Icons.Trash />, label: 'Remove Object' },
  ];

  const updateConfig = (updates: Partial<AdvancedDecompositionConfig>) => {
    setAdvancedConfig({ ...advancedConfig, ...updates });
  };

  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex gap-4 z-20">
      {/* Main Toolbar */}
      <div className="flex flex-col gap-4 p-3 glass-panel rounded-2xl shadow-2xl h-fit">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(tool.id)}
          className={`p-3 rounded-xl transition-all duration-200 group relative ${
            activeTool === tool.id
              ? 'bg-blue-600/30 text-blue-400 border border-blue-500/50'
              : 'hover:bg-white/5 text-gray-400'
          }`}
          title={tool.label}
        >
          {tool.icon}
          <span className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            {tool.label}
          </span>
        </button>
      ))}
      <div className="h-px bg-white/10 mx-2" />

      {/* Decomposition Section */}
      <div className="flex flex-col gap-3 p-1">
        <div className="flex flex-col gap-2">
            <div className="group relative">
                <input
                    type="number"
                    min="1"
                    max="20"
                    value={layerCount}
                    onChange={(e) => setLayerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-1 text-center text-xs text-blue-400 font-mono focus:border-blue-500/50 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Count"
                    title="Number of Layers"
                />
            </div>

            <button
                onClick={() => onDecompose(layerCount)}
                disabled={isProcessing}
                className={`p-3 rounded-xl transition-all duration-200 group relative flex items-center justify-center border border-white/5 ${
                    isProcessing ? 'opacity-50' : 'hover:bg-white/5 text-white/80'
                }`}
                title="Manual Decompose"
            >
                <Icons.Layer />
                <span className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                    Manual Decompose ({layerCount})
                </span>
            </button>

            <button
                onClick={() => onDecompose(0)}
                disabled={isProcessing}
                className={`p-3 rounded-xl transition-all duration-200 group relative flex items-center justify-center bg-blue-600/10 border border-blue-500/20 ${
                    isProcessing ? 'animate-pulse text-blue-300' : 'hover:bg-blue-600/20 text-blue-400'
                }`}
                title="Auto Decompose"
            >
                <div className="scale-110">
                    <Icons.Magic />
                </div>
                <span className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                    Auto Decompose
                </span>
            </button>
        </div>
      </div>

      <div className="h-px bg-white/10 mx-2" />

      {/* Settings Button */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className={`p-3 rounded-xl transition-all duration-200 group relative border border-transparent ${
          showAdvanced ? 'bg-white/10 text-white border-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5'
        }`}
        title="Advanced Settings"
      >
        <Icons.Settings />
      </button>
      </div>

      {/* Advanced Settings Sidebar */}
      {showAdvanced && (
        <div className="w-72 glass-panel rounded-3xl p-6 shadow-2xl animate-in slide-in-from-left-4 duration-300 flex flex-col gap-6 overflow-y-auto max-h-[80vh] custom-scrollbar border-blue-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black italic uppercase tracking-widest text-blue-400">Advanced Config</h3>
            <button onClick={() => setShowAdvanced(false)} className="text-gray-600 hover:text-white transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Prompts */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Prompt (Optional)</label>
              <textarea
                value={advancedConfig.prompt}
                onChange={(e) => updateConfig({ prompt: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-white resize-none h-16 outline-none focus:border-blue-500/50"
                placeholder="Target elements to extract..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Negative Prompt (Optional)</label>
              <textarea
                value={advancedConfig.negativePrompt}
                onChange={(e) => updateConfig({ negativePrompt: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-white resize-none h-16 outline-none focus:border-red-500/50"
                placeholder="Elements to ignore..."
              />
            </div>

            {/* Seed Controls */}
            <div className="space-y-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Randomize Seed</label>
                    <button
                        onClick={() => updateConfig({ randomizeSeed: !advancedConfig.randomizeSeed })}
                        className={`w-8 h-4 rounded-full relative transition-colors ${advancedConfig.randomizeSeed ? 'bg-blue-600' : 'bg-white/10'}`}
                    >
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${advancedConfig.randomizeSeed ? 'left-4.5' : 'left-0.5'}`} />
                    </button>
                </div>
                {!advancedConfig.randomizeSeed && (
                    <input
                        type="number"
                        value={advancedConfig.seed}
                        onChange={(e) => updateConfig({ seed: parseInt(e.target.value) || 0 })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-1 px-2 text-[10px] text-white outline-none"
                    />
                )}
            </div>

            {/* Model Params */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Guidance Scale</label>
                        <span className="text-[10px] font-mono text-blue-400">{advancedConfig.guidanceScale}</span>
                    </div>
                    <input
                        type="range" min="1" max="20" step="0.5"
                        value={advancedConfig.guidanceScale}
                        onChange={(e) => updateConfig({ guidanceScale: parseFloat(e.target.value) })}
                        className="w-full accent-blue-600 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Inference Steps</label>
                        <span className="text-[10px] font-mono text-blue-400">{advancedConfig.inferenceSteps}</span>
                    </div>
                    <input
                        type="range" min="10" max="100" step="1"
                        value={advancedConfig.inferenceSteps}
                        onChange={(e) => updateConfig({ inferenceSteps: parseInt(e.target.value) })}
                        className="w-full accent-blue-600 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">CFG Normalization</label>
                    <button
                        onClick={() => updateConfig({ enableCfgNormalization: !advancedConfig.enableCfgNormalization })}
                        className={`w-8 h-4 rounded-full relative transition-colors ${advancedConfig.enableCfgNormalization ? 'bg-blue-600' : 'bg-white/10'}`}
                    >
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${advancedConfig.enableCfgNormalization ? 'left-4.5' : 'left-0.5'}`} />
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Language: {advancedConfig.autoCaptionLanguageEn ? 'EN' : 'ZH'}</label>
                    <button
                        onClick={() => updateConfig({ autoCaptionLanguageEn: !advancedConfig.autoCaptionLanguageEn })}
                        className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-bold border border-white/10 hover:border-blue-500/50 transition-colors"
                    >
                        Switch
                    </button>
                </div>
            </div>

            {/* Decompose Button */}
            <div className="pt-4 border-t border-white/10">
                <button
                    onClick={() => onDecompose(layerCount)}
                    disabled={isProcessing}
                    className={`w-full py-3 rounded-xl transition-all duration-200 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${
                        isProcessing
                            ? 'bg-blue-600/20 text-blue-300 animate-pulse'
                            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                    }`}
                >
                    {isProcessing ? (
                        <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        <>
                            <Icons.Magic />
                            Decompose ({layerCount} Layers)
                        </>
                    )}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrookedToolbar;

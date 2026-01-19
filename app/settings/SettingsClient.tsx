"use client";

import { useState } from "react";
import { Zap, Check, Sparkles, Crown, Settings as SettingsIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Model {
  id: number;
  model_id: string;
  model_name: string;
  model_type: string;
  description: string;
  xp_cost: number;
  max_resolution: string;
  supports_thinking: boolean;
  is_active: boolean;
}

interface Settings {
  preferred_model: string;
  preferred_resolution: string;
  preferred_aspect_ratio: string;
}

interface SettingsClientProps {
  initialSettings: Settings;
  models: Model[];
  userXP: number;
}

export default function SettingsClient({ initialSettings, models, userXP }: SettingsClientProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const selectedModel = models.find(m => m.model_id === settings.preferred_model);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        router.refresh();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const getModelIcon = (modelType: string) => {
    if (modelType === 'gemini') return Sparkles;
    return Crown;
  };

  return (
    <div className="space-y-8">
      {/* Current XP Display */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Your XP Balance</h2>
            <p className="text-sm text-zinc-400">Available for image generation</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-3xl font-black text-yellow-400">{userXP} XP</span>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* AI Model Selection */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">AI Model</h2>
        </div>

        <div className="grid gap-4">
          {models.map((model) => {
            const Icon = getModelIcon(model.model_type);
            const isSelected = settings.preferred_model === model.model_id;
            
            return (
              <button
                key={model.id}
                onClick={() => model.is_active && setSettings({ ...settings, preferred_model: model.model_id })}
                disabled={!model.is_active}
                className={`relative text-left p-5 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-yellow-500 bg-yellow-500/5'
                    : model.is_active
                    ? 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                    : 'border-zinc-800 bg-zinc-900/50 opacity-50 cursor-not-allowed'
                }`}
              >
                {!model.is_active && (
                  <div className="absolute top-3 right-3 bg-zinc-700 text-zinc-300 text-xs font-bold px-3 py-1 rounded-full">
                    Coming Soon
                  </div>
                )}
                
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-black" />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{model.model_name}</h3>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-lg">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-400">{model.xp_cost} XP</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-zinc-400 mb-3">{model.description}</p>

                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-300">
                        Max: {model.max_resolution}
                      </span>
                      {model.supports_thinking && (
                        <span className="text-xs px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-purple-400">
                          Thinking Mode
                        </span>
                      )}
                      <span className="text-xs px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-300">
                        {model.model_type === 'gemini' ? 'Google' : 'OpenAI'}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Image Quality Settings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Image Quality</h2>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Resolution */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-3">Resolution</label>
            <select
              value={settings.preferred_resolution}
              onChange={(e) => setSettings({ ...settings, preferred_resolution: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-yellow-400 focus:outline-none"
            >
              <option value="1K">1K (Standard)</option>
              {selectedModel?.max_resolution === '2K' || selectedModel?.max_resolution === '4K' ? (
                <option value="2K">2K (High Quality)</option>
              ) : null}
              {selectedModel?.max_resolution === '4K' ? (
                <option value="4K">4K (Ultra Quality)</option>
              ) : null}
            </select>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-3">Aspect Ratio</label>
            <select
              value={settings.preferred_aspect_ratio}
              onChange={(e) => setSettings({ ...settings, preferred_aspect_ratio: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-yellow-400 focus:outline-none"
            >
              <option value="1:1">1:1 (Square)</option>
              <option value="16:9">16:9 (Widescreen)</option>
              <option value="9:16">9:16 (Portrait)</option>
              <option value="4:3">4:3 (Standard)</option>
              <option value="3:4">3:4 (Portrait Standard)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold rounded-xl transition-all shadow-lg hover:shadow-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            Save Settings
          </>
        )}
      </button>
    </div>
  );
}

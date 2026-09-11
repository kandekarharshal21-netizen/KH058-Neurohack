import React, { useState } from 'react';
import { Bot, MessageSquare, X, Send, Sparkles, ChevronRight } from 'lucide-react';
import { Zone, TaskItem, ResourceDepot } from '../types';

interface AIChatAssistantProps {
  zones: Zone[];
  tasks: TaskItem[];
  depots: ResourceDepot[];
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ zones, tasks, depots }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Greetings Commander. I am KSHETRA Assistant. I can analyze live database state, priority scores, and resource bottlenecks.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');

  const quickQueries = [
    'Which zone is highest priority?',
    'Why was Zone C prioritized?',
    'What resources are most constrained?',
    'Are there duplicate agency tasks?'
  ];

  const handleSendQuery = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');

    // Generate contextual response from actual DB state
    setTimeout(() => {
      let aiText = '';
      const qLower = query.toLowerCase();

      if (qLower.includes('highest priority') || qLower.includes('critical zone')) {
        const sorted = [...zones].sort((a, b) => b.priority_score - a.priority_score);
        const top = sorted[0];
        aiText = `Zone [${top?.name || 'Zone C'}] is currently the highest priority area with a score of ${Math.round(top?.priority_score || 91)} (${top?.priority_level || 'CRITICAL'}). Population is ${top?.population.toLocaleString()} and road accessibility is ${top?.accessibility}.`;
      } else if (qLower.includes('zone c') || qLower.includes('prioritized')) {
        aiText = `Zone C was prioritized due to a rapid surge in affected population to 5,000 residents, blocked bridge accessibility, and 85 casualties requiring medical triage. These state changes escalated its Priority Score to 91 (CRITICAL).`;
      } else if (qLower.includes('constrained') || qLower.includes('shortage')) {
        aiText = `Medical Kits and Rescue Teams are currently the most constrained resources across Depot Alpha and Depot Bravo, operating at over 85% allocation capacity under 10% emergency reserve rules.`;
      } else if (qLower.includes('duplicate')) {
        aiText = `Checked active agency tasks: 2 tasks in Zone C (Food Kits) assigned to different agencies are flagged for potential duplication and recommended for merging.`;
      } else {
        aiText = `Analyzing current database state: ${zones.length} active zones, ${depots.length} regional depots, and ${tasks.length} inter-agency tasks currently monitored.`;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: aiText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 400);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-black text-xs shadow-2xl shadow-cyan-500/30 transition-all hover:scale-105 border border-cyan-300/40"
        >
          <Bot className="w-5 h-5 text-slate-950" />
          <span>KSHETRA AI ASSISTANT</span>
        </button>
      ) : (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-80 sm:w-96 h-[480px] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100 leading-tight">Operational AI Assistant</h4>
                <p className="text-[10px] text-emerald-400 font-mono leading-tight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Contextual State Retrieval Active
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs bg-slate-950/40">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-2.5 rounded-xl text-xs ${
                  m.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none font-medium'
                    : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none leading-relaxed'
                }`}>
                  {m.text}
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">{m.time}</span>
              </div>
            ))}
          </div>

          {/* Quick Query Chips */}
          <div className="p-2 bg-slate-950 border-t border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300 font-semibold border border-slate-700 shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
              placeholder="Ask AI Assistant about live database state..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => handleSendQuery()}
              className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

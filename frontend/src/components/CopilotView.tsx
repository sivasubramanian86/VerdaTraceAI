import React, { useState } from 'react';
import { MessageSquare, Send, Image, FileAudio, FileVideo, X, Sparkles, Mic } from 'lucide-react';
import { translations } from '../i18n/translations';

interface ChatMessage {
  role: string;
  text: string;
}

interface CopilotViewProps {
  chatHistory: ChatMessage[];
  chatInput: string;
  setChatInput: (val: string) => void;
  chatLoading: boolean;
  handleChatSubmit: (e: React.FormEvent) => void;
  attachedMedia: { type: string; count: number; duration: number } | null;
  setAttachedMedia: (media: { type: string; count: number; duration: number } | null) => void;
  locale: string;
}

export const CopilotView: React.FC<CopilotViewProps> = ({
  chatHistory,
  chatInput,
  setChatInput,
  chatLoading,
  handleChatSubmit,
  attachedMedia,
  setAttachedMedia,
  locale
}) => {
  const [recording, setRecording] = useState(false);

  const currentPack = translations[locale]?.copilot || translations["en"].copilot;

  // Simulate Audio ASR Ingest
  const handleVoiceRecord = () => {
    setRecording(true);
    setTimeout(() => {
      setRecording(false);
      setChatInput(currentPack.voiceQuery);
      setAttachedMedia({ type: 'audio', count: 0, duration: 8 });
    }, 2500);
  };

  // Simulate OCR image upload Ingest
  const handleImageOCRUpload = () => {
    setAttachedMedia({ type: 'image', count: 1, duration: 0 });
    setChatInput("Analyze carbon details of this scanned supplier receipt: indiranagar grocery merchant");
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
        <Sparkles className="text-emerald-400 w-8 h-8 animate-pulse" /> Green Copilot Chat
      </h2>
      
      <div className="glass-panel flex-1 flex flex-col p-0 overflow-hidden h-[550px]">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <MessageSquare className="w-16 h-16 mb-4 opacity-50 text-emerald-455" />
              <p className="text-sm text-center px-4">{currentPack.welcome}</p>
              <p className="text-xs text-slate-650 mt-1">{currentPack.welcomeSub}</p>
            </div>
          ) : (
            chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl p-4 leading-relaxed whitespace-pre-line ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600/15 border border-emerald-500/30 text-emerald-100 font-medium' 
                    : 'bg-slate-900 border border-slate-880 text-slate-200'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
          
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-slate-800 text-slate-400 rounded-xl p-4 animate-pulse">
                {currentPack.thinking}
              </div>
            </div>
          )}

          {recording && (
            <div className="flex justify-end items-center gap-2 pr-4 text-xs text-cyan-400">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-3.5 bg-cyan-400 animate-bounce rounded-full" />
                <span className="w-1.5 h-5 bg-cyan-400 animate-bounce rounded-full" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-3.5 bg-cyan-400 animate-bounce rounded-full" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="font-semibold uppercase tracking-wider animate-pulse">Recording Speech...</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-955/80 space-y-3">
          {/* Suggestion Deck */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {currentPack.chips.map((q: any) => (
              <button 
                key={q.text}
                type="button"
                onClick={() => setChatInput(q.text)}
                className="text-left p-2.5 rounded-lg border bg-slate-900 border-slate-850 hover:border-emerald-500/45 hover:bg-slate-850/60 transition-all flex flex-col justify-between group h-16 relative overflow-hidden">
                <span className="absolute right-1.5 bottom-1 text-md opacity-25 group-hover:scale-110 transition-transform" aria-hidden="true">{q.icon}</span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">{q.label}</span>
                <span className="text-[10px] text-slate-350 font-semibold line-clamp-2 mt-1 leading-snug">{q.text}</span>
              </button>
            ))}
          </div>

          {attachedMedia && (
            <div className="flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-450">
              <span>{currentPack.attached} <strong className="uppercase">{attachedMedia.type}</strong> {attachedMedia.type === 'image' ? `(${attachedMedia.count} file)` : `(${attachedMedia.duration}s duration)`}</span>
              <button type="button" onClick={() => setAttachedMedia(null)} aria-label="Remove attached file" className="ml-auto text-slate-400 hover:text-red-400 transition-colors">
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <form onSubmit={handleChatSubmit} className="flex gap-2 items-center">
            <div className="flex gap-1 mr-1">
              <button 
                type="button" 
                title="Attach Image OCR Scan"
                aria-label="Attach Image to Chat"
                onClick={handleImageOCRUpload}
                className={`p-2 rounded-lg transition-colors ${attachedMedia?.type === 'image' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:bg-slate-800'}`}>
                <Image className="w-5 h-5" aria-hidden="true" />
              </button>
              <button 
                type="button" 
                title="Speak to Copilot (ASR)"
                aria-label="Attach Audio to Chat"
                onClick={handleVoiceRecord}
                className={`p-2 rounded-lg transition-colors ${recording ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/35 animate-ping' : 'text-slate-500 hover:bg-slate-800'}`}>
                {recording ? <Mic className="w-5 h-5" /> : <FileAudio className="w-5 h-5" aria-hidden="true" />}
              </button>
              <button 
                type="button" 
                title="Attach Video"
                aria-label="Attach Video to Chat"
                onClick={() => setAttachedMedia({ type: 'video', count: 0, duration: 15 })}
                className={`p-2 rounded-lg transition-colors ${attachedMedia?.type === 'video' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:bg-slate-800'}`}>
                <FileVideo className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={currentPack.placeholder}
              aria-label="Ask Green Copilot"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors text-slate-100 text-sm"
            />
            <button type="submit" disabled={chatLoading} aria-label="Send message to Green Copilot" className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 p-3 rounded-lg font-semibold transition-colors disabled:opacity-50">
              <Send className="w-5 h-5" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


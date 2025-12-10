import React, { useState, useRef, useEffect } from 'react';
import { Play, Wand2, Image as ImageIcon, Paperclip, ArrowUp, Mic, FileText, Download, Eye, EyeOff, X, Globe, Database, BarChart3, Crop, FileImage, Trash2 } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { editFalImage, generateFalImage } from './services/falService';
import { streamGeminiResponse } from './services/geminiService';
import { searchTavily } from './services/tavilyService';
import { AppMode, ImageGenerationSettings, Message, ModelId } from './types';

// API Configuration
const SYSTEM_INSTRUCTIONS: Record<AppMode, string> = {
  CORE: "You are the CORE intelligence of the Enigma OS. You are a strategic business architect. Your goal is to analyze user input, identify business opportunities, and structure chaotic ideas into concrete plans. Be analytical, direct, and structured. Use Markdown.",
  VISION: "You are the VISION module. You are an Art Director and Creative Strategist. Focus on aesthetics, brand identity, color palettes, and visual storytelling.",
  STORY: "You are the STORY engine. You are a master Copywriter and Storyteller. Focus on narrative, tone of voice, emotional connection, and content structure.",
  VALUE: "You are the VALUE analyzer. Focus on financial viability, business models, monetization strategies, and market fit.",
  SCALE: "You are the SCALE architect. Focus on growth hacking, automation, technology stacks, and scaling operations."
};

// --- FILE BLOCK COMPONENT ---
interface FileBlockProps {
  filename: string;
  content: string;
}

const FileBlock: React.FC<FileBlockProps> = ({ filename, content }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isHtml = filename.endsWith('.html');

  const handlePreviewHtml = () => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="my-3 border border-slate-200 dark:border-[#333] rounded-lg overflow-hidden bg-slate-50 dark:bg-[#111] shadow-sm max-w-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-[#333] bg-slate-100 dark:bg-[#1a1a1a]">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
             {isHtml ? <FileText className="w-4 h-4 text-orange-500" /> : <FileText className="w-4 h-4 text-blue-500" />}
          </div>
          <span className="text-xs font-mono font-medium truncate text-slate-700 dark:text-[#aaa]">{filename}</span>
        </div>
        <div className="flex items-center gap-1">
          {isHtml && (
             <button 
                onClick={handlePreviewHtml}
                className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-500 rounded text-[10px] font-bold uppercase tracking-wide transition-colors mr-2 font-mono"
             >
                <Eye className="w-3 h-3" /> Preview
             </button>
          )}
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md text-slate-500 dark:text-[#666] transition-colors"
            title={showPreview ? "Hide Preview" : "Show Preview"}
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button 
             onClick={handleDownload}
             className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md text-slate-500 dark:text-[#666] transition-colors"
             title="Download File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {showPreview && (
        <div className="relative">
             <pre className="p-3 text-[11px] font-mono leading-relaxed overflow-x-auto text-slate-600 dark:text-[#888] max-h-[300px] scrollbar-thin">
                {content}
             </pre>
             <button 
                onClick={handleCopy}
                className="absolute top-2 right-2 text-[10px] px-2 py-1 bg-white/80 dark:bg-[#222] hover:bg-white dark:hover:bg-[#333] text-slate-900 dark:text-[#eee] border border-slate-200 dark:border-[#333] rounded transition-colors backdrop-blur-sm font-mono"
             >
                {copied ? 'COPIED' : 'COPY'}
             </button>
        </div>
      )}
    </div>
  );
};

// --- PREVIEW ATTACHMENT COMPONENT ---
interface AttachmentPreviewProps {
  file: File;
  previewUrl: string | null;
  onRemove: () => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ file, previewUrl, onRemove }) => {
  const isImage = file.type.startsWith('image/');
  
  return (
    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-[#333] flex-shrink-0 group bg-slate-100 dark:bg-[#111]">
      {isImage && previewUrl ? (
        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-1">
          <FileText className="w-4 h-4 text-slate-400 dark:text-[#555]" />
          <span className="text-[6px] text-slate-500 dark:text-[#555] truncate w-full text-center mt-0.5 font-mono">{file.name.slice(-4)}</span>
        </div>
      )}
      <button 
        onClick={onRemove} 
        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  );
};

// --- OVERLAY / LAUNCHER COMPONENT ---
interface ToolsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const ToolsOverlay: React.FC<ToolsOverlayProps> = ({ isOpen, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !visible) return null;

  return (
    <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-white/90 dark:bg-jet/90 backdrop-blur-xl" onClick={onClose}></div>
        
        <div className="relative w-full h-full flex flex-col max-w-7xl mx-auto px-6 py-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">System Tools</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#222] transition-colors">
                    <X className="w-6 h-6 text-slate-500 dark:text-[#666]" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                 <div className="group p-6 rounded-2xl bg-white dark:bg-graphite border border-slate-200 dark:border-[#333] hover:border-gold/50 transition-all cursor-pointer hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(251,191,36,0.1)]">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                        <Wand2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white mb-2">Prompt Generator</h3>
                    <p className="text-sm text-slate-500 dark:text-[#888]">Zaawansowane narzędzia do tworzenia i optymalizacji promptów.</p>
                 </div>

                 <div className="group p-6 rounded-2xl bg-white dark:bg-graphite border border-slate-200 dark:border-[#333] hover:border-purple-500/50 transition-all cursor-pointer hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white mb-2">Image Studio</h3>
                    <p className="text-sm text-slate-500 dark:text-[#888]">Generowanie i edycja grafik w czasie rzeczywistym.</p>
                 </div>

                 <div className="group p-6 rounded-2xl bg-white dark:bg-graphite border border-slate-200 dark:border-[#333] hover:border-green-500/50 transition-all cursor-pointer hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                    <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 mb-4 group-hover:scale-110 transition-transform">
                        <Database className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white mb-2">Knowledge Base</h3>
                    <p className="text-sm text-slate-500 dark:text-[#888]">Zarządzanie wektorową bazą danych i kontekstem.</p>
                 </div>

                 <div className="group p-6 rounded-2xl bg-white dark:bg-graphite border border-slate-200 dark:border-[#333] hover:border-red-500/50 transition-all cursor-pointer hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                    <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 mb-4 group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white mb-2">Analytics</h3>
                    <p className="text-sm text-slate-500 dark:text-[#888]">Analiza danych i raportowanie w czasie rzeczywistym.</p>
                 </div>
            </div>
        </div>
    </div>
  );
};


export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeMode, setActiveMode] = useState<AppMode>('CORE');
  const [showTools, setShowTools] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWebSearchActive, setIsWebSearchActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false);
  const [showPromptBuilder, setShowPromptBuilder] = useState(false);
  const [pbState, setPbState] = useState({ role: '', task: '', tone: 'Professional', format: 'Markdown' });
  const [imageSettings, setImageSettings] = useState<ImageGenerationSettings>({ model: 'nano-banana', aspectRatio: 'auto', outputFormat: 'jpeg', webSearch: false });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<(string | null)[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Custom Cursor Refs
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorOutlineRef = useRef<HTMLDivElement>(null);

  // --- CURSOR LOGIC ---
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const posX = e.clientX;
      const posY = e.clientY;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${posX}px`;
        cursorDotRef.current.style.top = `${posY}px`;
        cursorDotRef.current.style.opacity = '1';
      }

      if (cursorOutlineRef.current) {
        cursorOutlineRef.current.animate({
          left: `${posX}px`,
          top: `${posY}px`
        }, { duration: 500, fill: 'forwards' });
        cursorOutlineRef.current.style.opacity = '1';
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  // --- INITIALIZATION ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme !== 'light'); 
    const savedMode = localStorage.getItem('activeMode');
    if (savedMode) setActiveMode(savedMode as AppMode);
    
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      if (parsed.length > 0) {
          setMessages(parsed);
          setHasStarted(true);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('activeMode', activeMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode, activeMode]);

  useEffect(() => {
    if (messages.length > 0) localStorage.setItem('chatHistory', JSON.stringify(messages));
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
  }, [messages, messages[messages.length - 1]?.text]);

  // Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'pl-PL';
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
          }
          if (finalTranscript) setInputText((prev) => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + finalTranscript);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return alert("Browser not supported for speech.");
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try { recognitionRef.current.start(); setIsListening(true); } catch (e) { setIsListening(false); }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        setAttachedFiles(prev => [...prev, ...files]);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = (ev) => { if(ev.target?.result) setFilePreviews(prev => [...prev, ev.target!.result as string]); };
              reader.readAsDataURL(file);
            } else { setFilePreviews(prev => [...prev, null]); }
        });
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const fileToDataUri = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
      });
  };

  const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
  };

  const handlePromptApply = () => {
    const prompt = `Act as: ${pbState.role}\nTask: ${pbState.task}\nTone: ${pbState.tone}\nFormat: ${pbState.format}`;
    setInputText(prompt);
    setShowPromptBuilder(false);
    setPbState({ role: '', task: '', tone: 'Professional', format: 'Markdown' });
  };
  
  const clearHistory = () => {
      setMessages([]);
      localStorage.removeItem('chatHistory');
      setHasStarted(false); 
      setInputText('');
      setIsImageMode(false);
  };

  const parseMessageContent = (text: string) => {
    const parts = [];
    const regex = /<FILE\s+name="([^"]+)">([\s\S]*?)<\/FILE>/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      parts.push({ type: 'file', filename: match[1], content: match[2].trim() });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) parts.push({ type: 'text', content: text.substring(lastIndex) });
    return parts;
  };

  const handleSubmit = async (overridePrompt?: string) => {
    const rawPrompt = overridePrompt || inputText.trim();
    if ((!rawPrompt && attachedFiles.length === 0) || isProcessing) return;

    if (!hasStarted) setHasStarted(true);
    if (!overridePrompt) setInputText('');
    setIsProcessing(true);

    const currentFiles = [...attachedFiles];
    const firstImageFile = currentFiles.find(f => f.type.startsWith('image/'));
    const firstImagePreview = filePreviews.find(p => p !== null) || undefined;

    if (!overridePrompt) { setAttachedFiles([]); setFilePreviews([]); }

    const userMessage: Message = { role: 'user', text: rawPrompt, imageUrl: firstImagePreview as string | undefined };
    setMessages(prev => [...prev, userMessage]);

    if (isImageMode) {
        const modelMessage: Message = { role: 'model', text: 'Creating Visual...', isStreaming: true };
        setMessages(prev => [...prev, modelMessage]);
        try {
            let finalImageUrl = '';
            if (firstImageFile && firstImagePreview) {
                 const base64 = await fileToDataUri(firstImageFile);
                 finalImageUrl = await editFalImage(rawPrompt || "Enhance", base64, imageSettings);
            } else {
                 finalImageUrl = await generateFalImage(rawPrompt, imageSettings);
            }
            setMessages(prev => {
                const newMessages = [...prev];
                const last = newMessages[newMessages.length-1];
                last.text = `Generated in Image Studio`;
                last.imageUrl = finalImageUrl;
                last.isStreaming = false;
                return newMessages;
            });
        } catch (err: any) {
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length-1].text = `Error: ${err.message}`;
                newMessages[newMessages.length-1].isStreaming = false;
                return newMessages;
            });
        } finally { setIsProcessing(false); }
        return; 
    }

    // Standard Chat
    let searchContext = "";
    if (isWebSearchActive && rawPrompt) {
        setMessages(prev => [...prev, { role: 'model', text: 'Searching...', isStreaming: true }]);
        searchContext = await searchTavily(rawPrompt);
        setMessages(prev => prev.slice(0, -1)); 
    }

    const modelMessage: Message = { role: 'model', text: '', isStreaming: true };
    setMessages(prev => [...prev, modelMessage]);

    try {
      let finalPrompt = rawPrompt;
      let promptImage: string | undefined = undefined;
      if (searchContext) finalPrompt = `[Web Search Context]\n${searchContext}\n\n[User Query]\n${finalPrompt}`;

      for (const file of currentFiles) {
        if (!file.type.startsWith('image/')) {
          try {
            const content = await fileToText(file);
            finalPrompt += `\n\n--- FILE: ${file.name} ---\n${content}\n`;
          } catch (e) { finalPrompt += `\n[Error: ${file.name}]\n`; }
        }
      }
      if (firstImageFile) promptImage = await fileToDataUri(firstImageFile);

      const historyForService = [...messages];
      historyForService.push({ role: 'user', text: finalPrompt, imageUrl: promptImage });

      const stream = streamGeminiResponse(historyForService, ModelId.GEMINI_FLASH, SYSTEM_INSTRUCTIONS[activeMode]);
      let accumulatedText = "";
      for await (const chunk of stream) {
        accumulatedText += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = accumulatedText;
          return newMessages;
        });
      }
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].isStreaming = false;
        return newMessages;
      });
    } catch(err: any) {
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length-1].text = `Error: ${err.message}`;
            newMessages[newMessages.length-1].isStreaming = false;
            return newMessages;
        });
    } finally { setIsProcessing(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden text-[#EDEDED] transition-colors duration-300">
      
      {/* Custom Cursor */}
      <div ref={cursorDotRef} className="cursor-dot hidden md:block"></div>
      <div ref={cursorOutlineRef} className="cursor-outline hidden md:block"></div>

      <Header darkMode={darkMode} setDarkMode={setDarkMode} activeMode={activeMode} onModeSelect={setActiveMode} onOpenLauncher={() => setShowTools(true)} />

      <ToolsOverlay isOpen={showTools} onClose={() => setShowTools(false)} />

      <main 
        className={`flex-1 relative w-full pb-[250px] scroll-smooth [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] ${hasStarted ? 'overflow-y-auto' : 'overflow-hidden'}`}
        id="scroll-container" 
        ref={scrollContainerRef}
      >
            {/* HERO */}
            <div id="hero-section" className={`flex flex-col items-center justify-center min-h-[90vh] w-full max-w-[1800px] mx-auto px-4 transition-all duration-700 ${hasStarted ? 'opacity-0 hidden' : 'opacity-100'}`}>
                <div className="group relative rounded-full p-[1px] overflow-hidden cursor-pointer mb-8 transition-transform hover:scale-[1.01]">
                    <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,theme(colors.gold.DEFAULT)_50%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-2 bg-[#121214] border border-[#222] group-hover:border-transparent rounded-full px-3 py-1 shadow-sm h-full w-full backface-hidden">
                        <div className="w-3.5 h-3.5 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                            <Play className="w-2 h-2 text-gold ml-0.5" />
                        </div>
                        <span className="text-[#ccc] text-xs font-mono">Enigma OS v3: {activeMode}</span>
                    </div>
                </div>

                <h1 className="text-3xl md:text-5xl leading-[1.1] font-display font-bold tracking-tight text-center mb-4 text-gradient">
                    Create beautiful designs
                </h1>
                <p className="text-base text-[#888] font-normal text-center mb-10 tracking-tight max-w-xl">
                    Generate a strategy, design system, or narrative in seconds. <a href="#" className="text-white underline underline-offset-4 hover:text-gold transition-colors">Watch the demo.</a>
                </p>
            </div>

            {/* CHAT */}
            {hasStarted && (
                <div id="chat-history" className="w-full max-w-[680px] mx-auto px-4 pt-10 flex flex-col gap-8 animate-fade-in">
                    <div className="flex justify-end mb-2">
                         <button onClick={clearHistory} className="flex items-center gap-1.5 text-[10px] text-[#666] hover:text-red-500 transition-colors px-3 py-1 rounded-full border border-transparent hover:border-red-500/20 hover:bg-red-500/10 font-mono">
                             <Trash2 className="w-3 h-3" /> CLEAR CONTEXT
                         </button>
                    </div>

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${idx === messages.length - 1 ? 'animate-slide-up' : ''}`}>
                             {msg.role === 'user' ? (
                                 <div className="bg-graphite text-[#EDEDED] px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] text-[15px] leading-relaxed shadow-lg border border-white/5">
                                      {msg.imageUrl && <div className="mb-2"><img src={msg.imageUrl} alt="User Attachment" className="max-w-full rounded-lg" /></div>}
                                      {msg.text}
                                 </div>
                             ) : (
                                 <div className="flex gap-4 items-start max-w-[95%] w-full">
                                     <div className="w-8 h-8 rounded-full bg-jet border border-gold/30 flex-none flex items-center justify-center text-gold text-[10px] font-bold shadow-[0_0_10px_rgba(214,179,118,0.2)] mt-1 font-display">AI</div>
                                     <div className="text-[#ccc] text-[15px] leading-relaxed mt-1 flex-1 bg-jet border border-[#222] p-6 rounded-2xl min-w-0 shadow-sm">
                                         {parseMessageContent(msg.text).map((part, pIdx) => {
                                             if (part.type === 'file') return <FileBlock key={pIdx} filename={part.filename!} content={part.content!} />;
                                             return <div key={pIdx} className="whitespace-pre-wrap markdown-body font-light">{part.content}</div>
                                         })}
                                         {msg.imageUrl && <div className="mt-3"><img src={msg.imageUrl} alt="Generated" className="rounded-lg border border-[#333] shadow-lg" /></div>}
                                         {msg.isStreaming && <div className="flex items-center gap-1 h-6 mt-2"><div className="w-1.5 h-1.5 bg-gold rounded-full animate-typing" style={{ animationDelay: '0s' }}></div><div className="w-1.5 h-1.5 bg-gold rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div><div className="w-1.5 h-1.5 bg-gold rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div></div>}
                                     </div>
                                 </div>
                             )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            )}
      </main>

      {/* INPUT */}
      <div id="input-wrapper" className={`input-container-transition absolute left-1/2 -translate-x-1/2 w-full px-4 z-40 ${hasStarted ? 'bottom-[85px] max-w-[680px] translate-y-0 fixed' : 'top-[75%] -translate-y-1/2 max-w-[700px]'}`}>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isImageMode ? 'max-h-[100px] opacity-100 mb-3' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-wrap gap-2 p-2 bg-jet/90 border border-gold/30 rounded-xl backdrop-blur-md">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-graphite rounded-lg border border-[#333]">
                        <Crop className="w-3.5 h-3.5 text-gold" />
                        <select value={imageSettings.aspectRatio} onChange={(e) => setImageSettings({...imageSettings, aspectRatio: e.target.value as any})} className="bg-transparent text-xs text-white outline-none border-none cursor-pointer font-mono"><option value="auto">Auto Ratio</option><option value="1:1">Square (1:1)</option><option value="16:9">Landscape (16:9)</option></select>
                    </div>
                </div>
            </div>

            <div className={`relative w-full backdrop-blur-xl rounded-xl shadow-2xl border transition-all duration-500 ${isImageMode ? 'bg-[#1a1025] border-purple-500/50' : 'bg-[#0a0a0a] border-[#222] focus-within:border-gold/50'}`}>
                {attachedFiles.length > 0 && (
                    <div className="flex gap-2 p-2 mb-2 overflow-x-auto border-b border-[#222] scrollbar-none">
                        {attachedFiles.map((file, idx) => <AttachmentPreview key={idx} file={file} previewUrl={filePreviews[idx] || null} onRemove={() => removeFile(idx)} />)}
                    </div>
                )}
                
                <div className="relative">
                    <div className="absolute left-4 bottom-4 z-10">
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} multiple />
                        <button onClick={() => fileInputRef.current?.click()} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#666] hover:text-gold hover:bg-[#1a1a1a] transition-colors"><Paperclip className="w-4 h-4" /></button>
                    </div>

                    <textarea 
                        ref={textareaRef}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={`w-full py-4 pl-4 pr-4 pb-14 text-[15px] bg-transparent border-none outline-none resize-none overflow-y-auto transition-colors font-light ${isImageMode ? 'text-purple-200 placeholder:text-purple-500/50' : 'text-[#EDEDED] placeholder:text-[#444]'}`}
                        placeholder={isImageMode ? "Describe visual..." : "Ask Enigma..."}
                        style={{ minHeight: '120px' }}
                    ></textarea>

                    <div className="absolute right-4 bottom-4 flex items-center gap-1">
                        {!isImageMode && <button onClick={toggleListening} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isListening ? 'text-red-500 animate-pulse' : 'text-[#666] hover:text-[#fff]'}`}><Mic className="w-4 h-4" /></button>}
                        <button onClick={() => handleSubmit()} disabled={(!inputText.trim() && attachedFiles.length === 0) || isProcessing} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm ml-1 ${ (inputText.trim() || attachedFiles.length > 0) && !isProcessing ? 'bg-white text-black hover:bg-gold hover:text-black' : 'bg-[#222] text-[#555] cursor-not-allowed'}`}><ArrowUp className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-center items-center gap-4 mt-4">
                 <button onClick={() => setIsImageMode(!isImageMode)} className={`flex items-center gap-1.5 text-[10px] font-mono transition-colors ${isImageMode ? 'text-purple-400' : 'text-[#555] hover:text-white'}`}><ImageIcon className="w-3.5 h-3.5" /> {isImageMode ? 'IMG MODE' : 'IMAGE'}</button>
                 <button onClick={() => setShowPromptBuilder(true)} className="flex items-center gap-1.5 text-[10px] font-mono text-[#555] hover:text-white transition-colors"><Wand2 className="w-3 h-3" /> PROMPT</button>
                 {!isImageMode && <button onClick={() => setIsWebSearchActive(!isWebSearchActive)} className={`flex items-center gap-1.5 text-[10px] font-mono transition-colors ${isWebSearchActive ? 'text-blue-400' : 'text-[#555] hover:text-white'}`}><Globe className="w-3 h-3" /> WEB</button>}
            </div>
      </div>

      <Footer />
      
      {showPromptBuilder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="w-full max-w-lg bg-jet rounded-2xl border border-[#333] shadow-2xl overflow-hidden animate-slide-up">
             <div className="p-4 flex justify-between items-center border-b border-[#222]">
                <h3 className="font-semibold text-white font-display">Prompt Builder</h3>
                <button onClick={()=>setShowPromptBuilder(false)}><X className="w-4 h-4 text-[#666] hover:text-white"/></button>
             </div>
             <div className="p-6 space-y-4">
                 <input className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:border-gold outline-none placeholder:text-[#444] font-mono text-sm" placeholder="Role (e.g. Expert Coder)..." value={pbState.role} onChange={e=>setPbState({...pbState, role:e.target.value})} />
                 <textarea className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white h-32 focus:border-gold outline-none resize-none placeholder:text-[#444] font-mono text-sm" placeholder="Task description..." value={pbState.task} onChange={e=>setPbState({...pbState, task:e.target.value})} />
                 <div className="flex justify-end gap-2 pt-2">
                    <button onClick={()=>setShowPromptBuilder(false)} className="px-4 py-2 text-xs text-[#888] hover:bg-[#222] rounded-lg transition-colors font-mono">CANCEL</button>
                    <button onClick={handlePromptApply} className="px-4 py-2 text-xs bg-gold text-black rounded-lg hover:bg-white transition-colors font-mono font-bold">INSERT</button>
                 </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
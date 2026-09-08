import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User, Loader2, ChevronDown } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "How does Quick Sort work?",
  "Compare Merge Sort vs Heap Sort",
  "What is Big-O notation?",
  "Which algorithm is fastest?",
  "How do I use the visualizer?",
  "What is a stable sort?",
];

/** Simple markdown-like renderer for bold, inline code, code blocks, and lists */
function renderMarkdown(text: string): React.ReactNode[] {
  const blocks = text.split(/\n\n+/);
  const elements: React.ReactNode[] = [];

  blocks.forEach((block, blockIdx) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    // Code block
    if (trimmed.startsWith('```')) {
      const lines = trimmed.split('\n');
      const codeContent = lines.slice(1, lines[lines.length - 1] === '```' ? -1 : undefined).join('\n');
      elements.push(
        <pre key={blockIdx} className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono overflow-x-auto my-2 whitespace-pre-wrap">
          <code>{codeContent}</code>
        </pre>
      );
      return;
    }

    // Process inline formatting
    const processInline = (line: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      // Split on bold (**text**) and inline code (`text`)
      const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.slice(lastIndex, match.index));
        }
        const token = match[0];
        if (token.startsWith('**') && token.endsWith('**')) {
          parts.push(<strong key={`b-${match.index}`} className="font-semibold text-slate-900">{token.slice(2, -2)}</strong>);
        } else if (token.startsWith('`') && token.endsWith('`')) {
          parts.push(<code key={`c-${match.index}`} className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[11px] font-mono">{token.slice(1, -1)}</code>);
        }
        lastIndex = match.index + token.length;
      }
      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
      }
      return parts;
    };

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split(/\n/).filter(l => l.trim());
      elements.push(
        <ol key={blockIdx} className="list-decimal list-inside space-y-1 my-2 text-[13px] text-slate-700">
          {items.map((item, i) => (
            <li key={i}>{processInline(item.replace(/^\d+\.\s*/, ''))}</li>
          ))}
        </ol>
      );
      return;
    }

    // Bullet list
    if (/^[-•*]\s/.test(trimmed)) {
      const items = trimmed.split(/\n/).filter(l => l.trim());
      elements.push(
        <ul key={blockIdx} className="list-disc list-inside space-y-1 my-2 text-[13px] text-slate-700">
          {items.map((item, i) => (
            <li key={i}>{processInline(item.replace(/^[-•*]\s*/, ''))}</li>
          ))}
        </ul>
      );
      return;
    }

    // Heading (### or ##)
    if (/^#{1,3}\s/.test(trimmed)) {
      const level = (trimmed.match(/^#+/) || [''])[0].length;
      const headingText = trimmed.replace(/^#+\s*/, '');
      const className = level <= 2
        ? 'font-bold text-sm text-slate-900 mt-3 mb-1'
        : 'font-semibold text-[13px] text-slate-800 mt-2 mb-1';
      elements.push(<div key={blockIdx} className={className}>{processInline(headingText)}</div>);
      return;
    }

    // Regular paragraph — handle line breaks within the block
    const lines = trimmed.split('\n');
    elements.push(
      <p key={blockIdx} className="text-[13px] text-slate-700 leading-relaxed my-1.5">
        {lines.map((line, i) => (
          <React.Fragment key={i}>
            {processInline(line)}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    );
  });

  return elements;
}

export function AiChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Track scroll position for "scroll to bottom" button
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setShowScrollDown(!isNearBottom && messages.length > 3);
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send last 20 messages as context
      const history = [...messages, userMessage].slice(-20).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Sorry, I could not generate a response. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ **Connection Error**: Could not reach the AI server. Please make sure the server is running and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-7 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">SortBench AI</h3>
                <p className="text-[10px] text-indigo-200 font-medium">Your sorting algorithm expert</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-[300px] max-h-[50vh] scroll-smooth"
          >
            {/* Welcome message when empty */}
            {messages.length === 0 && (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-indigo-100">
                  <Bot className="w-7 h-7 text-indigo-600" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Hey there! 👋</h4>
                <p className="text-xs text-slate-500 mb-4 max-w-[280px] mx-auto leading-relaxed">
                  I'm SortBench AI — I know everything about this app, all 15 sorting algorithms, Big-O complexity, and more. Ask me anything!
                </p>
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Try asking</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestedQuestion(q)}
                        className="text-[11px] px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all font-medium"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  message.role === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                }`}>
                  {message.role === 'user'
                    ? <User className="w-3.5 h-3.5" />
                    : <Sparkles className="w-3.5 h-3.5" />
                  }
                </div>

                {/* Bubble */}
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                  message.role === 'user'
                    ? 'bg-slate-900 text-white rounded-br-md'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-bl-md'
                }`}>
                  {message.role === 'user' ? (
                    <p className="text-[13px] leading-relaxed">{message.content}</p>
                  ) : (
                    <div className="space-y-0">{renderMarkdown(message.content)}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                    <span className="text-xs text-slate-500 font-medium">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {showScrollDown && (
            <div className="absolute bottom-[68px] left-1/2 -translate-x-1/2">
              <button
                onClick={scrollToBottom}
                className="w-8 h-8 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="flex-shrink-0 border-t border-slate-200 px-3 py-3 bg-white">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about sorting algorithms..."
                disabled={isLoading}
                className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 disabled:opacity-50 transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-sm"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
        title="SortBench AI Assistant"
        className={`fixed bottom-5 right-4 z-50 inline-flex h-13 w-13 items-center justify-center rounded-full shadow-lg ring-1 ring-white/20 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:bottom-7 sm:right-7 ${
          isOpen
            ? 'bg-slate-700 hover:bg-slate-600'
            : 'bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600'
        }`}
        style={{ width: '52px', height: '52px' }}
      >
        {isOpen ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-5.5 w-5.5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-600 animate-pulse" />
          </div>
        )}
      </button>
    </>
  );
}

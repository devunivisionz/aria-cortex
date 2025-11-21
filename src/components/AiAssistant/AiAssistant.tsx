import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Bot,
  Sparkles,
  Paperclip,
  Mic,
  RotateCcw,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  rating?: "up" | "down";
}

interface QuickAction {
  label: string;
  action: string;
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    { label: "📊 Generate Report", action: "Generate a report for me" },
    { label: "🎯 View Targets", action: "Show me my targets" },
    { label: "💡 Get Help", action: "I need help with" },
    { label: "🔍 Search Data", action: "Search for" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand your request. This is a simulated response. You can integrate your actual AI API here.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        text: "Chat cleared. How can I help you?",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  const handleRateMessage = (messageId: string, rating: "up" | "down") => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, rating } : msg))
    );
  };

  return (
    <>
      {/* Floating AI Button with Dark Theme */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
        style={{
          background:
            "linear-gradient(135deg, rgb(4 120 87) 0%, rgb(6 95 70) 100%)",
        }}
        aria-label="Open AI Assistant"
      >
        <div className="relative">
          <Sparkles className="h-7 w-7 text-white" />
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ backgroundColor: "rgb(4 120 87)" }}
            ></span>
            <span
              className="relative inline-flex h-3 w-3 rounded-full"
              style={{ backgroundColor: "rgb(16 185 129)" }}
            ></span>
          </span>
        </div>
      </button>

      {/* Dark Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Right Side Panel - Dark Theme */}
      <div
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-full flex-col bg-black shadow-2xl transition-all duration-300 sm:w-[420px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header - Dark with Teal Accent */}
        <div
          className="relative overflow-hidden border-b border-gray-800"
          style={{
            background:
              "linear-gradient(135deg, rgb(4 120 87) 0%, rgb(6 78 59) 100%)",
          }}
        >
          <div className="relative z-10 flex items-center justify-between p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">AI Assistant</h2>
                <p className="text-xs opacity-80">Powered by Advanced AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
                aria-label="Clear chat"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20"></div>
        </div>

        {/* Quick Actions - Dark Theme */}
        <div className="border-b border-gray-900 bg-gray-950 p-3">
          <p className="mb-2 text-xs font-medium text-gray-400">
            Quick Actions
          </p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleSend(action.action)}
                className="rounded-full border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-300 transition-all hover:border-teal-700 hover:bg-gray-800 hover:text-white"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Container - Dark Theme */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-950 to-black p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`group flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="max-w-[85%]">
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.sender === "user"
                        ? "text-white shadow-lg"
                        : "bg-gray-900 text-gray-100 border border-gray-800 shadow-md"
                    }`}
                    style={
                      message.sender === "user"
                        ? {
                            background:
                              "linear-gradient(135deg, rgb(4 120 87) 0%, rgb(6 95 70) 100%)",
                          }
                        : {}
                    }
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>

                  {/* Message Actions - Dark Theme */}
                  <div
                    className={`mt-1 flex items-center gap-2 px-2 opacity-0 transition-opacity group-hover:opacity-100 ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <button
                      onClick={() => handleCopyMessage(message.text)}
                      className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                      aria-label="Copy"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    {message.sender === "ai" && (
                      <>
                        <button
                          onClick={() => handleRateMessage(message.id, "up")}
                          className={`rounded p-1 ${
                            message.rating === "up"
                              ? "text-teal-500"
                              : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                          }`}
                          aria-label="Like"
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleRateMessage(message.id, "down")}
                          className={`rounded p-1 ${
                            message.rating === "down"
                              ? "text-red-500"
                              : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                          }`}
                          aria-label="Dislike"
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </>
                    )}
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-gray-900 border border-gray-800 px-4 py-3 shadow-md">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-teal-600 [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-teal-600 [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-teal-600"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Container - Dark Theme */}
        <div className="border-t border-gray-800 bg-gray-950 p-4">
          <div className="flex gap-2">
            <button
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-300"
              aria-label="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 resize-none rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`rounded-lg p-2 transition-colors ${
                isRecording
                  ? "bg-red-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
              }`}
              aria-label="Voice input"
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputValue.trim()}
              className="rounded-lg px-4 py-2 text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background:
                  isLoading || !inputValue.trim()
                    ? "rgb(31 41 55)"
                    : "linear-gradient(135deg, rgb(4 120 87) 0%, rgb(6 95 70) 100%)",
              }}
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;

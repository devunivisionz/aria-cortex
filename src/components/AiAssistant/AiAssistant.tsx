import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabase"; // Make sure to create this file
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
  AlertCircle,
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
      text: "Hi! I'm your AI assistant powered by OpenAI. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      label: "📊 Generate Report",
      action: "Generate a detailed sales report for the last quarter",
    },
    {
      label: "🎯 View Targets",
      action: "Show me my current targets and progress",
    },
    { label: "💡 Get Help", action: "I need help with using this platform" },
    { label: "🔍 Search Data", action: "Search for customer information" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to call OpenAI through Supabase Edge Function
  const getAIResponse = async (userMessage: string) => {
    try {
      // Prepare conversation history for context (keeping last 10 messages)
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      // Add the new user message
      conversationHistory.push({
        role: "user",
        content: userMessage,
      });

      // Add context about the user and session (you can customize this)
      const context = {
        userType: "customer", // You can get this from authentication
        department: "general",
        timestamp: new Date().toISOString(),
      };

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("openai-chat", {
        body: {
          messages: conversationHistory,
          context: context,
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error("Failed to get AI response");
      }

      // Check if we have a valid response
      if (data?.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      } else if (data?.error) {
        console.error("OpenAI API error:", data.error);
        throw new Error(data.error.message || "Failed to get AI response");
      } else {
        throw new Error("Unexpected response format from AI");
      }
    } catch (error: any) {
      console.error("Error getting AI response:", error);
      throw error;
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    // Clear any previous errors
    setError(null);

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Get AI response
      const aiResponse = await getAIResponse(messageText);

      // Add AI response to chat
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      // Set error state
      setError(error.message || "Failed to get response. Please try again.");

      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I encountered an error while processing your request. Please try again or check your connection.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
        text: "Chat cleared. How can I help you today?",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
    setError(null);
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here to confirm copy
  };

  const handleRateMessage = async (
    messageId: string,
    rating: "up" | "down"
  ) => {
    // Update local state
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, rating } : msg))
    );

    // Optionally, send rating to your backend for analytics
    try {
      // You can create another Supabase function to store ratings
      await supabase.functions.invoke("store-rating", {
        body: {
          messageId,
          rating,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Failed to store rating:", error);
      // Don't show error to user for rating failures
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // TODO: Implement actual voice recording using Web Speech API
    // This is a placeholder for voice functionality
    if (!isRecording) {
      console.log("Starting voice recording...");
      // Start recording logic here
    } else {
      console.log("Stopping voice recording...");
      // Stop recording and transcribe logic here
    }
  };

  const handleFileAttachment = () => {
    // TODO: Implement file attachment functionality
    console.log("File attachment clicked");
    // You can add file upload logic here
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
                <p className="text-xs opacity-80">Powered by OpenAI</p>
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

        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 p-3 m-3 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

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
                disabled={isLoading}
                className="rounded-full border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-300 transition-all hover:border-teal-700 hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </p>
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

            {/* Loading Animation */}
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
              onClick={handleFileAttachment}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-300"
              aria-label="Attach file"
              disabled={isLoading}
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 resize-none rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleVoiceInput}
              className={`rounded-lg p-2 transition-colors ${
                isRecording
                  ? "bg-red-600 text-white animate-pulse"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
              }`}
              aria-label="Voice input"
              disabled={isLoading}
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

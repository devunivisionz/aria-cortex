// components/AIAssistant.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
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
  ExternalLink,
  Loader2,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  rating?: "up" | "down";
  actions?: Action[];
  data?: any;
  suggestedPrompts?: string[];
}

interface Action {
  type: "navigate" | "create" | "favorite" | "outreach" | "expand";
  label: string;
  payload?: any;
}

interface QuickAction {
  label: string;
  action: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  company_id: string | null;
  company_name: string | null;
  organization_id: string | null;
  organization_name: string | null;
}

const AIAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm Aria, your AI sales intelligence assistant. I can help you find companies, create DNA segments, and analyze your leads. What would you like to do?",
      sender: "ai",
      timestamp: new Date(),
      suggestedPrompts: [
        "Create a new DNA segment",
        "Show me my segments",
        "Find hot leads",
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const quickActions: QuickAction[] = [
    {
      label: "🎯 Create Segment",
      action: "I want to create a new DNA segment",
    },
    {
      label: "📊 Weekly Report",
      action: "Show me this week's performance report",
    },
    {
      label: "🔥 Hot Leads",
      action: "Show me companies with hot timing signals",
    },
    {
      label: "📋 My Segments",
      action: "List all my DNA segments",
    },
  ];

  // Initialize auth on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      console.log("Initializing authentication...");

      try {
        // First, try to restore session from localStorage
        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");

        if (accessToken && refreshToken) {
          console.log("Found tokens in localStorage, restoring session...");

          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Failed to restore session:", error);
            // Clear invalid tokens
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
            localStorage.removeItem("isAuthenticated");
          } else {
            console.log("Session restored successfully");
          }
        }

        // Now check current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.log("Session check result:", {
          hasSession: !!session,
          userId: session?.user?.id,
          error: sessionError,
        });

        if (sessionError) {
          console.error("Session error:", sessionError);
          if (isMounted) {
            setError("Session error. Please log in again.");
            setIsLoadingProfile(false);
            setAuthChecked(true);
          }
          return;
        }

        if (session?.user) {
          console.log("Active session found:", session.user.id);
          if (isMounted) {
            await fetchUserProfile(session.user.id, session.user);
          }
        } else {
          console.log("No active session found");
          if (isMounted) {
            setIsLoadingProfile(false);
            setAuthChecked(true);
          }
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        if (isMounted) {
          setError("Failed to check authentication");
          setIsLoadingProfile(false);
          setAuthChecked(true);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    console.log("Setting up auth listener...");

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      if (event === "SIGNED_IN") {
        if (session?.user) {
          console.log("User signed in:", session.user.id);
          setIsLoadingProfile(true);
          await fetchUserProfile(session.user.id, session.user);
        }
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out");
        setUserProfile(null);
        setIsLoadingProfile(false);
        setAuthChecked(true);
      } else if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed");
        if (session) {
          localStorage.setItem("access_token", session.access_token);
          localStorage.setItem("refresh_token", session.refresh_token);
        }
      } else if (event === "INITIAL_SESSION") {
        // This fires when the auth listener first initializes
        console.log("Initial session event");
        if (session?.user) {
          setIsLoadingProfile(true);
          await fetchUserProfile(session.user.id, session.user);
        } else {
          setIsLoadingProfile(false);
          setAuthChecked(true);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from profiles table
  const fetchUserProfile = async (userId: string, user: any) => {
    try {
      setIsLoadingProfile(true);
      setError(null);

      console.log("Fetching profile for user:", userId);

      // Fetch profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, email, full_name, company_id, company_name, organization_id, organization_name"
        )
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);

        // Fallback: Try to get organization from user metadata
        const organization = user?.user_metadata?.organization;
        console.log("Fallback to user metadata:", organization);

        if (organization?.organizationId) {
          const fallbackProfile: UserProfile = {
            id: userId,
            email: user.email || "",
            full_name:
              user.user_metadata?.name || user.user_metadata?.full_name || "",
            company_id: organization.organizationId,
            company_name: organization.organizationName || null,
            organization_id: organization.organizationId,
            organization_name: organization.organizationName || null,
          };
          setUserProfile(fallbackProfile);
          console.log("Using fallback profile:", fallbackProfile);
        } else {
          // Create a basic profile if nothing exists
          console.warn("No profile or metadata found, creating basic profile");
          const basicProfile: UserProfile = {
            id: userId,
            email: user.email || "",
            full_name:
              user.user_metadata?.name ||
              user.user_metadata?.full_name ||
              "User",
            company_id: null,
            company_name: null,
            organization_id: null,
            organization_name: null,
          };
          setUserProfile(basicProfile);
          setError(
            "Profile incomplete. Please complete your organization setup."
          );
        }
      } else {
        setUserProfile(profile);
        console.log("Profile loaded successfully:", profile);
      }
    } catch (err) {
      console.error("Error in fetchUserProfile:", err);
      setError("Failed to load profile");
    } finally {
      setIsLoadingProfile(false);
      setAuthChecked(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getOrganizationId = (): string | null => {
    if (!userProfile) return null;
    return userProfile.company_id || userProfile.organization_id || null;
  };

  const getAIResponse = async (userMessage: string) => {
    try {
      const organizationId = getOrganizationId();

      if (!organizationId) {
        throw new Error(
          "No organization found. Please complete your profile setup."
        );
      }

      const conversationHistory = messages.slice(-5).map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      console.log("Sending request with:", {
        organizationId,
        userId: userProfile?.id,
      });

      const { data, error } = await supabase.functions.invoke(
        "aria-agent-complete",
        {
          body: {
            message: userMessage,
            context: {
              organizationId: organizationId,
              organizationName:
                userProfile?.company_name ||
                userProfile?.organization_name ||
                "",
              userId: userProfile?.id,
              conversationHistory,
            },
          },
        }
      );

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error("Failed to get AI response");
      }

      return data;
    } catch (error: any) {
      console.error("Error getting AI response:", error);
      throw error;
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    if (!userProfile) {
      setError("Profile not loaded. Please wait or refresh the page.");
      return;
    }

    const organizationId = getOrganizationId();
    if (!organizationId) {
      setError("No organization found. Please complete your profile setup.");
      return;
    }

    setError(null);

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
      const response = await getAIResponse(messageText);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply || "I processed your request.",
        sender: "ai",
        timestamp: new Date(),
        actions: response.actions || [],
        data: response.data,
        suggestedPrompts: response.suggestedPrompts || [],
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      setError(error.message || "Failed to get response. Please try again.");

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I encountered an error. Please try again or rephrase your request.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: Action) => {
    switch (action.type) {
      case "navigate":
        if (action.payload?.url) {
          navigate(`${action.payload.url}`);
          setIsOpen(false);
        }
        break;

      case "expand":
        handleSend(`Show me ${action.payload?.limit || 5} matches`);
        break;

      case "create":
        navigate("/segments/create");
        setIsOpen(false);
        break;

      case "favorite":
        handleSend(`Add these companies to favorites`);
        break;

      case "outreach":
        handleSend(`Start outreach campaign for these companies`);
        break;

      default:
        console.warn("Unknown action type:", action.type);
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
        text: "Chat cleared. What would you like to do?",
        sender: "ai",
        timestamp: new Date(),
        suggestedPrompts: [
          "Create a new segment",
          "Show my segments",
          "Find hot leads",
        ],
      },
    ]);
    setError(null);
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleRateMessage = async (
    messageId: string,
    rating: "up" | "down"
  ) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, rating } : msg))
    );

    try {
      await supabase.functions.invoke("store-rating", {
        body: {
          messageId,
          rating,
          organizationId: getOrganizationId(),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Failed to store rating:", error);
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
  };

  const handleFileAttachment = () => {
    // TODO: Implement file upload
  };

  // Retry loading profile
  const handleRetryProfile = async () => {
    setError(null);
    setIsLoadingProfile(true);
    setAuthChecked(false);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user);
      } else {
        setError("No active session. Please log in.");
        setIsLoadingProfile(false);
        setAuthChecked(true);
      }
    } catch (err) {
      console.error("Retry error:", err);
      setError("Failed to load profile");
      setIsLoadingProfile(false);
      setAuthChecked(true);
    }
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <>
      {/* Floating AI Button */}
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

      {/* Right Side Panel */}
      <div
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-full flex-col bg-black shadow-2xl transition-all duration-300 sm:w-[420px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
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
                <h2 className="text-lg font-semibold">Aria Assistant</h2>
                <p className="text-xs opacity-80">
                  {isLoadingProfile
                    ? "Loading..."
                    : userProfile?.company_name ||
                      userProfile?.organization_name ||
                      "Sales Intelligence AI"}
                </p>
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
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20"></div>
        </div>

        {/* Loading Profile State */}
        {isLoadingProfile && (
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            <span className="mt-3 text-gray-400">Loading your profile...</span>
            <button
              onClick={() => {
                setIsLoadingProfile(false);
                setAuthChecked(true);
              }}
              className="mt-4 text-xs text-gray-500 hover:text-gray-400 underline"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Not Logged In */}
        {!isLoadingProfile && authChecked && !userProfile && (
          <div className="bg-yellow-900/20 border border-yellow-800 p-4 m-3 rounded-lg">
            <div className="flex items-start gap-2 text-yellow-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Login Required</p>
                <p className="text-xs mt-1 text-yellow-500">
                  Please log in to use the AI assistant.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleLoginRedirect}
                    className="text-xs bg-teal-700 hover:bg-teal-600 text-white px-4 py-2 rounded font-medium"
                  >
                    Go to Login
                  </button>
                  <button
                    onClick={handleRetryProfile}
                    className="text-xs bg-yellow-800/50 hover:bg-yellow-800 px-3 py-2 rounded"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Organization Warning */}
        {!isLoadingProfile && userProfile && !getOrganizationId() && (
          <div className="bg-yellow-900/20 border border-yellow-800 p-4 m-3 rounded-lg">
            <div className="flex items-start gap-2 text-yellow-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Organization Required</p>
                <p className="text-xs mt-1 text-yellow-500">
                  Please complete your profile setup to use the AI assistant.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 p-3 m-3 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm flex-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-gray-900 border border-gray-800 p-2 m-3 rounded-lg text-xs text-gray-500 font-mono">
            <div>Loading: {isLoadingProfile ? "Yes" : "No"}</div>
            <div>Auth Checked: {authChecked ? "Yes" : "No"}</div>
            <div>Profile Loaded: {userProfile ? "Yes" : "No"}</div>
            <div>User ID: {userProfile?.id || "N/A"}</div>
            <div>Company ID: {userProfile?.company_id || "N/A"}</div>
            <div>Org ID: {userProfile?.organization_id || "N/A"}</div>
            <div>Email: {userProfile?.email || "N/A"}</div>
          </div>
        )}

        {/* Quick Actions */}
        {!isLoadingProfile && getOrganizationId() && (
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
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-950 to-black p-4">
          {!isLoadingProfile && (
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

                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-700/50 flex flex-wrap gap-2">
                          {message.actions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAction(action)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-medium transition-colors border border-gray-700"
                            >
                              {action.type === "navigate" && (
                                <ExternalLink className="h-3 w-3" />
                              )}
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {message.data && (
                        <div className="mt-3 pt-3 border-t border-gray-700/50">
                          <div className="text-xs text-gray-400 space-y-1">
                            {message.data.segmentName && (
                              <div>
                                <span className="font-medium">Segment:</span>{" "}
                                {message.data.segmentName}
                              </div>
                            )}
                            {message.data.matchCount !== undefined && (
                              <div>
                                <span className="font-medium">Matches:</span>{" "}
                                {message.data.matchCount}
                              </div>
                            )}
                            {message.data.avgFit && (
                              <div>
                                <span className="font-medium">Avg Fit:</span>{" "}
                                {message.data.avgFit}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {message.suggestedPrompts &&
                      message.suggestedPrompts.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {message.suggestedPrompts.map((prompt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(prompt)}
                              disabled={isLoading || !getOrganizationId()}
                              className="text-xs px-2 py-1 bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-gray-200 rounded border border-gray-700/50 transition-colors disabled:opacity-50"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      )}

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
                            onClick={() =>
                              handleRateMessage(message.id, "down")
                            }
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
          )}
        </div>

        {/* Input Container */}
        <div className="border-t border-gray-800 bg-gray-950 p-4">
          <div className="flex gap-2">
            <button
              onClick={handleFileAttachment}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Attach file"
              disabled={isLoading || !getOrganizationId()}
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isLoadingProfile
                  ? "Loading..."
                  : !userProfile
                  ? "Please log in..."
                  : !getOrganizationId()
                  ? "Please complete profile setup..."
                  : "Ask Aria anything..."
              }
              className="flex-1 resize-none rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              rows={1}
              disabled={isLoading || isLoadingProfile || !getOrganizationId()}
            />
            <button
              onClick={handleVoiceInput}
              className={`rounded-lg p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? "bg-red-600 text-white animate-pulse"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
              }`}
              aria-label="Voice input"
              disabled={isLoading || !getOrganizationId()}
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={
                isLoading ||
                !inputValue.trim() ||
                isLoadingProfile ||
                !getOrganizationId()
              }
              className="rounded-lg px-4 py-2 text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background:
                  isLoading || !inputValue.trim() || !getOrganizationId()
                    ? "rgb(31 41 55)"
                    : "linear-gradient(135deg, rgb(4 120 87) 0%, rgb(6 95 70) 100%)",
              }}
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
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

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Settings,
  MessageCircle,
  PenTool,
  ArrowLeft,
  LogOut,
  Star,
  X,
  Send,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Calendar,
  Lightbulb,
  Check,
  XCircle,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import "./App.css";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function App() {
  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emails, setEmails] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [loading, setLoading] = useState(false);

  // View States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showInbox, setShowInbox] = useState(true);
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [prompts, setPrompts] = useState([]);

  // Chat State
  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Derived State
  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || null;

  // --- HANDLERS ---
  const handleLogin = async () => {
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/reset-db");
      const res = await axios.get("http://127.0.0.1:8000/emails/");
      // Initialize isStarred property since backend doesn't have it yet
      const initializedEmails = res.data.map((e) => ({
        ...e,
        isStarred: false,
      }));
      setEmails(initializedEmails);
      setIsLoggedIn(true);
    } catch (error) {
      console.error(error);
      alert("Backend error. Is python running?");
    }
    setLoading(false);
  };

  const processEmails = async () => {
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/process-emails/");
      // Refresh data
      const res = await axios.get("http://127.0.0.1:8000/emails/");
      // Preserve local star state when refreshing from backend
      setEmails((prevEmails) => {
        return res.data.map((newEmail) => {
          const existing = prevEmails.find((e) => e.id === newEmail.id);
          return {
            ...newEmail,
            isStarred: existing ? existing.isStarred : false,
          };
        });
      });
    } catch (e) {
      alert("Error processing");
    }
    setLoading(false);
  };

  const handleChatSubmit = async () => {
    if (!chatQuery.trim() || !selectedEmail) return;

    const currentQuery = chatQuery;
    setChatLoading(true);
    setChatQuery("");

    setChatHistory((prev) => [...prev, { q: currentQuery, a: "" }]);

    try {
      const historyPayload = chatHistory.flatMap((msg) => [
        { role: "user", content: msg.q },
        { role: "assistant", content: msg.a || "" },
      ]);

      const res = await axios.post(
        `http://127.0.0.1:8000/emails/${selectedEmail.id}/chat`,
        {
          query: currentQuery,
          history: historyPayload,
        }
      );

      setChatHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          q: currentQuery,
          a: res.data.response,
        };
        return newHistory;
      });
    } catch (e) {
      console.error(e);
      alert("Chat Failed");
      setChatHistory((prev) => prev.slice(0, -1));
    }
    setChatLoading(false);
  };

  // --- FEATURE HANDLERS ---
  const deleteEmail = async () => {
    if (!selectedEmail) return;
    if (confirm("Permanently delete this email?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/emails/${selectedEmail.id}`);
        setEmails(emails.filter((e) => e.id !== selectedEmail.id));
        setSelectedEmailId(null);
        setIsChatOpen(false);
        setShowInbox(true);
      } catch (e) {
        alert("Failed to delete");
      }
    }
  };

  // Fixed Star Logic
  const toggleStar = () => {
    if (!selectedEmail) return;
    setEmails((prevEmails) =>
      prevEmails.map((e) =>
        e.id === selectedEmail.id ? { ...e, isStarred: !e.isStarred } : e
      )
    );
  };

  const saveAllPrompts = async () => {
    try {
      await Promise.all(
        prompts.map((p) =>
          axios.put(`http://127.0.0.1:8000/prompts/${p.id}`, { ...p })
        )
      );
      setShowPrompts(false);
      alert("Brain Updated! Re-processing...");
      await processEmails();
    } catch (e) {
      alert("Error saving");
    }
  };

  const handleSuggestion = (suggestion, accepted) => {
    if (accepted) {
      alert(`!!Action Taken:\n"${suggestion}" has been executed.`);
      removeSuggestionFromState(suggestion);
    } else {
      removeSuggestionFromState(suggestion);
    }
  };

  const removeSuggestionFromState = (suggestionToRemove) => {
    setEmails((prevEmails) =>
      prevEmails.map((email) => {
        if (email.id === selectedEmail.id) {
          const newActionItems = { ...email.action_items };
          if (newActionItems.suggestions) {
            newActionItems.suggestions = newActionItems.suggestions.filter(
              (s) => s !== suggestionToRemove
            );
          }
          return { ...email, action_items: newActionItems };
        }
        return email;
      })
    );
  };

  const filteredEmails = emails.filter(
    (e) =>
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.sender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- LOGIN VIEW ---
  if (!isLoggedIn) {
    return (
      <div className="login-wrapper">
        <div className="animate-in fade-in zoom-in duration-700 text-center px-4 w-full max-w-md">
          <h1 className="font-serif text-5xl mb-6 text-primary tracking-tight">
            Email Productivity Agent
          </h1>
          <p className="text-muted-foreground text-lg mb-8 font-sans font-light">
            Your Personal Inbox Assisstant- Zero clutter. Maximum focus.
          </p>

          <div className="space-y-3 mb-8 text-left">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                defaultValue="demo@user.com"
                className="w-full p-3 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-none font-sans"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                defaultValue="password123"
                className="w-full p-3 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary outline-none font-sans"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium hover:opacity-90 transition-all shadow-lg text-lg"
          >
            {loading ? "Setting up Inbox..." : "Login & Sync"}
          </button>
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="flex h-screen w-full bg-background font-serif text-foreground overflow-hidden">
      {/* SIDEBAR */}
      {showInbox && (
        <aside className="w-80 flex-shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col animate-in slide-in-from-left duration-300">
          <div className="p-4 border-b border-sidebar-border flex items-center justify-between sticky top-0 bg-sidebar z-10">
            <h1 className="text-xl font-semibold tracking-tight">Inbox</h1>
          </div>

          <div className="p-4 pt-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background rounded-md border border-input pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring font-sans"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedEmailId(email.id);
                  setIsChatOpen(false);
                  setShowInbox(true);
                  setIsDraftOpen(false);
                  setChatHistory([]);
                }}
                className={cn(
                  "flex flex-col gap-1 p-4 border-b border-sidebar-border cursor-pointer transition-colors hover:bg-sidebar-accent/50 relative",
                  selectedEmailId === email.id ? "bg-sidebar-accent" : ""
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn("font-medium text-sm font-sans", "font-bold")}
                  >
                    {email.sender.split("@")[0]}
                  </span>
                  <span className="text-xs text-muted-foreground font-sans">
                    {new Date(email.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm mb-1 font-sans font-medium truncate pr-4">
                  {email.subject}
                </div>
                <span
                  className={cn(
                    "inline-flex px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider font-sans w-fit",
                    email.category === "Work"
                      ? "bg-blue-50/50 border-blue-200 text-blue-700"
                      : email.category === "Spam"
                      ? "bg-red-50/50 border-red-200 text-red-700"
                      : "bg-sidebar-accent border-sidebar-border text-muted-foreground"
                  )}
                >
                  {email.category}
                </span>
                {email.isStarred && (
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 absolute bottom-4 right-4" />
                )}
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative transition-all duration-500">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/95 backdrop-blur sticky top-0 z-10">
          {/* LEFT SIDE: Only Star and Trash */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <button
              onClick={toggleStar}
              className="hover:text-yellow-500 transition-colors p-2 rounded-full hover:bg-sidebar"
              title="Star"
              disabled={!selectedEmail}
            >
              <Star
                className={cn(
                  "w-4 h-4",
                  selectedEmail?.isStarred
                    ? "fill-yellow-400 text-yellow-400"
                    : ""
                )}
              />
            </button>
            <button
              onClick={deleteEmail}
              className="hover:text-red-500 transition-colors p-2 rounded-full hover:bg-sidebar"
              title="Delete"
              disabled={!selectedEmail}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* RIGHT SIDE: Configure & Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowPrompts(true);
                axios
                  .get("http://127.0.0.1:8000/prompts/")
                  .then((r) => setPrompts(r.data));
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm font-sans"
            >
              <Settings className="w-4 h-4" />
              <span>Configure Brain</span>
            </button>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-input hover:bg-sidebar transition-colors text-sm font-medium font-sans"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {selectedEmail ? (
            <>
              {/* Email Content */}
              <div
                className={cn(
                  "flex-1 overflow-y-auto p-8 transition-all duration-500 ease-in-out",
                  // Resizing logic: If Chat OR Action Sidebar (default) is visible, share space
                  isChatOpen
                    ? "w-1/2 border-r border-border pr-6"
                    : "flex-1 pr-0"
                )}
              >
                {!showInbox && (
                  <button
                    onClick={() => {
                      setIsChatOpen(false);
                      setShowInbox(true);
                    }}
                    className="mb-6 flex items-center text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-sans"
                  >
                    <ArrowLeft className="w-3 h-3 mr-2" /> Back to Inbox
                  </button>
                )}

                <div className="mb-8 pb-6 border-b border-border">
                  <div className="flex justify-between items-start mb-2">
                    <h1 className="text-3xl font-serif font-medium leading-tight">
                      {selectedEmail.subject}
                    </h1>
                    {selectedEmail.isStarred && (
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg font-serif border border-border">
                        {selectedEmail.sender[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-sm font-sans">
                          {selectedEmail.sender}
                        </div>
                        <div className="text-xs text-muted-foreground font-sans">
                          to me
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-sans">
                      {new Date(selectedEmail.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="prose max-w-none font-serif leading-loose text-foreground/90 whitespace-pre-wrap text-lg">
                  {selectedEmail.body}
                </div>

                {/* Buttons */}
                {!isChatOpen && (
                  <div className="mt-12 pt-6 border-t border-border flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setIsChatOpen(true);
                        setShowInbox(false);
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-medium shadow-sm font-sans"
                    >
                      <MessageCircle className="w-4 h-4" /> Talk to Agent
                    </button>
                    {!["spam", "newsletter"].includes(
                      selectedEmail.category.toLowerCase()
                    ) && (
                      <button
                        onClick={() => setIsDraftOpen(!isDraftOpen)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 transition-all text-sm font-medium shadow-sm font-sans"
                      >
                        <PenTool className="w-4 h-4" />{" "}
                        {isDraftOpen ? "Hide Draft" : "Draft Response"}
                      </button>
                    )}
                  </div>
                )}

                {/* Draft Editor */}
                {isDraftOpen && !isChatOpen && (
                  <div className="mt-8 p-6 border border-border rounded-xl bg-sidebar/50 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-serif font-medium text-lg">
                        Draft Reply
                      </h3>
                      <button
                        onClick={processEmails}
                        disabled={loading}
                        className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <RefreshCw
                          className={cn(
                            "w-3 h-3",
                            loading ? "animate-spin" : ""
                          )}
                        />
                        {loading ? "Generating..." : "Regenerate"}
                      </button>
                    </div>
                    <textarea
                      className="w-full h-48 p-4 rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring font-serif leading-relaxed"
                      defaultValue={
                        selectedEmail.suggested_reply ||
                        "AI is generating draft..."
                      }
                      key={selectedEmail.suggested_reply}
                    />
                    <div className="flex justify-end mt-4 gap-2">
                      <button
                        onClick={() => setIsDraftOpen(false)}
                        className="px-4 py-2 rounded-md border border-input hover:bg-secondary transition-colors text-sm font-sans"
                      >
                        Discard
                      </button>
                      <button
                        className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-sans"
                        onClick={() => alert("Sent!")}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
                <div className="h-12"></div>
              </div>

              {/* === RIGHT SIDEBAR (ACTIONS & SUGGESTIONS) === */}
              {!isChatOpen && (
                <div className="w-80 bg-sidebar/30 border-l border-border flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto">
                  <div className="p-6 border-b border-border bg-sidebar/50 backdrop-blur sticky top-0 z-10">
                    <h3 className="font-serif font-medium text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      ACTIONS
                    </h3>
                  </div>

                  <div className="p-6 space-y-8">
                    {/* 1. Tasks Section */}
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 font-sans flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Detected Tasks
                      </h4>
                      {selectedEmail.action_items?.tasks?.length > 0 ? (
                        <ul className="space-y-3">
                          {selectedEmail.action_items.tasks.map((task, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 text-sm group"
                            >
                              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0 group-hover:scale-125 transition-transform" />
                              <span className="text-foreground/90 leading-relaxed">
                                {task}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No specific tasks detected.
                        </p>
                      )}
                    </div>

                    {/* 2. Suggestions Section */}
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 font-sans flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Suggested Follow-ups
                      </h4>
                      {selectedEmail.action_items?.suggestions?.length > 0 ? (
                        <div className="space-y-3">
                          {selectedEmail.action_items.suggestions.map(
                            (suggestion, idx) => (
                              <div
                                key={idx}
                                className="bg-background border border-input rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                              >
                                <p className="text-sm text-foreground/90 mb-3 font-medium leading-relaxed">
                                  {suggestion}
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      handleSuggestion(suggestion, true)
                                    }
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg hover:opacity-90 transition-all"
                                  >
                                    <Check className="w-3 h-3" /> Accept
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleSuggestion(suggestion, false)
                                    }
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-secondary text-secondary-foreground border border-border text-xs rounded-lg hover:bg-secondary/80 transition-all"
                                  >
                                    <XCircle className="w-3 h-3" /> Dismiss
                                  </button>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No suggestions available.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Sidebar (Existing) */}
              {isChatOpen && (
                <div className="w-[450px] bg-sidebar/50 border-l border-border flex flex-col animate-in slide-in-from-right-10 duration-300 shadow-xl z-40">
                  <div className="p-4 border-b border-border flex items-center justify-between bg-sidebar/80 backdrop-blur">
                    <h3 className="font-serif font-medium">AI Assistant</h3>
                    <button
                      onClick={() => {
                        setIsChatOpen(false);
                        setShowInbox(true);
                      }}
                      className="p-1 hover:bg-secondary rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-6">
                    {chatHistory.length === 0 && (
                      <div className="text-center text-muted-foreground text-sm mt-10 font-sans italic">
                        Ask me to summarize or draft a reply...
                      </div>
                    )}
                    {chatHistory.map((msg, i) => (
                      <div key={i} className="flex flex-col gap-4">
                        {/* User Message */}
                        <div className="flex justify-end">
                          <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-br-sm max-w-[85%] text-sm font-sans shadow-sm">
                            {msg.q}
                          </div>
                        </div>
                        {/* AI Message */}
                        {msg.a ? (
                          <div className="flex justify-start">
                            <div className="bg-background border border-border p-3 rounded-2xl rounded-bl-sm max-w-[85%] text-sm font-sans shadow-sm leading-relaxed">
                              {msg.a}
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-start">
                            <div className="text-xs text-muted-foreground animate-pulse pl-2 font-sans">
                              Generating...
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-border bg-background/50 backdrop-blur">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ask a question..."
                        value={chatQuery}
                        onChange={(e) => setChatQuery(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleChatSubmit()
                        }
                        className="w-full bg-background border border-input rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring shadow-sm font-sans"
                      />
                      <button
                        onClick={handleChatSubmit}
                        className="absolute right-1.5 top-1.5 p-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground font-serif italic">
              Select an email to read
            </div>
          )}
        </div>
      </main>

      {showPrompts && (
        <div
          className="fixed inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowPrompts(false)}
        >
          <div
            className="bg-background w-[600px] max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl border border-border p-6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <h2 className="text-xl font-serif font-medium">System Prompts</h2>
              <button onClick={() => setShowPrompts(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto p-1">
              {prompts.map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground font-sans">
                      {p.prompt_type}
                    </label>
                  </div>
                  <textarea
                    className="w-full p-4 border border-input rounded-xl text-sm h-24 bg-sidebar font-sans focus:bg-background focus:ring-1 focus:ring-ring outline-none resize-none"
                    defaultValue={p.content}
                    onChange={(e) => {
                      const newP = [...prompts];
                      newP[i].content = e.target.value;
                      setPrompts(newP);
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="pt-6 mt-4 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setShowPrompts(false)}
                className="px-4 py-2 rounded-md border border-input text-sm font-medium hover:bg-sidebar transition-colors"
              >
                Discard
              </button>
              <button
                onClick={saveAllPrompts}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

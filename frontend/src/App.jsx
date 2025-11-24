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
  Plus,
  FileText,
  Save,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import "./App.css"; // Styles imported normally

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function App() {
  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ username: "", password: "" });

  const [emails, setEmails] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [viewMode, setViewMode] = useState("inbox");
  const [showInbox, setShowInbox] = useState(true);
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [prompts, setPrompts] = useState([]);

  const [composeData, setComposeData] = useState({
    to: "",
    subject: "",
    instructions: "",
    body: "",
  });
  const [composeLoading, setComposeLoading] = useState(false);

  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const selectedItem =
    viewMode === "inbox"
      ? emails.find((e) => e.id === selectedEmailId)
      : drafts.find((d) => d.id === selectedEmailId);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/reset-db");
      await refreshData();
      setIsLoggedIn(true);
    } catch (error) {
      alert("Backend error. Is python running?");
      console.error(error);
    }
    setLoading(false);
  };

  const refreshData = async () => {
    try {
      const resEmails = await axios.get("http://127.0.0.1:8000/emails/");
      const resDrafts = await axios.get("http://127.0.0.1:8000/drafts/");
      setEmails(resEmails.data.map((e) => ({ ...e, isStarred: false })));
      setDrafts(resDrafts.data);
    } catch (e) {
      console.error("Failed to refresh data", e);
    }
  };

  const processEmails = async () => {
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/process-emails/");
      await refreshData();
    } catch (e) {
      alert("Error processing");
    }
    setLoading(false);
  };

  const handleGenerateDraft = async () => {
    if (!composeData.instructions)
      return alert("Please enter instructions for the AI.");
    setComposeLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/drafts/generate", {
        recipient: composeData.to,
        subject: composeData.subject,
        instructions: composeData.instructions,
      });
      setComposeData((prev) => ({ ...prev, body: res.data.body }));
    } catch (e) {
      alert("Generation Failed");
    }
    setComposeLoading(false);
  };

  const handleSaveNewDraft = async (isSend = false) => {
    try {
      await axios.post("http://127.0.0.1:8000/drafts/", {
        recipient: composeData.to,
        subject: composeData.subject,
        body: composeData.body,
      });

      if (isSend) {
        alert("Email Sent Successfully!");
      } else {
        alert("Draft Saved to 'Drafts' folder.");
      }

      setShowCompose(false);
      setComposeData({ to: "", subject: "", instructions: "", body: "" });
      refreshData();
    } catch (e) {
      alert("Failed to save draft");
    }
  };

  const handleSaveReplyDraft = async (content) => {
    if (!selectedItem) return;
    try {
      await axios.put(`http://127.0.0.1:8000/emails/${selectedItem.id}/draft`, {
        content,
      });

      await axios.post("http://127.0.0.1:8000/drafts/", {
        recipient: selectedItem.sender,
        subject: `Re: ${selectedItem.subject}`,
        body: content,
      });

      alert("Draft saved to 'Drafts' folder!");
      refreshData();

      setEmails((prev) =>
        prev.map((e) =>
          e.id === selectedItem.id ? { ...e, suggested_reply: content } : e
        )
      );
    } catch (e) {
      console.error(e);
      alert("Failed to save");
    }
  };

  const handleChatSubmit = async () => {
    if (!chatQuery.trim() || !selectedItem) return;
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
        `http://127.0.0.1:8000/emails/${selectedItem.id}/chat`,
        { query: currentQuery, history: historyPayload }
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
      setChatHistory((prev) => prev.slice(0, -1));
      alert("Chat failed");
    }
    setChatLoading(false);
  };

  const toggleStar = () => {
    if (!selectedItem) return;
    setEmails((prev) =>
      prev.map((e) =>
        e.id === selectedItem.id ? { ...e, isStarred: !e.isStarred } : e
      )
    );
  };

  const deleteEmail = async () => {
    if (!selectedItem) return;
    if (confirm("Delete?")) {
      await axios.delete(`http://127.0.0.1:8000/emails/${selectedItem.id}`);
      setEmails((prev) => prev.filter((e) => e.id !== selectedItem.id));
      setSelectedEmailId(null);
    }
  };

  const handleSuggestion = (suggestion, accepted) => {
    if (accepted) alert(`✅ Action Taken: "${suggestion}" executed.`);

    setEmails((prev) =>
      prev.map((email) => {
        if (email.id !== selectedItem.id) return email;
        const currentSuggestions = email.action_items?.suggestions || [];
        const newSuggestions = currentSuggestions.filter(
          (s) => s !== suggestion
        );
        return {
          ...email,
          action_items: {
            ...email.action_items,
            suggestions: newSuggestions,
          },
        };
      })
    );
  };

  const filteredList =
    viewMode === "inbox"
      ? emails.filter(
          (e) =>
            e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : drafts.filter((d) =>
          d.subject.toLowerCase().includes(searchQuery.toLowerCase())
        );

  if (!isLoggedIn) {
    return (
      <div className="login-wrapper bg-background text-foreground flex flex-col items-center justify-center min-h-screen">
        <div className="animate-in fade-in zoom-in duration-700 flex flex-col items-center px-4 w-full max-w-sm">
          <h1 className="font-serif text-5xl mb-6 text-primary tracking-tight">
            Inbox Manager
          </h1>
          <p className="text-muted-foreground text-lg mb-8 font-sans font-light text-center">
            Zero Clutter, Maximum Efficiency
          </p>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
            <input
              type="text"
              placeholder="Username"
              className="w-full p-4 rounded-xl border border-input bg-card font-sans text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={loginCreds.username}
              onChange={(e) =>
                setLoginCreds({ ...loginCreds, username: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-4 rounded-xl border border-input bg-card font-sans text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={loginCreds.password}
              onChange={(e) =>
                setLoginCreds({ ...loginCreds, password: e.target.value })
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium hover:opacity-90 transition-all shadow-lg text-lg mt-2"
            >
              {loading ? "Syncing Inbox..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background font-serif text-foreground overflow-hidden">
      {/* SIDEBAR */}
      {showInbox && (
        <aside className="w-80 flex-shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col animate-in slide-in-from-left duration-300">
          <div className="p-4 border-b border-sidebar-border sticky top-0 bg-sidebar z-10">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-semibold tracking-tight">
                {viewMode === "inbox" ? "Inbox" : "Drafts"}
              </h1>
              <button
                onClick={() => setShowCompose(true)}
                className="p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-transform hover:scale-105"
                title="Compose New"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => {
                  setViewMode("inbox");
                  setSelectedEmailId(null);
                }}
                className={cn(
                  "flex-1 py-1 text-xs font-sans border rounded transition-colors",
                  viewMode === "inbox"
                    ? "bg-sidebar-accent font-bold"
                    : "hover:bg-sidebar-accent/50"
                )}
              >
                Inbox
              </button>
              <button
                onClick={() => {
                  setViewMode("drafts");
                  setSelectedEmailId(null);
                }}
                className={cn(
                  "flex-1 py-1 text-xs font-sans border rounded transition-colors",
                  viewMode === "drafts"
                    ? "bg-sidebar-accent font-bold"
                    : "hover:bg-sidebar-accent/50"
                )}
              >
                Drafts
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={
                  viewMode === "inbox" ? "Search emails..." : "Search drafts..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background rounded-md border border-input pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring font-sans"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredList.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedEmailId(item.id);
                  setIsChatOpen(false);
                  setShowInbox(true);
                  setIsDraftOpen(false);
                }}
                className={cn(
                  "flex flex-col gap-1 p-4 border-b border-sidebar-border cursor-pointer transition-colors hover:bg-sidebar-accent/50 relative",
                  selectedEmailId === item.id ? "bg-sidebar-accent" : ""
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm font-sans truncate max-w-[70%]">
                    {/* Handle different models for Inbox vs Drafts */}
                    {viewMode === "inbox"
                      ? item.sender
                        ? item.sender.split("@")[0]
                        : "Unknown"
                      : `To: ${item.recipient}`}
                  </span>
                  <span className="text-xs text-muted-foreground font-sans whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="text-sm mb-1 font-sans font-medium truncate pr-4">
                  {item.subject}
                </div>
                {viewMode === "inbox" && (
                  <span
                    className={cn(
                      "inline-flex px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider font-sans w-fit",
                      item.category === "Work"
                        ? "bg-blue-50/50 border-blue-200 text-blue-700"
                        : item.category === "Spam"
                        ? "bg-red-50/50 border-red-200 text-red-700"
                        : item.category === "Urgent"
                        ? "bg-orange-50/50 border-orange-200 text-orange-700"
                        : "bg-sidebar-accent border-sidebar-border text-muted-foreground"
                    )}
                  >
                    {item.category}
                  </span>
                )}
                {/* Drafts don't have stars usually, but if you add it to model later: */}
                {viewMode === "inbox" && item.isStarred && (
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 absolute bottom-4 right-4" />
                )}
              </div>
            ))}
            {filteredList.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm font-sans">
                {viewMode === "inbox" ? "No emails found." : "No drafts found."}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative transition-all duration-500">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/95 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-2 text-muted-foreground">
            <button
              onClick={toggleStar}
              className="hover:text-yellow-500 p-2 rounded-full hover:bg-sidebar transition-colors"
              disabled={!selectedItem || viewMode === "drafts"}
            >
              <Star
                className={cn(
                  "w-4 h-4",
                  selectedItem?.isStarred
                    ? "fill-yellow-400 text-yellow-400"
                    : ""
                )}
              />
            </button>
            <button
              onClick={deleteEmail}
              className="hover:text-red-500 p-2 rounded-full hover:bg-sidebar transition-colors"
              disabled={!selectedItem}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowPrompts(true);
                axios
                  .get("http://127.0.0.1:8000/prompts/")
                  .then((r) => setPrompts(r.data));
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium font-sans hover:opacity-90"
            >
              <Settings className="w-4 h-4" />
              <span>Brain</span>
            </button>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-input hover:bg-sidebar text-sm font-medium font-sans transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {selectedItem ? (
            <>
              <div
                className={cn(
                  "flex-1 overflow-y-auto p-8 transition-all duration-500 ease-in-out scroll-smooth",
                  isChatOpen
                    ? "w-1/2 border-r border-border pr-6"
                    : "flex-1 pr-0"
                )}
              >
                {!showInbox && (
                  <button
                    onClick={() => setShowInbox(true)}
                    className="mb-6 flex items-center text-xs font-bold text-muted-foreground hover:text-primary uppercase tracking-widest font-sans"
                  >
                    <ArrowLeft className="w-3 h-3 mr-2" /> Back
                  </button>
                )}

                <div className="mb-8 pb-6 border-b border-border">
                  <div className="flex justify-between items-start mb-2">
                    <h1 className="text-3xl font-serif font-medium leading-tight">
                      {selectedItem.subject || "(No Subject)"}
                    </h1>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm font-sans">
                      {viewMode === "inbox"
                        ? `From: ${selectedItem.sender}`
                        : `To: ${selectedItem.recipient}`}
                    </div>
                    <div className="text-xs text-muted-foreground font-sans">
                      {new Date(selectedItem.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="prose max-w-none font-serif leading-loose text-foreground/90 whitespace-pre-wrap text-lg">
                  {selectedItem.body}
                </div>

                {/* Actions (Only for Inbox) */}
                {viewMode === "inbox" && !isChatOpen && (
                  <div className="mt-12 pt-6 border-t border-border flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setIsChatOpen(true);
                        setShowInbox(false);
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 text-sm font-medium font-sans shadow-md"
                    >
                      <MessageCircle className="w-4 h-4" /> Talk to Agent
                    </button>
                    {!["spam", "newsletter"].includes(
                      selectedItem.category?.toLowerCase() || ""
                    ) && (
                      <button
                        onClick={() => setIsDraftOpen(!isDraftOpen)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 text-sm font-medium font-sans shadow-sm"
                      >
                        <PenTool className="w-4 h-4" />{" "}
                        {isDraftOpen ? "Hide Draft" : "Draft Response"}
                      </button>
                    )}
                  </div>
                )}

                {/* Draft Editor (For Replies) */}
                {isDraftOpen && !isChatOpen && viewMode === "inbox" && (
                  <div className="mt-8 p-6 border border-border rounded-xl bg-sidebar/30 animate-in fade-in slide-in-from-bottom-4 shadow-inner">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-serif font-medium text-lg">
                        Draft Reply
                      </h3>
                      <button
                        onClick={processEmails}
                        disabled={loading}
                        className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary"
                      >
                        <RefreshCw
                          className={cn(
                            "w-3 h-3",
                            loading ? "animate-spin" : ""
                          )}
                        />{" "}
                        Regenerate
                      </button>
                    </div>

                    <div className="space-y-2 mb-2">
                      <div className="p-3 border border-input rounded-md bg-background font-sans text-sm text-muted-foreground flex gap-2">
                        <span className="font-bold text-foreground">To:</span>{" "}
                        {selectedItem.sender}
                      </div>
                      <div className="p-3 border border-input rounded-md bg-background font-sans text-sm text-muted-foreground flex gap-2">
                        <span className="font-bold text-foreground">
                          Subject:
                        </span>{" "}
                        Re: {selectedItem.subject}
                      </div>
                    </div>

                    <textarea
                      id="reply-editor"
                      className="w-full h-48 p-3 rounded-md border border-input bg-background resize-none focus:outline-none font-serif leading-relaxed"
                      defaultValue={
                        selectedItem.suggested_reply || "AI generating..."
                      }
                      key={selectedItem.suggested_reply}
                    />
                    <div className="flex justify-end mt-4 gap-2">
                      <button
                        onClick={() => {
                          const content =
                            document.getElementById("reply-editor").value;
                          handleSaveReplyDraft(content);
                        }}
                        className="px-4 py-2 rounded-md border border-input hover:bg-secondary text-sm font-sans flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" /> Save Draft
                      </button>
                      <button
                        className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-sm font-sans flex items-center gap-2"
                        onClick={() => {
                          alert("Email Sent Successfully!");
                          setIsDraftOpen(false);
                        }}
                      >
                        <Send className="w-3 h-3" /> Send
                      </button>
                    </div>
                  </div>
                )}
                <div className="h-12"></div>
              </div>

              {viewMode === "inbox" && !isChatOpen && (
                <div className="w-80 bg-sidebar/30 border-l border-border flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto">
                  <div className="p-6 border-b border-border bg-sidebar/50 backdrop-blur sticky top-0 z-10">
                    <h3 className="font-serif font-medium text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" /> TASK
                      MANAGER
                    </h3>
                  </div>
                  <div className="p-6 space-y-8">
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 font-sans flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Tasks
                      </h4>
                      {selectedItem.action_items?.tasks?.length > 0 ? (
                        <ul className="space-y-3">
                          {selectedItem.action_items.tasks.map((t, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-3 text-sm"
                            >
                              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              <span className="text-foreground/90">{t}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No tasks.
                        </p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 font-sans flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Follow-ups
                      </h4>
                      {selectedItem.action_items?.suggestions?.length > 0 ? (
                        <div className="space-y-3">
                          {selectedItem.action_items.suggestions.map((s, i) => (
                            <div
                              key={i}
                              className="bg-background border border-input rounded-xl p-4 shadow-sm transition-all duration-300"
                            >
                              <p className="text-sm mb-3">{s}</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSuggestion(s, true)}
                                  className="flex-1 py-1 bg-primary text-primary-foreground text-xs rounded hover:opacity-90"
                                >
                                  <Check className="w-3 h-3 inline" /> Accept
                                </button>
                                <button
                                  onClick={() => handleSuggestion(s, false)}
                                  className="flex-1 py-1 bg-secondary text-xs rounded border hover:bg-secondary/80"
                                >
                                  <XCircle className="w-3 h-3 inline" /> Dismiss
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No suggestions.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Sidebar */}
              {isChatOpen && (
                <div className="w-[450px] bg-sidebar/50 border-l border-border flex flex-col animate-in slide-in-from-right-10 duration-300 shadow-xl z-40">
                  <div className="p-4 border-b border-border flex items-center justify-between bg-sidebar/80 backdrop-blur">
                    <h3 className="font-serif font-medium">AI Assistant</h3>
                    <button onClick={() => setIsChatOpen(false)}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto space-y-6">
                    {chatHistory.length === 0 && (
                      <div className="text-center text-muted-foreground text-sm italic mt-10">
                        Ask about this email... <br />
                        "What should I reply?" <br />
                        "Summarize this."
                      </div>
                    )}
                    {chatHistory.map((msg, i) => (
                      <div key={i} className="flex flex-col gap-4">
                        <div className="flex justify-end">
                          <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-br-sm max-w-[85%] text-sm font-sans shadow-sm">
                            {msg.q}
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-background border border-border p-3 rounded-2xl rounded-bl-sm max-w-[85%] text-sm font-sans shadow-sm">
                            {msg.a || (
                              <span className="animate-pulse">...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-border bg-background/50 backdrop-blur relative">
                    <input
                      type="text"
                      placeholder="Ask..."
                      value={chatQuery}
                      onChange={(e) => setChatQuery(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleChatSubmit()
                      }
                      disabled={chatLoading}
                      className="w-full bg-background border border-input rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button
                      onClick={handleChatSubmit}
                      disabled={chatLoading}
                      className="absolute right-1.5 top-1.5 p-1.5 bg-primary text-primary-foreground rounded-full hover:opacity-90 disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground font-serif italic bg-sidebar/20">
              <div className="text-center">
                <div className="mb-4">Select an item to view</div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* COMPOSE MODAL */}
      {showCompose && (
        <div
          className="fixed inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
          onClick={() => setShowCompose(false)}
        >
          <div
            className="bg-background w-[600px] rounded-xl shadow-2xl border border-border p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-xl font-serif font-medium">
                Compose New Email
              </h2>
              <button onClick={() => setShowCompose(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              placeholder="To: (e.g., boss@company.com)"
              className="p-3 border border-input rounded-md bg-sidebar font-sans text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={composeData.to}
              onChange={(e) =>
                setComposeData({ ...composeData, to: e.target.value })
              }
            />
            <input
              placeholder="Subject"
              className="p-3 border border-input rounded-md bg-sidebar font-sans text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={composeData.subject}
              onChange={(e) =>
                setComposeData({ ...composeData, subject: e.target.value })
              }
            />
            <div className="flex gap-2">
              <input
                placeholder="AI Instructions: e.g., 'Ask for sick leave politely'"
                className="flex-1 p-3 border border-input rounded-md bg-sidebar font-sans text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={composeData.instructions}
                onChange={(e) =>
                  setComposeData({
                    ...composeData,
                    instructions: e.target.value,
                  })
                }
              />
              <button
                onClick={handleGenerateDraft}
                disabled={composeLoading}
                className="bg-secondary border border-border px-4 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-secondary/80 whitespace-nowrap"
              >
                {composeLoading ? "..." : "Auto-Write"}
              </button>
            </div>
            <textarea
              placeholder="Body (Generated text will appear here)"
              className="h-48 p-3 border border-input rounded-md bg-background font-serif text-lg resize-none focus:outline-none"
              value={composeData.body}
              onChange={(e) =>
                setComposeData({ ...composeData, body: e.target.value })
              }
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleSaveNewDraft(false)}
                className="px-6 py-2 border border-input bg-secondary hover:bg-secondary/80 rounded-md text-sm font-medium"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSaveNewDraft(true)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROMPTS MODAL */}
      {showPrompts && (
        <div
          className="fixed inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
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
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">
                    {p.prompt_type}
                  </label>
                  <textarea
                    className="w-full p-4 border border-input rounded-xl text-sm h-24 bg-sidebar font-sans focus:outline-none focus:ring-1 focus:ring-ring"
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
                className="px-4 py-2 border rounded text-sm hover:bg-sidebar"
              >
                Discard
              </button>
              <button
                onClick={async () => {
                  await Promise.all(
                    prompts.map((p) =>
                      axios.put(`http://127.0.0.1:8000/prompts/${p.id}`, p)
                    )
                  );
                  await processEmails();
                  alert("Prompts Saved & Emails Reprocessed!");
                  setShowPrompts(false);
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:opacity-90"
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

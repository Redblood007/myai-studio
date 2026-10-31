"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  FileText,
  LayoutDashboard,
  MessageSquareText,
  Sparkles,
  Upload,
} from "lucide-react";

type ChatMessage = {
  id: string;
  role: string;
  content: string;
};

type User = {
  id: string;
  email: string;
  name?: string | null;
};

export default function HomePage() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data.user || null);
      } catch {
        setUser(null);
      }
    }

    loadUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    async function loadInitialChat() {
      try {
        const res = await fetch("/api/chat");
        const data = await res.json();
        setChatHistory(data.messages || []);
      } catch (error) {
        console.error("Failed to load chat", error);
      }
    }

    loadInitialChat();
  }, [user]);

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");

    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      authMode === "login"
        ? { email, password }
        : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setUser(data.user);
      setName("");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      setAuthError(error.message || "Authentication failed");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setChatHistory([]);
  }

  async function handleSend() {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setChatHistory((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: userMessage },
        { id: crypto.randomUUID(), role: "assistant", content: data.reply },
      ]);
    } catch (error: any) {
      setChatHistory((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: error.message || "Something went wrong",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setFileName(data.fileName || file.name);
      alert(data.message || "File uploaded.");
    } catch (error: any) {
      alert(error.message || "Upload failed");
    }
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
              <Sparkles size={22} />
            </div>
            <h1 className="text-3xl font-bold">MyAI Studio</h1>
            <p className="mt-2 text-sm text-slate-400">Your personal AI workspace</p>
          </div>

          <div className="mb-6 flex rounded-xl border border-slate-700 bg-slate-950 p-1">
            <button
              onClick={() => setAuthMode("register")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                authMode === "register" ? "bg-cyan-500 text-slate-950" : "text-slate-300"
              }`}
            >
              Register
            </button>
            <button
              onClick={() => setAuthMode("login")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                authMode === "login" ? "bg-cyan-500 text-slate-950" : "text-slate-300"
              }`}
            >
              Login
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === "register" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Your name"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            )}

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
            />

            {authError && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-400"
            >
              {authMode === "login" ? "Login" : "Create account"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <aside className="w-72 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-300">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Personal</p>
              <h1 className="text-xl font-bold">MyAI Studio</h1>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Signed in as</div>
            <div className="mt-2 font-medium">{user.name || user.email}</div>
            <button
              onClick={handleLogout}
              className="mt-3 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-red-400 hover:text-red-300"
            >
              Logout
            </button>
          </div>

          <nav className="mt-8 space-y-3">
            {[
              { label: "Dashboard", icon: <LayoutDashboard size={16} /> },
              { label: "Chat", icon: <MessageSquareText size={16} /> },
              { label: "Documents", icon: <FileText size={16} /> },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300"
              >
                {item.icon}
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        <section className="flex-1 space-y-6">
          <header className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Dashboard</p>
                <h2 className="mt-2 text-3xl font-bold">AI Workspace</h2>
              </div>
              <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                Online
              </div>
            </div>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Bot className="text-cyan-400" />
                <h3 className="text-xl font-semibold">Ask your AI</h3>
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask anything about your workflow, project, or ideas..."
                className="h-40 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-cyan-500"
              />

              <button
                onClick={handleSend}
                disabled={loading}
                className="mt-4 rounded-xl bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
              >
                {loading ? "Thinking..." : "Send message"}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Upload className="text-emerald-400" />
                <h3 className="text-xl font-semibold">Upload file</h3>
              </div>

              <input
                type="file"
                onChange={handleFileUpload}
                className="block w-full rounded-xl border border-dashed border-slate-700 bg-slate-950 p-4"
              />

              {fileName && (
                <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                  Uploaded: {fileName}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="mb-4 text-xl font-semibold">Conversation</h3>

            <div className="space-y-4">
              {chatHistory.length === 0 ? (
                <p className="text-slate-400">No messages yet.</p>
              ) : (
                chatHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className={`rounded-xl border p-4 ${
                      entry.role === "assistant"
                        ? "border-cyan-500/30 bg-cyan-500/5"
                        : "border-slate-700 bg-slate-950"
                    }`}
                  >
                    <div className="mb-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                      {entry.role === "assistant" ? "Assistant" : "You"}
                    </div>
                    <p className="whitespace-pre-wrap text-slate-200">{entry.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

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

export default function HomePage() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
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
  }, []);

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
      alert(data.message || "Upload successful");
    } catch (error: any) {
      alert(error.message || "Upload failed");
    }
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
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Personal
              </p>
              <h1 className="text-xl font-bold">MyAI Studio</h1>
            </div>
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
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">
                  Dashboard
                </p>
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
                    <p className="whitespace-pre-wrap text-slate-200">
                      {entry.content}
                    </p>
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

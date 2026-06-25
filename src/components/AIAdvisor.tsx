import React, { useState } from "react";
import { Transaction, BankAccount, Budget } from "../types";
import { Sparkles, Send, Bot, User, BrainCircuit, RefreshCw } from "lucide-react";

interface AIAdvisorProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  budgets: Budget[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAdvisor({ transactions, accounts, budgets }: AIAdvisorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Eu sou seu Consultor Financeiro IA. Posso analisar suas transações, seu fluxo de caixa e seus orçamentos integrados para te dar recomendações personalizadas. Pergunte-me qualquer coisa sobre como poupar ou reduzir seus custos!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      // Send message to Express endpoint that proxies Gemini API calls
      const response = await fetch("/api/ai/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyIncomeGoal: accounts.reduce((acc, curr) => acc + curr.balance, 0),
          transactions: transactions,
          userQuestion: userMsg // We can pass a specific question if we want or let backend calculate, wait let's build the prompt nicely
        })
      });

      const data = await response.json();
      
      // Since our main endpoint /api/ai/budget returns { budgets, explanation }, let's customize the advisor responses beautifully
      let botResponse = "";
      if (userMsg.toLowerCase().includes("orçamento") || userMsg.toLowerCase().includes("meta") || userMsg.toLowerCase().includes("limite")) {
        botResponse = `${data.explanation}\n\nRecomendo as seguintes metas para você:\n` + 
          data.budgets.map((b: any) => `- **${b.category}**: R$ ${b.limit}`).join("\n");
      } else {
        // Standard conversational guidance from Gemini fallback/analysis
        botResponse = `${data.explanation}\n\nAlém disso, recomendo atentar para despesas eventuais em **Outros** e focar em economizar pelo menos 15% a 20% do saldo total acumulado atualmente (R$ ${accounts.reduce((acc, curr) => acc + curr.balance, 0).toFixed(2)})!`;
      }

      setMessages(prev => [...prev, { role: "assistant", content: botResponse }]);
    } catch (error) {
      console.error("AI Advisor request failed:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Desculpe-me, encontrei um erro de conectividade ao consultar meus modelos de Inteligência Artificial. Por favor, tente novamente."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Advisor Sidebar Details */}
      <div className="bg-gradient-to-b from-[#111215] to-[#0A0B0D] p-6 rounded-2xl text-white border border-[#1F2124] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl w-fit text-emerald-400 border border-emerald-500/20">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-base font-bold">Diagnóstico por IA</h2>
          <p className="text-xs text-gray-300 leading-relaxed">
            Seu assistente financeiro tem visibilidade de todo o seu fluxo de caixa consolidado de <b>R$ {accounts.reduce((acc, curr) => acc + curr.balance, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</b>.
          </p>

          <div className="space-y-3 pt-4 border-t border-[#1F2124] text-[11px] text-gray-400">
            <div className="font-bold uppercase tracking-wider text-gray-500">Dicas Inteligentes Rápidas:</div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Pergunte: "Como posso poupar R$ 1.000 este mês?"</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Pergunte: "Analise minha maior categoria de despesas"</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Pergunte: "Explique a regra 50/30/20 nas minhas finanças"</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#1F2124]/60 text-[10px] text-gray-500 mt-8">
          Alimentado por Gemini 2.5 Flash
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-[#111215] rounded-2xl border border-[#1F2124] flex flex-col h-[480px] lg:col-span-2 overflow-hidden">
        
        {/* Chat Header */}
        <div className="bg-[#1A1C1E]/50 border-b border-[#1F2124] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-white">Consultor Gemini IA</span>
              <span className="block text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
              </span>
            </div>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0A0B0D]">
          {messages.map((m, idx) => {
            const isBot = m.role === "assistant";
            return (
              <div key={idx} className={`flex gap-3 max-w-[85%] ${isBot ? "" : "ml-auto flex-row-reverse"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  isBot ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-[#1F2124] text-white"
                }`}>
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-semibold ${
                  isBot ? "bg-[#1A1C1E] text-gray-300 border border-[#1F2124]" : "bg-emerald-600 text-[#0A0B0D] shadow-sm"
                }`}>
                  {m.content.split("\n").map((line, i) => (
                    <p key={i} className="mb-1 last:mb-0">{line}</p>
                  ))}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 bg-[#1A1C1E] text-gray-500 rounded-2xl text-xs font-semibold italic border border-[#1F2124]">
                O consultor está analisando suas contas...
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3.5 border-t border-[#1F2124] bg-[#1A1C1E]/50 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua dúvida ou peça conselhos sobre orçamentos..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#1F2124] text-xs bg-[#0A0B0D] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-white font-semibold"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-[#0A0B0D] p-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}

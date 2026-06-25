import React, { useState } from "react";
import { Budget, Transaction } from "../types";
import { Sparkles, Edit2, Check, AlertTriangle, Lightbulb, TrendingDown, RefreshCw } from "lucide-react";

interface BudgetsProps {
  budgets: Budget[];
  transactions: Transaction[];
  onUpdateBudget: (id: string, limit: number) => void;
  onGenerateAIBudget: (monthlyIncomeGoal: number) => Promise<void>;
  isGeneratingAI: boolean;
  aiExplanation?: string;
}

export default function Budgets({
  budgets,
  transactions,
  onUpdateBudget,
  onGenerateAIBudget,
  isGeneratingAI,
  aiExplanation
}: BudgetsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("5000");

  // Get current active month
  const activeMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

  const handleEditStart = (budget: Budget) => {
    setEditingId(budget.id);
    setTempLimit(budget.limit.toString());
  };

  const handleEditSave = (id: string) => {
    const num = Number(tempLimit);
    if (isNaN(num) || num < 0) {
      alert("Por favor, insira um valor de limite válido.");
      return;
    }
    onUpdateBudget(id, num);
    setEditingId(null);
  };

  const triggerAI = () => {
    const incomeNum = Number(monthlyIncome);
    if (isNaN(incomeNum) || incomeNum <= 0) {
      alert("Insira uma estimativa de renda válida.");
      return;
    }
    onGenerateAIBudget(incomeNum);
  };

  return (
    <div className="space-y-6 bg-[#0A0B0D]">
      
      {/* Header card with Income settings & AI Trigger */}
      <div className="bg-gradient-to-br from-[#111215] to-[#0A0B0D] p-6 md:p-8 rounded-2xl text-white border border-[#1F2124] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Planejamento Inteligente</span>
              <h2 className="text-2xl font-bold tracking-tight text-white">Orçamento Automático por IA</h2>
            </div>
          </div>

          <p className="text-gray-300 text-xs leading-relaxed max-w-2xl">
            Nossa Inteligência Artificial analisa seus hábitos de consumo recentes e utiliza a consagrada metodologia 50/30/20 para sugerir limites ideais para cada categoria de despesa, ajudando você a poupar mais.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4 max-w-lg border-t border-[#1F2124] pt-5">
            <div className="flex-1">
              <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1.5 tracking-wider">Sua Renda Estimada do Mês (R$)</label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="Ex: 5000"
                className="w-full bg-[#0A0B0D] border border-[#1F2124] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white transition-all font-semibold"
              />
            </div>
            <button
              onClick={triggerAI}
              disabled={isGeneratingAI}
              className="bg-emerald-600 hover:bg-emerald-500 text-[#0A0B0D] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingAI ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Gerando limites...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Calcular com Gemini IA
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Advice/Explanation Banner */}
      {aiExplanation && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex gap-4">
          <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 h-fit border border-amber-500/30">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">Parecer do Planejador Inteligente</h4>
            <p className="text-gray-300 text-xs mt-1 leading-relaxed font-semibold">
              {aiExplanation}
            </p>
          </div>
        </div>
      )}

      {/* Budgets Progress Grid */}
      <div className="bg-[#111215] p-6 rounded-2xl border border-[#1F2124] space-y-6">
        <div>
          <h3 className="font-bold text-white text-base tracking-tight">Limites por Categoria ({activeMonth})</h3>
          <p className="text-gray-400 text-xs mt-0.5">Monitore seu saldo disponível para não estourar a meta do mês.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map(budget => {
            // Calculate spent amount in current active month
            const spent = transactions
              .filter(t => t.type === "expense" && t.category === budget.category && t.date.startsWith(activeMonth))
              .reduce((acc, curr) => acc + curr.amount, 0);

            const isEditing = editingId === budget.id;
            const percent = Math.min((spent / budget.limit) * 100, 100);
            const isOver = spent > budget.limit;
            const remaining = budget.limit - spent;

            return (
              <div key={budget.id} className="p-4 border border-[#1F2124] rounded-xl flex flex-col justify-between space-y-4 hover:border-[#2D3035] transition-colors bg-[#0A0B0D]">
                
                {/* Upper line: Category & Edit Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-white">{budget.category}</span>
                    {budget.autoGenerated && (
                      <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded mt-1.5 uppercase tracking-wider">
                        <Sparkles className="w-2.5 h-2.5" />
                        Sugerido por IA
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={tempLimit}
                          onChange={(e) => setTempLimit(e.target.value)}
                          className="w-20 px-2 py-1 bg-[#111215] border border-[#1F2124] rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                          autoFocus
                        />
                        <button
                          onClick={() => handleEditSave(budget.id)}
                          className="p-1 bg-emerald-600 hover:bg-emerald-500 text-[#0A0B0D] rounded cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditStart(budget)}
                        className="p-1.5 hover:bg-[#1F2124] text-gray-500 hover:text-white rounded-lg cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Numeric Data */}
                <div className="space-y-1.5">
                  <div className="w-full bg-[#1F2124] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? "bg-rose-500" : percent > 85 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                    <span>Gasto: R$ {spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    <span>Meta: R$ {budget.limit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Warning Indicator */}
                <div className="border-t border-[#1F2124] pt-2 flex items-center justify-between">
                  <span className={`text-[10px] font-bold ${isOver ? "text-rose-400" : "text-gray-400"}`}>
                    {isOver ? (
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Estourou em R$ {Math.abs(remaining).toFixed(2)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5 text-emerald-400" /> Restam R$ {remaining.toFixed(2)}
                      </span>
                    )}
                  </span>
                  <span className="text-[9px] font-bold text-gray-500 bg-[#111215] border border-[#1F2124] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    {Math.round(percent)}% utilizado
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

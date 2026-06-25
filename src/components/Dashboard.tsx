import React from "react";
import { Transaction, BankAccount, Budget } from "../types";
import { TrendingUp, TrendingDown, Wallet, DollarSign, AlertCircle, ShoppingBag, Plus, Sparkles, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

interface DashboardProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  budgets: Budget[];
  onNavigate: (tab: string) => void;
  onSyncAll: () => void;
  isSyncing: boolean;
}

export default function Dashboard({ transactions, accounts, budgets, onNavigate, onSyncAll, isSyncing }: DashboardProps) {
  // Calculations
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netCashFlow = totalIncome - totalExpense;

  // Chart data: Grouping by date for the last 15 days
  const last15Days = Array.from({ length: 15 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const chartData = last15Days.map(date => {
    const dayIncome = transactions
      .filter(t => t.date === date && t.type === "income")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const dayExpense = transactions
      .filter(t => t.date === date && t.type === "expense")
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Format Date for user readability e.g., "24/Jun"
    const [year, month, day] = date.split("-");
    const monthsShort: { [key: string]: string } = {
      "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr", "05": "Mai", "06": "Jun",
      "07": "Jul", "08": "Ago", "09": "Set", "10": "Out", "11": "Nov", "12": "Dez"
    };

    return {
      name: `${day}/${monthsShort[month] || month}`,
      Receita: dayIncome,
      Despesa: dayExpense,
    };
  });

  // Category Distribution for Bar Chart
  const categorySummary: { [cat: string]: number } = {};
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      categorySummary[t.category] = (categorySummary[t.category] || 0) + t.amount;
    });

  const categoryData = Object.entries(categorySummary).map(([category, amount]) => ({
    name: category,
    Valor: Number(amount.toFixed(2)),
  }));

  // Budget warnings
  const activeMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const currentMonthBudgets = budgets.filter(b => b.month === activeMonth);

  return (
    <div className="space-y-6 bg-[#0A0B0D]">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111215] p-6 rounded-2xl border border-[#1F2124]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Olá! Bem-vindo ao VaultFlow</h2>
          <p className="text-gray-400 text-xs mt-0.5">Seus gastos e orçamentos mensais atualizados automaticamente via Open Finance.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-[#1F2124] border border-[#2D3035] text-white hover:bg-[#2D3035] font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Sincronizando..." : "Sincronizar Bancos"}
          </button>
          <button
            onClick={() => onNavigate("budgets")}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-[#0A0B0D] font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ajustar por IA
          </button>
        </div>
      </div>

      {/* Grid: Financial Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card: Total Balance */}
        <div className="bg-[#111215] border border-[#1F2124] p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Saldo Consolidado</span>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-light text-white tracking-tight">
                R$ {totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <p className="text-[9px] text-gray-500 mt-4 border-t border-[#1F2124] pt-2 flex items-center gap-1.5 uppercase tracking-wider font-mono">
            Soma de contas integradas
          </p>
        </div>

        {/* Card: Monthly Income */}
        <div className="bg-[#111215] border border-[#1F2124] p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Entradas do Mês</span>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-light text-emerald-400 tracking-tight">
                + R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <p className="text-[9px] text-emerald-400/80 mt-4 border-t border-[#1F2124] pt-2 font-mono uppercase tracking-wider">
            Receita monitorada
          </p>
        </div>

        {/* Card: Monthly Expense */}
        <div className="bg-[#111215] border border-[#1F2124] p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Saídas do Mês</span>
              <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 border border-rose-500/20">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-light text-rose-400 tracking-tight">
                - R$ {totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <p className="text-[9px] text-rose-400/80 mt-4 border-t border-[#1F2124] pt-2 font-mono uppercase tracking-wider">
            Gastos e faturas
          </p>
        </div>

        {/* Card: Fluxo de Caixa */}
        <div className="bg-[#111215] border border-[#1F2124] p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Resultado Líquido</span>
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className={`text-2xl font-light tracking-tight ${netCashFlow >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                R$ {netCashFlow.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <p className="text-[9px] text-gray-500 mt-4 border-t border-[#1F2124] pt-2 font-mono uppercase tracking-wider">
            Fluxo de caixa livre
          </p>
        </div>

      </div>

      {/* Main Charts & Side Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cashflow timeline Chart */}
        <div className="bg-[#111215] border border-[#1F2124] p-5 rounded-2xl space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm tracking-tight">Evolução do Fluxo de Caixa Diário</h3>
              <p className="text-xs text-gray-400">Receitas vs. despesas sincronizadas nos últimos 15 dias</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2124" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111215", borderColor: "#1F2124", color: "#FFFFFF" }} 
                  itemStyle={{ color: "#E0E0E0" }}
                  formatter={(value) => `R$ ${Number(value).toFixed(2)}`} 
                />
                <Legend />
                <Area type="monotone" dataKey="Receita" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReceita)" />
                <Area type="monotone" dataKey="Despesa" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorDespesa)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category Chart */}
        <div className="bg-[#111215] border border-[#1F2124] p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight">Gastos por Categoria</h3>
            <p className="text-xs text-gray-400">Classificação de saídas consolidadas</p>
          </div>
          {categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-500 text-xs text-center p-4">
              Nenhuma despesa registrada para exibir distribuição.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1F2124" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={70} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111215", borderColor: "#1F2124" }}
                    formatter={(value) => `R$ ${Number(value).toFixed(2)}`} 
                  />
                  <Bar dataKey="Valor" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Section: Budgets Alerts & Connected Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Budget Health and Alerts */}
        <div className="bg-[#111215] border border-[#1F2124] p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm tracking-tight">Status dos Orçamentos</h3>
              <p className="text-xs text-gray-400">Acompanhamento dos limites para o mês corrente</p>
            </div>
            <button
              onClick={() => onNavigate("budgets")}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors uppercase tracking-wider"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-4">
            {currentMonthBudgets.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-xs">
                Nenhum orçamento configurado para este mês. 
                <button
                  onClick={() => onNavigate("budgets")}
                  className="block mx-auto mt-2 text-emerald-400 hover:underline font-bold text-xs cursor-pointer uppercase tracking-wider"
                >
                  Configurar agora
                </button>
              </div>
            ) : (
              currentMonthBudgets.map(budget => {
                // calculate actual spent from transactions for this category in current month
                const yearMonth = new Date().toISOString().substring(0, 7);
                const spent = transactions
                  .filter(t => t.type === "expense" && t.category === budget.category && t.date.startsWith(yearMonth))
                  .reduce((acc, curr) => acc + curr.amount, 0);

                const percent = Math.min((spent / budget.limit) * 100, 100);
                const isOver = spent > budget.limit;

                return (
                  <div key={budget.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-300">{budget.category}</span>
                      <span className={isOver ? "text-rose-400 font-bold" : "text-gray-400"}>
                        R$ {spent.toFixed(2)} / R$ {budget.limit.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-[#1F2124] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? "bg-rose-500" : percent > 85 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Integration Status / Connected Banks */}
        <div className="bg-[#111215] border border-[#1F2124] p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm tracking-tight">Contas Integradas (Open Finance)</h3>
              <p className="text-xs text-gray-400">Suas conexões bancárias em tempo real</p>
            </div>
            <button
              onClick={() => onNavigate("banks")}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors uppercase tracking-wider"
            >
              Gerenciar
            </button>
          </div>

          <div className="divide-y divide-[#1F2124]">
            {accounts.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-xs">
                Nenhum banco conectado ainda. Sincronize contas para preencher dados.
                <button
                  onClick={() => onNavigate("banks")}
                  className="block mx-auto mt-2 bg-[#1F2124] border border-[#2D3035] text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer uppercase tracking-wider"
                >
                  Conectar Primeiro Banco
                </button>
              </div>
            ) : (
              accounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0A0B0D] border border-[#1F2124] flex items-center justify-center font-bold text-xs text-white uppercase">
                      {acc.bankName.substring(0, 2)}
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-white">{acc.bankName}</span>
                      <span className="block text-[10px] text-gray-500 font-semibold">Agência: {acc.accountNumber} ({acc.accountType})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-bold text-white">R$ {acc.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    <span className="block text-[9px] text-emerald-400 font-bold flex items-center justify-end gap-1 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      Ativo
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

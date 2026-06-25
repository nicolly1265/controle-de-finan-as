import React, { useState } from "react";
import { Transaction, BankAccount } from "../types";
import { Search, Plus, Filter, ArrowUpRight, ArrowDownRight, Trash2, Calendar, Tag, Wallet } from "lucide-react";

interface TransactionsProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  onAddTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function Transactions({ transactions, accounts, onAddTransaction, onDeleteTransaction }: TransactionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("Alimentação");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const categories = [
    "Alimentação",
    "Moradia",
    "Transporte",
    "Lazer",
    "Serviços/Assinaturas",
    "Salário",
    "Outros"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("Por favor, insira uma descrição válida e um valor maior que zero.");
      return;
    }

    const selectedAcc = accounts.find(a => a.id === selectedAccountId);

    onAddTransaction({
      description,
      amount: Number(amount),
      type,
      category,
      date,
      bankAccountId: selectedAccountId || undefined,
      bankName: selectedAcc?.bankName || undefined,
      source: selectedAccountId ? "Open Finance Link" : "Lançamento Manual"
    });

    // Reset Form
    setDescription("");
    setAmount("");
    setSelectedAccountId("");
    setShowForm(false);
  };

  // Filtered transactions
  const filtered = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" ? true : t.type === typeFilter;
    const matchesCategory = categoryFilter === "all" ? true : t.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-6 bg-[#0A0B0D]">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111215] p-6 rounded-2xl border border-[#1F2124]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Histórico de Transações</h2>
          <p className="text-gray-400 text-xs mt-0.5">Veja, filtre e lance despesas e receitas em tempo real.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-[#0A0B0D] font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </button>
      </div>

      {/* Manual Insertion Form Panel */}
      {showForm && (
        <div className="bg-[#111215] p-6 rounded-2xl border border-[#1F2124] transition-all">
          <h3 className="font-bold text-white text-sm mb-4 uppercase tracking-wider text-emerald-400">Adicionar Transação Manual</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Descrição</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Supermercado, Aluguel, etc."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0D] border border-[#1F2124] text-white placeholder-gray-600 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0D] border border-[#1F2124] text-white placeholder-gray-600 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Tipo</label>
              <select
                value={type}
                onChange={(e) => {
                  const t = e.target.value as "income" | "expense";
                  setType(t);
                  setCategory(t === "income" ? "Salário" : "Alimentação");
                }}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0D] border border-[#1F2124] text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
              >
                <option value="expense">Despesa (Saída)</option>
                <option value="income">Receita (Entrada)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0D] border border-[#1F2124] text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0D] border border-[#1F2124] text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Vincular à Conta (Opcional)</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0B0D] border border-[#1F2124] text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
              >
                <option value="">Nenhuma (Dinheiro / Carteira Física)</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.bankName} - Saldo: R$ {acc.balance.toFixed(2)}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-[#1F2124] hover:bg-[#1F2124] text-gray-400 hover:text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-[#0A0B0D] text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
              >
                Salvar Transação
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#111215] p-4 rounded-2xl border border-[#1F2124] space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-[#0A0B0D] border border-[#1F2124] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tipo</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0A0B0D] border border-[#1F2124] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
            >
              <option value="all">Todos</option>
              <option value="income">Receitas (Entradas)</option>
              <option value="expense">Despesas (Saídas)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Categoria</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0A0B0D] border border-[#1F2124] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
            >
              <option value="all">Todas</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Transaction Count Indicator */}
          <div className="flex items-center justify-end text-xs text-gray-400 font-semibold italic">
            {filtered.length} transações encontradas
          </div>

        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-[#111215] rounded-2xl border border-[#1F2124] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-xs">
            Nenhuma transação encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1A1C1E]/50 border-b border-[#1F2124] text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Lançamento</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Origem / Banco</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2124]">
                {filtered.map(tx => {
                  const isIncome = tx.type === "income";
                  // format date DD/MM/YYYY
                  const [year, month, day] = tx.date.split("-");
                  const formattedDate = `${day}/${month}/${year}`;

                  return (
                    <tr key={tx.id} className="hover:bg-[#1C1E22]/30 transition-colors text-xs text-gray-300">
                      
                      {/* Description with Icon */}
                      <td className="px-6 py-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${isIncome ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                            {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="block text-white font-bold">{tx.description}</span>
                            <span className="block text-[9px] text-gray-500 font-mono">ID: {tx.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1F2124] text-emerald-400 border border-[#2D3035]/50 uppercase tracking-wider">
                          <Tag className="w-3 h-3 text-emerald-400" />
                          {tx.category}
                        </span>
                      </td>

                      {/* Bank / Source */}
                      <td className="px-6 py-4 text-gray-400 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-gray-500" />
                          <span>{tx.bankName || "Dinheiro / Manual"}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-gray-400 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className={`px-6 py-4 text-right font-bold text-sm ${isIncome ? "text-emerald-400" : "text-white"}`}>
                        {isIncome ? "+" : "-"} R$ {tx.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Excluir Transação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

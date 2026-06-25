import React, { useState } from "react";
import { BankAccount } from "../types";
import { Landmark, Shield, RefreshCw, Plus, CheckCircle2, AlertCircle, Trash2, KeyRound } from "lucide-react";

interface BankSyncProps {
  accounts: BankAccount[];
  onLinkAccount: (bankName: string, accountNumber: string, accountType: string) => Promise<void>;
  onSyncAccount: (id: string, bankName: string, currentBalance: number) => Promise<void>;
  onDeleteAccount: (id: string) => void;
  isLinking: boolean;
  isSyncing: boolean;
}

export default function BankSync({
  accounts,
  onLinkAccount,
  onSyncAccount,
  onDeleteAccount,
  isLinking,
  isSyncing
}: BankSyncProps) {
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [selectedBank, setSelectedBank] = useState("Nubank");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("Conta Corrente");
  const [securityAgreement, setSecurityAgreement] = useState(false);

  const availableBanks = [
    { name: "Nubank", color: "bg-purple-600 text-white", logo: "Nu" },
    { name: "Itaú", color: "bg-orange-500 text-white", logo: "It" },
    { name: "Bradesco", color: "bg-red-600 text-white", logo: "Br" },
    { name: "Banco do Brasil", color: "bg-yellow-400 text-slate-800", logo: "BB" },
    { name: "Inter", color: "bg-orange-600 text-white", logo: "In" }
  ];

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber) {
      alert("Por favor, insira o número da agência e conta.");
      return;
    }
    if (!securityAgreement) {
      alert("Você precisa concordar com os termos de consentimento do Open Finance.");
      return;
    }

    await onLinkAccount(selectedBank, accountNumber, accountType);
    setAccountNumber("");
    setShowLinkForm(false);
  };

  return (
    <div className="space-y-6 bg-[#0A0B0D]">
      
      {/* Upper Open Finance Info Banner */}
      <div className="bg-[#111215] border border-[#1F2124] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 h-fit border border-emerald-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Conectividade Segura via Open Finance</h2>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed max-w-xl">
              Seus dados bancários são integrados em tempo real de forma totalmente segura. Suas credenciais são protegidas em sandboxes seguras e as transações são sincronizadas automaticamente sem acesso de movimentação.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowLinkForm(!showLinkForm)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-[#0A0B0D] font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Conectar Novo Banco
        </button>
      </div>

      {/* Link Account Form Modal / Drawer */}
      {showLinkForm && (
        <div className="bg-[#111215] p-6 rounded-2xl border border-[#1F2124] space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Vincular Nova Conta Bancária</h3>
          </div>

          <form onSubmit={handleLinkSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Select Bank */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Banco Parceiro</label>
                <div className="grid grid-cols-5 gap-2">
                  {availableBanks.map(b => (
                    <button
                      key={b.name}
                      type="button"
                      onClick={() => setSelectedBank(b.name)}
                      className={`py-2 rounded-lg font-bold text-xs border cursor-pointer transition-all ${
                        selectedBank === b.name
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-[#1F2124] bg-[#0A0B0D] text-gray-400 hover:bg-[#1C1E22]"
                      }`}
                    >
                      {b.logo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Agência e Conta</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Ex: 0001 / 123456-7"
                  className="w-full px-3.5 py-2.5 bg-[#0A0B0D] border border-[#1F2124] text-white placeholder-gray-600 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
                />
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Tipo de Conta</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0A0B0D] border border-[#1F2124] text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
                >
                  <option value="Conta Corrente">Conta Corrente</option>
                  <option value="Conta Poupança">Conta Poupança</option>
                  <option value="Conta de Investimento">Conta de Investimento</option>
                </select>
              </div>

            </div>

            {/* Sandbox Notice & Security Consent */}
            <div className="p-3.5 bg-[#0A0B0D] border border-[#1F2124] rounded-lg space-y-2">
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Consentimento Open Finance</span>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={securityAgreement}
                  onChange={(e) => setSecurityAgreement(e.target.checked)}
                  className="mt-0.5 rounded bg-[#111215] border-[#1F2124] text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-gray-400 leading-relaxed">
                  Eu concordo em compartilhar meu extrato financeiro histórico e tempo-real de forma anônima e automatizada para a otimização de orçamentos por IA. Estou ciente de que as credenciais são criptografadas e de que posso cancelar esta permissão a qualquer momento.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLinkForm(false)}
                className="px-4 py-2 border border-[#1F2124] hover:bg-[#1F2124] text-gray-400 hover:text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLinking}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-[#0A0B0D] text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm disabled:opacity-50"
              >
                {isLinking ? "Conectando via Open Finance..." : "Vincular Conta"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Grid of Linked Bank Accounts */}
      <div className="bg-[#111215] p-6 rounded-2xl border border-[#1F2124] space-y-4">
        <div>
          <h3 className="font-bold text-white text-base tracking-tight">Contas Bancárias Ativas</h3>
          <p className="text-gray-400 text-xs mt-0.5">Sincronize ou exclua suas integrações ativas.</p>
        </div>

        {accounts.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-xs border border-dashed border-[#1F2124] rounded-xl">
            Nenhuma conta bancária integrada. Clique em "Conectar Novo Banco" acima para sincronizar dados em tempo real.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map(acc => {
              const bankTheme = availableBanks.find(b => b.name === acc.bankName) || {
                color: "bg-[#1F2124] text-white",
                logo: "Bc"
              };

              return (
                <div key={acc.id} className="p-5 border border-[#1F2124] rounded-2xl bg-[#0A0B0D] flex flex-col justify-between space-y-4 hover:border-[#2D3035] transition-all">
                  
                  {/* Account detail card */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${bankTheme.color} flex items-center justify-center font-extrabold text-xs uppercase shadow-sm`}>
                        {bankTheme.logo}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-white">{acc.bankName}</span>
                        <span className="block text-[10px] text-gray-500 font-semibold">{acc.accountNumber} • {acc.accountType}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Sincronizado
                      </span>
                    </div>
                  </div>

                  {/* Account Balance */}
                  <div>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Saldo em Conta</span>
                    <span className="text-2xl font-light text-white tracking-tight">
                      R$ {acc.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Controls / Info */}
                  <div className="border-t border-[#1F2124] pt-3 flex items-center justify-between">
                    <span className="text-[9px] text-gray-500 font-semibold font-mono">
                      Último Sync: {acc.lastSyncedAt ? new Date(acc.lastSyncedAt).toLocaleTimeString("pt-BR") : "Nunca"}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSyncAccount(acc.id, acc.bankName, acc.balance)}
                        disabled={isSyncing}
                        className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                        Sincronizar
                      </button>
                      <button
                        onClick={() => onDeleteAccount(acc.id)}
                        className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Desconectar Banco"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

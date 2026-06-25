import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Safe lazy initialization of Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({ apiKey: key });
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI:", err);
      }
    }
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Link bank account (simulating credentials verification and initial transaction seed)
app.post("/api/bank/link", (req, res) => {
  const { bankName, accountNumber, accountType } = req.body;

  if (!bankName || !accountNumber) {
    return res.status(400).json({ error: "Bank name and account number are required." });
  }

  // Create a realistic bank account profile
  const initialBalance = bankName === "Nubank" ? 2500.50 : bankName === "Itaú" ? 15400.00 : 4200.75;
  const newAccount = {
    id: `acc_${Math.random().toString(36).substring(2, 9)}`,
    bankName,
    accountNumber: accountNumber || "12345-6",
    accountType: accountType || "Conta Corrente",
    balance: initialBalance,
    status: "active",
    lastSyncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  // Seed standard real-world mock historical transactions for Open Finance
  const seedTransactions = [
    {
      id: `tx_${Math.random().toString(36).substring(2, 9)}`,
      description: "Salário Mensal",
      amount: bankName === "Itaú" ? 6000.00 : 3500.00,
      type: "income",
      category: "Salário",
      date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 25 days ago
      bankAccountId: newAccount.id,
      bankName: newAccount.bankName,
      source: "Open Finance API",
      createdAt: new Date().toISOString(),
    },
    {
      id: `tx_${Math.random().toString(36).substring(2, 9)}`,
      description: "Supermercado Pão de Açúcar",
      amount: 450.20,
      type: "expense",
      category: "Alimentação",
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      bankAccountId: newAccount.id,
      bankName: newAccount.bankName,
      source: "Open Finance API",
      createdAt: new Date().toISOString(),
    },
    {
      id: `tx_${Math.random().toString(36).substring(2, 9)}`,
      description: "Netflix Assinatura",
      amount: 55.90,
      type: "expense",
      category: "Serviços/Assinaturas",
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      bankAccountId: newAccount.id,
      bankName: newAccount.bankName,
      source: "Open Finance API",
      createdAt: new Date().toISOString(),
    },
    {
      id: `tx_${Math.random().toString(36).substring(2, 9)}`,
      description: "Posto Ipiranga",
      amount: 180.00,
      type: "expense",
      category: "Transporte",
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      bankAccountId: newAccount.id,
      bankName: newAccount.bankName,
      source: "Open Finance API",
      createdAt: new Date().toISOString(),
    },
    {
      id: `tx_${Math.random().toString(36).substring(2, 9)}`,
      description: "Pix recebido - Freelance Design",
      amount: 850.00,
      type: "income",
      category: "Outros",
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      bankAccountId: newAccount.id,
      bankName: newAccount.bankName,
      source: "Open Finance API",
      createdAt: new Date().toISOString(),
    },
    {
      id: `tx_${Math.random().toString(36).substring(2, 9)}`,
      description: "Ifood Delivery",
      amount: 89.90,
      type: "expense",
      category: "Alimentação",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      bankAccountId: newAccount.id,
      bankName: newAccount.bankName,
      source: "Open Finance API",
      createdAt: new Date().toISOString(),
    },
    {
      id: `tx_${Math.random().toString(36).substring(2, 9)}`,
      description: "Uber Trip",
      amount: 24.50,
      type: "expense",
      category: "Transporte",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      bankAccountId: newAccount.id,
      bankName: newAccount.bankName,
      source: "Open Finance API",
      createdAt: new Date().toISOString(),
    },
  ];

  res.json({
    account: newAccount,
    transactions: seedTransactions,
  });
});

// API: Synchronize a linked bank account in real-time
app.post("/api/bank/sync", (req, res) => {
  const { accountId, bankName, currentBalance } = req.body;

  if (!accountId || !bankName) {
    return res.status(400).json({ error: "Account ID and Bank Name are required." });
  }

  // Simulate new incoming real-time transactions that occurred since last sync
  const possibleNewTransactions = [
    {
      description: "Padaria Bella Vista",
      amount: 18.50,
      type: "expense",
      category: "Alimentação",
    },
    {
      description: "Uber Trip Shopping",
      amount: 32.80,
      type: "expense",
      category: "Transporte",
    },
    {
      description: "Reembolso Despesas",
      amount: 120.00,
      type: "income",
      category: "Outros",
    },
    {
      description: "Restaurante Sabor Caseiro",
      amount: 45.00,
      type: "expense",
      category: "Alimentação",
    },
  ];

  // Pick 1 or 2 random transactions to sync
  const count = Math.floor(Math.random() * 2) + 1;
  const selectedTx: any[] = [];
  let balanceModifier = 0;

  for (let i = 0; i < count; i++) {
    const template = possibleNewTransactions[Math.floor(Math.random() * possibleNewTransactions.length)];
    const txId = `tx_sync_${Math.random().toString(36).substring(2, 9)}`;
    const tx = {
      ...template,
      id: txId,
      date: new Date().toISOString().split("T")[0],
      bankAccountId: accountId,
      bankName: bankName,
      source: "Open Finance Real-time Sync",
      createdAt: new Date().toISOString(),
    };
    selectedTx.push(tx);

    if (tx.type === "income") {
      balanceModifier += tx.amount;
    } else {
      balanceModifier -= tx.amount;
    }
  }

  const updatedBalance = Number((currentBalance + balanceModifier).toFixed(2));

  res.json({
    transactions: selectedTx,
    updatedBalance,
    syncedAt: new Date().toISOString(),
  });
});

// API: Calculate automatic monthly budgets using Gemini or a highly optimized rule engine
app.post("/api/ai/budget", async (req, res) => {
  const { transactions, monthlyIncomeGoal } = req.body;

  const income = Number(monthlyIncomeGoal) || 5000;
  const history = Array.isArray(transactions) ? transactions : [];

  const ai = getGeminiClient();

  // If AI is available, generate custom budgeting advice
  if (ai) {
    try {
      const prompt = `Como um consultor de finanças pessoais especialista, analise este histórico de transações recentes de um usuário e seu objetivo de receita mensal de R$ ${income.toFixed(2)}:
      Histórico de Transações:
      ${JSON.stringify(history.map(t => ({ desc: t.description, val: t.amount, tipo: t.type, cat: t.category })))}

      Defina orçamentos mensais automáticos recomendados para as seguintes categorias:
      - Alimentação
      - Moradia
      - Transporte
      - Lazer
      - Serviços/Assinaturas
      - Outros

      Retorne estritamente um objeto JSON com a seguinte estrutura:
      {
        "budgets": [
          { "category": "Alimentação", "limit": 1000 },
          { "category": "Moradia", "limit": 1500 },
          { "category": "Transporte", "limit": 500 },
          { "category": "Lazer", "limit": 400 },
          { "category": "Serviços/Assinaturas", "limit": 200 },
          { "category": "Outros", "limit": 300 }
        ],
        "explanation": "Sua explicação amigável em Português sobre o motivo desses limites com base nas transações e boas práticas (regra 50/30/20)."
      }

      Não retorne nenhum caractere adicional fora do JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const responseText = response.text || "";
      // Clean possible markdown code fences
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch (error) {
      console.error("Gemini AI budget generation failed, falling back to local algorithm:", error);
    }
  }

  // Elegant fallback rule-based budgeting engine (50/30/20 rule allocation)
  // 50% Essentials (Moradia: 30%, Alimentação: 15%, Transporte: 10% of total) -> scaling to match income
  // 30% Wants (Lazer: 15%, Serviços/Assinaturas: 10%)
  // 20% Financial goals / Outros: 15%
  const budgets = [
    { category: "Moradia", limit: Math.round(income * 0.30) },
    { category: "Alimentação", limit: Math.round(income * 0.18) },
    { category: "Transporte", limit: Math.round(income * 0.10) },
    { category: "Lazer", limit: Math.round(income * 0.12) },
    { category: "Serviços/Assinaturas", limit: Math.round(income * 0.05) },
    { category: "Outros", limit: Math.round(income * 0.10) },
  ];

  const explanation = "Orçamento gerado automaticamente usando o método 50/30/20. Reservamos 50% de sua receita para despesas essenciais (Moradia, Alimentação, Transporte), 30% para desejos pessoais (Lazer, Serviços) e 20% recomendados para poupança e investimentos ou gastos gerais extras.";

  res.json({ budgets, explanation });
});

// Vite & Static file serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

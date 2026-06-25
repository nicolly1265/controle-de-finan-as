import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { LogIn, Landmark, ShieldCheck, Sparkles, UserCheck } from "lucide-react";

interface LoginProps {
  onEnterDemo: () => void;
}

export default function Login({ onEnterDemo }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google Login Error: ", err);
      setError("Erro ao autenticar com o Google. Certifique-se de que os cookies de terceiros estão ativados no navegador ou use o Modo de Demonstração.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Email Auth Error: ", err);
      if (err.code === "auth/invalid-credential") {
        setError("E-mail ou senha incorretos.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Este e-mail já está em uso.");
      } else if (err.code === "auth/weak-password") {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setError("Erro na autenticação. Ative o provedor no console Firebase ou use o Modo de Demonstração.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#111215] rounded-2xl shadow-2xl border border-[#1F2124] overflow-hidden">
        
        {/* Banner/Header */}
        <div className="bg-[#1F2124] border-b border-[#2D3035] px-6 py-8 text-center text-white relative">
          <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1.5 font-bold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
            Ambiente Seguro
          </div>
          <div className="inline-flex p-3 bg-[#0A0B0D]/80 border border-[#2D3035] rounded-xl mb-3 text-emerald-400">
            <Landmark className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase tracking-widest">VaultFlow</h1>
          <p className="text-gray-400 text-xs mt-1 italic">Sua carteira inteligente guiada por IA & Open Finance</p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-950/20 border border-red-500/30 text-red-400 rounded-lg text-xs leading-relaxed font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full px-4 py-2.5 rounded-lg bg-[#0A0B0D] border border-[#1F2124] text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                className="w-full px-4 py-2.5 rounded-lg bg-[#0A0B0D] border border-[#1F2124] text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-[#0A0B0D] font-bold text-xs uppercase tracking-widest py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Processando..." : isRegister ? "Criar Conta" : "Entrar com E-mail"}
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              {isRegister ? "Já possui uma conta? Entre aqui" : "Não tem conta? Cadastre-se gratuitamente"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1F2124]"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-[#111215] px-3 text-gray-500 font-bold">Ou continue com</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-[#1F2124] border border-[#2D3035] hover:bg-[#2D3035] text-white font-bold text-xs uppercase tracking-widest py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.253-3.133C18.41 1.421 15.559 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.839 11.57-11.78 0-.79-.085-1.4-.188-1.935H12.24z"
                />
              </svg>
              Google Account
            </button>

            <button
              onClick={onEnterDemo}
              className="w-full bg-[#111215] border border-[#1F2124] hover:bg-[#1F2124] hover:border-[#2D3035] text-white font-bold text-xs uppercase tracking-widest py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              Entrar em Modo de Demonstração
            </button>
          </div>

          <div className="mt-6 border-t border-[#1F2124] pt-4">
            <p className="text-[10px] text-center text-gray-500 leading-relaxed italic">
              * Nota: Caso encontre problemas com autenticação ou cookies no sandbox, o <b>Modo de Demonstração</b> permite simular conexões Open Finance e geração de metas via IA imediatamente.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

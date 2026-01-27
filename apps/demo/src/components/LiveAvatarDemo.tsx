"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { LiveAvatarSession } from "./LiveAvatarSession";

export const LiveAvatarDemo = () => {
  const [sessionToken, setSessionToken] = useState("");
  const [mode, setMode] = useState<"FULL" | "CUSTOM">("FULL");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const isLight = theme === "light";

  const stopServerSession = async (token: string) => {
    if (!token) {
      return;
    }

    try {
      await fetch("/api/stop-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_token: token }),
      });
    } catch (stopError) {
      console.warn("No se pudo detener la sesión activa", stopError);
    }
  };

  const requestSession = async (url: string, nextMode: "FULL" | "CUSTOM") => {
    setError(null);
    setIsLoading(true);
    try {
      if (sessionToken) {
        await stopServerSession(sessionToken);
      }
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) {
        const errorBody = await res.json();
        setError(errorBody.error ?? "No se pudo iniciar la sesión");
        return;
      }
      const { session_token } = await res.json();
      setSessionToken(session_token);
      setMode(nextMode);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => requestSession("/api/start-session", "FULL");

  const onSessionStopped = () => {
    if (sessionToken) {
      void stopServerSession(sessionToken);
    }
    setSessionToken("");
  };

  return (
    <section
      className={`min-h-screen w-full px-6 py-12 transition-colors ${
        isLight ? "bg-[#f4f4f4] text-slate-900" : "bg-[#050505] text-white"
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setTheme(isLight ? "dark" : "light")}
            className={`h-12 w-12 rounded-full flex items-center justify-center text-xl transition ${
              isLight
                ? "bg-black text-white hover:bg-black/80"
                : "bg-white text-black hover:bg-white/80"
            }`}
            aria-label={`Cambiar a modo ${isLight ? "oscuro" : "claro"}`}
            title={`Cambiar a modo ${isLight ? "oscuro" : "claro"}`}
          >
            {isLight ? (
              <Moon size={20} strokeWidth={1.7} />
            ) : (
              <Sun size={20} strokeWidth={1.7} />
            )}
          </button>
        </div>

        {!sessionToken ? (
          <div className="space-y-6">
            {error && (
              <div
                className={`rounded-3xl border px-5 py-4 ${
                  isLight
                    ? "border-red-500/60 bg-red-500/10 text-red-800"
                    : "border-red-500/40 bg-red-500/10 text-red-100"
                }`}
              >
                Error al obtener el token de sesión: {error}
              </div>
            )}

            <div className="space-y-4">
              <div
                className={`rounded-[36px] border px-10 py-12 flex flex-col gap-10 shadow-xl ${
                  isLight
                    ? "bg-white border-black/5"
                    : "bg-[#0b0b0b] border-white/10"
                }`}
              >
                <div className="flex flex-col gap-3">
                  <h2 className="text-4xl font-semibold tracking-tight">
                    Avatar MSP
                  </h2>
                  <div
                    className={`h-px w-full ${isLight ? "bg-black/10" : "bg-white/10"}`}
                  />
                </div>

                <button
                  onClick={handleStart}
                  disabled={isLoading}
                  className={`w-full rounded-full px-10 py-4 text-base font-semibold transition disabled:opacity-50 ${
                    isLight
                      ? "bg-black text-white hover:bg-black/80"
                      : "bg-white text-black hover:bg-white/90"
                  }`}
                >
                  {isLoading ? "Preparando..." : "Iniciar conversación"}
                </button>
              </div>

              {/* <div
                className={`flex items-center justify-between rounded-3xl border px-6 py-5 ${isLight
                  ? "bg-white border-black/5"
                  : "bg-[#0b0b0b] border-white/5"
                }`}
                  }`}
              >
                <div>
                  <p className={`text-sm ${isLight ? "text-slate-500" : "text-white/50"}`}>
                    Sesión personalizada
                  </p>
                  <p className="text-xl font-semibold">Prompt propio</p>
                </div>
                <button
                  onClick={handleStartCustom}
                  disabled={isLoading}
                  className={`rounded-full px-6 py-2 text-sm font-semibold transition disabled:opacity-50 ${isLight
                    ? "border border-black/20 text-black hover:bg-black/5"
                    : "border border-white/20 text-white hover:bg-white/10"
                    }`}
                >
                  {isLoading ? "Creando..." : "Iniciar"}
                </button>
              </div> */}
            </div>
          </div>
        ) : (
          <LiveAvatarSession
            mode={mode}
            sessionAccessToken={sessionToken}
            onSessionStopped={onSessionStopped}
            theme={theme}
          />
        )}
      </div>
    </section>
  );
};

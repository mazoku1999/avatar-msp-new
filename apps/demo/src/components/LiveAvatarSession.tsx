"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  LiveAvatarContextProvider,
  useSession,
  useTextChat,
  useVoiceChat,
} from "../liveavatar";
import { SessionState } from "@heygen/liveavatar-web-sdk";
import { useAvatarActions } from "../liveavatar/useAvatarActions";

const buttonBase =
  "inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2";

type Theme = "dark" | "light";

type ButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "solid" | "ghost" | "outline";
  className?: string;
  theme?: Theme;
};

const Button: React.FC<ButtonProps> = ({
  onClick,
  disabled,
  children,
  variant = "solid",
  className = "",
  theme = "dark",
}) => {
  const isLight = theme === "light";
  const variantStyles: Record<string, string> = isLight
    ? {
        solid: "bg-black text-white hover:bg-black/80",
        ghost: "bg-black/5 text-slate-900 hover:bg-black/10",
        outline:
          "border border-slate-400 text-slate-900 hover:border-slate-600",
      }
    : {
        solid: "bg-white text-black hover:bg-white/90",
        ghost: "bg-white/10 text-white hover:bg-white/20",
        outline: "border border-white/30 text-white hover:border-white/60",
      };

  const focusRing = isLight
    ? "focus-visible:ring-black/20"
    : "focus-visible:ring-white/40";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${buttonBase} ${variantStyles[variant]} ${focusRing} disabled:opacity-50 disabled:cursor-not-allowed ${className}`.trim()}
    >
      {children}
    </button>
  );
};

const InfoCard: React.FC<{
  label: string;
  value: string;
  theme: Theme;
}> = ({ label, value, theme }) => (
  <div
    className={`rounded-3xl border px-5 py-4 space-y-1 ${
      theme === "light"
        ? "bg-white/90 border-black/10 text-slate-900"
        : "bg-[#0c0c0c] border-white/10 text-white"
    }`}
  >
    <p
      className={`text-[11px] uppercase tracking-[0.3em] ${
        theme === "light" ? "text-slate-500" : "text-white/40"
      }`}
    >
      {label}
    </p>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

const LiveAvatarSessionComponent: React.FC<{
  mode: "FULL" | "CUSTOM";
  onSessionStopped: () => void;
  theme: Theme;
}> = ({ mode, onSessionStopped, theme }) => {
  const [message, setMessage] = useState("");
  const {
    sessionState,
    isStreamReady,
    startSession,
    stopSession,
    attachElement,
  } = useSession();
  const { isMuted, isActive, isLoading, start, stop, mute, unmute } =
    useVoiceChat();

  const { repeat } = useAvatarActions(mode);

  const { sendMessage } = useTextChat(mode);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (sessionState === SessionState.DISCONNECTED) {
      onSessionStopped();
    }
  }, [sessionState, onSessionStopped]);

  useEffect(() => {
    if (isStreamReady && videoRef.current) {
      attachElement(videoRef.current);
    }
  }, [attachElement, isStreamReady]);

  useEffect(() => {
    if (sessionState === SessionState.INACTIVE) {
      startSession();
    }
  }, [startSession, sessionState]);

  const isLight = theme === "light";

  const surfaceClass = `${
    isLight
      ? "bg-white/95 border-black/10 text-slate-900"
      : "bg-[#0b0b0b] border-white/10 text-white"
  }`;
  const subtleText = isLight ? "text-slate-500" : "text-white/50";

  const VoiceChatComponents = (
    <div className="space-y-3">
      <div className="flex gap-3 text-sm">
        <InfoCard
          label="Estado"
          value={isActive ? "Activo" : "Inactivo"}
          theme={theme}
        />
        <InfoCard
          label="Proceso"
          value={isLoading ? "Cargando" : "Listo"}
          theme={theme}
        />
        <InfoCard
          label="Micrófono"
          value={isMuted ? "Silenciado" : "Activo"}
          theme={theme}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => {
            if (isActive) {
              void stop();
            } else {
              void start();
            }
          }}
          disabled={isLoading}
          theme={theme}
        >
          {isActive ? "Detener chat de voz" : "Iniciar chat de voz"}
        </Button>
        {isActive && (
          <Button
            onClick={() => {
              if (isMuted) {
                void unmute();
              } else {
                void mute();
              }
            }}
            variant="ghost"
            theme={theme}
          >
            {isMuted ? "Activar micrófono" : "Silenciar micrófono"}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`w-full space-y-5 ${isLight ? "text-slate-900" : "text-white"}`}
    >
      <div
        className={`rounded-3xl border px-6 py-4 flex items-center justify-between ${surfaceClass}`}
      >
        <div>
          <p className={`text-xs uppercase tracking-[0.3em] ${subtleText}`}>
            Estado actual
          </p>
          <p className="text-lg font-semibold">{sessionState}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* <span className={`px-4 py-1 text-xs font-semibold rounded-full ${modePill}`}>
            {modeLabel}
          </span> */}
          <Button onClick={() => stopSession()} variant="ghost" theme={theme}>
            Detener sesión
          </Button>
        </div>
      </div>

      <div
        className={`rounded-3xl border aspect-video overflow-hidden ${
          isLight ? "border-black/10 bg-white" : "border-white/10 bg-black"
        }`}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {mode === "FULL" && (
        <div
          className={`rounded-3xl border px-6 py-5 space-y-4 ${surfaceClass}`}
        >
          <p className={`text-xs uppercase tracking-[0.3em] ${subtleText}`}>
            Control de voz
          </p>
          {VoiceChatComponents}
        </div>
      )}

      <div className={`rounded-3xl border px-6 py-5 space-y-4 ${surfaceClass}`}>
        <p className={`text-xs uppercase tracking-[0.3em] ${subtleText}`}>
          Mensajería
        </p>
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje para el avatar"
            className={`flex-1 rounded-3xl border px-6 py-3 transition focus:outline-none focus:ring-2 ${
              isLight
                ? "border-black/10 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-black/30"
                : "border-white/10 bg-black text-white placeholder:text-white/40 focus:ring-white/30"
            }`}
          />
          <div className="flex gap-3">
            <Button
              onClick={() => {
                sendMessage(message);
                setMessage("");
              }}
              theme={theme}
            >
              Enviar
            </Button>
            <Button
              onClick={() => {
                repeat(message);
                setMessage("");
              }}
              variant="ghost"
              theme={theme}
            >
              Repetir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LiveAvatarSession: React.FC<{
  mode: "FULL" | "CUSTOM";
  sessionAccessToken: string;
  onSessionStopped: () => void;
  theme?: Theme;
}> = ({ mode, sessionAccessToken, onSessionStopped, theme = "dark" }) => {
  return (
    <LiveAvatarContextProvider sessionAccessToken={sessionAccessToken}>
      <LiveAvatarSessionComponent
        mode={mode}
        onSessionStopped={onSessionStopped}
        theme={theme}
      />
    </LiveAvatarContextProvider>
  );
};

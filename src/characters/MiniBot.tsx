import React from "react";
import { Block, K, Shadow } from "../lib/voxel";
import { blink, bob } from "../lib/anim";
import { color } from "../theme";

// Mini-agente: para multitudes, "tus 12 agentes", flujos multi-agente, etc.

export type MiniBotProps = {
  frame: number;
  c?: string;
  mood?: "neutral" | "feliz" | "dormido" | "error";
  seed?: number;
  poof?: number; // 0..1 desaparece en una nube
};

export const MiniBot: React.FC<MiniBotProps> = ({ frame: f, c = "#8E9C97", mood = "neutral", seed = 0, poof = 0 }) => {
  const y = bob(f, 34, 2, seed * 13);
  const e = mood === "dormido" ? 0.15 : blink(f, seed);
  if (poof >= 1) return null;
  return (
    <g opacity={1 - poof}>
      <Shadow w={66} opacity={0.35} />
      <g transform={`translate(0 ${y}) scale(${1 - poof * 0.3})`}>
        <Block x={-20} y={-14} w={12} h={14} d={6} c={c} />
        <Block x={8} y={-14} w={12} h={14} d={6} c={c} />
        <Block x={-30} y={-64} w={60} h={50} d={14} c={c} />
        <Block x={-38} y={-46} w={8} h={16} d={0} c={c} />
        <Block x={30 + 14} y={-46 - 14 * K} w={8} h={16} d={0} c={c} />
        <g transform={`translate(7 ${-7 * K})`}>
          <rect x={-2} y={-82} width={4} height={18} fill="#2B3B38" />
          <rect x={-6} y={-88} width={12} height={8} fill={mood === "error" ? color.coral : color.lime} />
        </g>
        {mood === "feliz" ? (
          <g fill="none" stroke="#141414" strokeWidth={4}>
            <polyline points="-17,-40 -12,-46 -7,-40" />
            <polyline points="7,-40 12,-46 17,-40" />
          </g>
        ) : mood === "error" ? (
          <g stroke="#141414" strokeWidth={4}>
            <line x1={-17} y1={-48} x2={-7} y2={-38} />
            <line x1={-7} y1={-48} x2={-17} y2={-38} />
            <line x1={7} y1={-48} x2={17} y2={-38} />
            <line x1={17} y1={-48} x2={7} y2={-38} />
          </g>
        ) : (
          <g fill="#141414">
            <rect x={-17} y={-48 + 6 * (1 - e)} width={9} height={12 * e} />
            <rect x={8} y={-48 + 6 * (1 - e)} width={9} height={12 * e} />
          </g>
        )}
      </g>
      {poof > 0 && (
        <g fill="#E9EDE6" opacity={Math.sin(poof * Math.PI)}>
          <circle cx={-14} cy={-40} r={18 + poof * 16} />
          <circle cx={14} cy={-50} r={16 + poof * 14} />
          <circle cx={4} cy={-28} r={14 + poof * 12} />
        </g>
      )}
    </g>
  );
};

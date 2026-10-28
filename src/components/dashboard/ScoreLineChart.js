"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function ScoreLineChart({ interviews = [] }) {
  const completed = interviews
    .filter((i) => i.status === "completed" && i.summary?.score != null)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const data = completed.map((i, idx) => ({
    name: `Mock #${idx + 1}`,
    score: Math.round(i.summary.score),
    date: new Date(i.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  if (data.length === 0) {
    return (
      <div className="w-full h-56 flex flex-col items-center justify-center gap-2">
        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-xs text-slate-400 font-medium">Complete a mock interview to see your score trend</p>
      </div>
    );
  }

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <defs>
            <linearGradient id="scoreGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00EA64" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00EA64" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E3E7EC" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#6B7684", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#6B7684", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#0E141E",
              border: "1px solid #2A3441",
              borderRadius: "8px",
              color: "#FFFFFF",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#00EA64", fontWeight: "bold" }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#00EA64"
            strokeWidth={2.5}
            fill="url(#scoreGreen)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

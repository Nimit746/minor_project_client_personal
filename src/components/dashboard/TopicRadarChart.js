"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export function TopicRadarChart({ topicScores = [] }) {
  const data = topicScores.length >= 3 ? topicScores : [];

  if (data.length === 0) {
    return (
      <div className="w-full h-56 flex flex-col items-center justify-center gap-2">
        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        <p className="text-xs text-slate-400 font-medium">Complete mock interviews to see your competency breakdown</p>
      </div>
    );
  }

  return (
    <div className="w-full h-56 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#E3E7EC" />
          <PolarAngleAxis
            dataKey="topic"
            tick={{ fill: "#39424E", fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "#6B7684", fontSize: 10 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#00EA64"
            fill="#00EA64"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

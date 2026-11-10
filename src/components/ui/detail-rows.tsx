"use client";
import type { ReactNode } from "react";
export function DetailRows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="cepp-rows">
      {rows.map(([name, value], i) => (
        <div key={i}>
          <dt>{name}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

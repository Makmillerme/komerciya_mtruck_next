"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type KmpPieDatum = { name: string; value: number };

export type KmpChartRow = {
  month: number;
  Тіло: number;
  Відсотки: number;
  Залишок: number;
};

function pieSegmentColor(segmentName: string): string {
  switch (segmentName) {
    case "Аванс":
      return "oklch(0.627 0.194 149.214)";
    case "Тіло кредиту":
      return "oklch(0.205 0 0)";
    case "ПДВ (20%)":
      return "oklch(0.75 0.183 55.934)";
    case "Відсотки по кредиту":
      return "oklch(0.577 0.245 27.325)";
    case "Залишок":
      return "oklch(0.52 0.12 285)";
    case "Разова комісія":
      return "oklch(0.55 0.04 260)";
    default:
      return "oklch(0.55 0 0)";
  }
}

export function KmpPieStructureCard({
  pieData,
  pieTotal,
  formatUah,
  description,
}: {
  pieData: KmpPieDatum[];
  pieTotal: number;
  formatUah: (n: number) => string;
  /** Якщо не задано — текст для режиму з розбиттям ПДВ. */
  description?: string;
}) {
  const desc =
    description ??
    "Діаграма: аванс, тіло та залишок — частка без ПДВ (1/1.2 від відповідних сум), окремо ПДВ 20% від повної вартості ТЗ, комісія та відсотки. Сума сегментів = вартість ТЗ + комісія + відсотки.";
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Структура виплат</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex min-w-0 flex-col items-stretch gap-8 md:flex-row md:items-center">
          <div className="mx-auto h-48 w-48 min-h-48 min-w-48 shrink-0 overflow-hidden md:mx-0">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    isAnimationActive={false}
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={1}
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={pieSegmentColor(entry.name)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatUah(Number(v ?? 0))}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Немає даних для діаграми
              </p>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1 text-sm">
            {pieData.map((entry) => (
              <div
                key={entry.name}
                className="flex justify-between gap-3 border-b border-border py-2 last-of-type:border-b-0"
              >
                <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: pieSegmentColor(entry.name),
                    }}
                  />
                  <span className="truncate">{entry.name}</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-foreground">
                  {formatUah(entry.value)}
                </span>
              </div>
            ))}
            <div className="flex justify-between pt-3">
              <span className="font-semibold">Разом</span>
              <span className="text-lg font-bold tabular-nums">
                {formatUah(pieTotal)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function KmpBarLineChartGrid({
  chartRows,
  formatUah,
}: {
  chartRows: KmpChartRow[];
  formatUah: (n: number) => string;
}) {
  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-2">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">
            Тіло та відсотки по місяцях
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] w-full min-h-0">
          {chartRows.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRows} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    new Intl.NumberFormat("uk-UA", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(Number(v))
                  }
                />
                <Tooltip
                  formatter={(value) => formatUah(Number(value ?? 0))}
                  labelFormatter={(l) => `Місяць ${l}`}
                />
                <Legend />
                <Bar isAnimationActive={false} dataKey="Тіло" stackId="pay" fill="oklch(0.546 0.245 262.881)" />
                <Bar
                  isAnimationActive={false}
                  dataKey="Відсотки"
                  stackId="pay"
                  fill="oklch(0.809 0.105 251.813)"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Заповніть коректні параметри — графік з&apos;явиться тут.
            </p>
          )}
        </CardContent>
      </Card>
      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Залишок боргу</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] w-full min-h-0">
          {chartRows.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartRows} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    new Intl.NumberFormat("uk-UA", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(Number(v))
                  }
                />
                <Tooltip
                  formatter={(value) => formatUah(Number(value ?? 0))}
                  labelFormatter={(l) => `Місяць ${l}`}
                />
                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="Залишок"
                  stroke="oklch(0.205 0 0)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Заповніть коректні параметри — графік з&apos;явиться тут.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


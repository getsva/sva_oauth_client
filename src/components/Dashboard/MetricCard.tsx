import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, MoreVertical } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface MetricCardProps {
  title: string;
  icon?: React.ReactNode;
  /** Main value to show (e.g. total traffic, error count, or "—" for latency) */
  value?: string | number;
  /** Time-series for small chart (timestamp -> value) */
  series?: { timestamp: string; value: number }[];
  /** When true, show "No data" placeholder */
  empty?: boolean;
}

function formatTimestamp(ts: string): string {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return ts.slice(0, 10);
  }
}

export const MetricCard = ({
  title,
  icon,
  value,
  series = [],
  empty = false,
}: MetricCardProps) => {
  const hasChart = series.length > 0;
  const hasValue = value !== undefined && value !== null && value !== "";
  const showEmpty = empty || (!hasChart && !hasValue);

  const chartData = series.map((s) => ({
    date: formatTimestamp(s.timestamp),
    fullDate: s.timestamp,
    value: s.value,
  }));

  const firstDate = chartData[0]?.date ?? "";
  const lastDate = chartData[chartData.length - 1]?.date ?? "";

  return (
    <Card className="p-6 rounded-2xl bg-card/50 border border-border/50 shadow-card">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-base font-medium text-card-foreground">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <TrendingUp className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {showEmpty ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <div className="text-center">
            <svg
              className="w-6 h-6 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm">
              No data is available for the selected time frame.
            </p>
          </div>
        </div>
      ) : (
        <>
          {hasValue && (
            <div className="text-2xl font-semibold tabular-nums text-foreground mb-2">
              {typeof value === "number" ? value.toLocaleString() : value}
            </div>
          )}
          {hasChart && (
            <div className="h-[140px] w-full">
              <ChartContainer
                config={{ value: { label: title } }}
                className="h-full w-full"
              >
                <AreaChart
                  data={chartData}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted/50"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={10}
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          )}
        </>
      )}

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{firstDate || "—"}</span>
          <span>{lastDate || "—"}</span>
        </div>
      </div>
    </Card>
  );
};

import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card className="p-6 rounded-2xl bg-card/50 border border-border/50 shadow-card">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-base font-medium text-card-foreground">{title}</h3>
      </div>
      <div className="text-2xl font-semibold tabular-nums text-foreground">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </Card>
  );
}

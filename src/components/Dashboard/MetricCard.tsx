import { Card } from "@/components/ui/card";
import { MoreVertical, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetricCardProps {
  title: string;
  icon?: React.ReactNode;
}

export const MetricCard = ({ title, icon }: MetricCardProps) => {
  return (
    <Card className="p-6 bg-card border-border">
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

      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <div className="text-center">
          <svg className="w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm">No data is available for the selected time frame.</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>UTC+5:30</span>
          <span>6:00 PM</span>
          <span>Nov 5</span>
          <span>6:00 AM</span>
        </div>
      </div>
    </Card>
  );
};

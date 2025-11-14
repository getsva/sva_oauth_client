import { MetricCard } from "@/components/Dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";

const Dashboard = () => {
  const timeRanges = ["1 hour", "6 hours", "12 hours", "1 day", "2 days", "4 days", "7 days", "14 days", "30 days"];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-normal text-foreground mb-1">APIs & Services</h1>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Enable APIs and services
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg">
          {timeRanges.map((range, index) => (
            <button
              key={range}
              className={`px-3 py-1 text-sm rounded ${
                index === 3
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <MetricCard title="Traffic" />
        <MetricCard title="Errors" />
      </div>

      <div className="grid grid-cols-1">
        <MetricCard title="Median latency" />
      </div>

      <div className="mt-6 flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        <span className="text-sm text-muted-foreground">Filter</span>
      </div>
    </div>
  );
};

export default Dashboard;

import { useState } from "react";
import { Link } from "react-router-dom";
import { MetricCard } from "@/components/Dashboard/MetricCard";
import { StatCard } from "@/components/Dashboard/StatCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  RefreshCw,
  Loader2,
  LogIn,
  Users,
  AlertCircle,
  Key,
  LayoutGrid,
} from "lucide-react";
import { useDashboardUsage } from "@/hooks/useDashboardUsage";
import { Skeleton } from "@/components/ui/skeleton";

const TIME_RANGES = [
  "1 hour",
  "6 hours",
  "12 hours",
  "1 day",
  "2 days",
  "4 days",
  "7 days",
  "14 days",
  "30 days",
] as const;

const Dashboard = () => {
  const [rangeIndex, setRangeIndex] = useState(3); // default "1 day"
  const range = TIME_RANGES[rangeIndex];

  const { data, isLoading, isError, refetch } = useDashboardUsage(range);

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            APIs & Services
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor usage and adoption of your OAuth apps
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
          <Button variant="default" size="lg" asChild>
            <Link to="/credentials">
              <Plus className="w-4 h-4 mr-2" />
              Enable APIs and services
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary: OAuth apps */}
      {data?.summary && (
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="text-sm text-muted-foreground">
            <strong className="text-foreground">
              {data.summary.oauth_apps_count}
            </strong>{" "}
            OAuth app{data.summary.oauth_apps_count !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {TIME_RANGES.map((r, index) => (
          <button
            key={r}
            type="button"
            onClick={() => setRangeIndex(index)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              index === rangeIndex
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {isLoading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Skeleton className="h-[280px] rounded-2xl" />
          <Skeleton className="h-[200px] rounded-2xl" />
          <Skeleton className="h-[200px] rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Developer metrics: New sign-ins, Active sessions, Failed authorizations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <MetricCard
              title="New sign-ins"
              icon={<LogIn className="w-4 h-4 text-muted-foreground" />}
              value={data?.new_sign_ins?.total ?? 0}
              series={data?.new_sign_ins?.series ?? []}
              empty={!data && !isLoading}
            />
            <StatCard
              title="Active sessions"
              value={data?.active_sessions ?? 0}
              description="Currently valid access tokens across all your apps"
              icon={<Users className="w-4 h-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Failed authorizations"
              icon={<AlertCircle className="w-4 h-4 text-muted-foreground" />}
              value={data?.failed_authorizations?.total ?? 0}
              series={[]}
              empty={!data && !isLoading}
            />
          </div>

          {/* Failed auth breakdown when there are failures */}
          {data?.failed_authorizations &&
            data.failed_authorizations.total > 0 && (
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
                {data.failed_authorizations.denied_count > 0 && (
                  <span>
                    <strong className="text-foreground">
                      {data.failed_authorizations.denied_count}
                    </strong>{" "}
                    denied
                  </span>
                )}
                {data.failed_authorizations.expired_count > 0 && (
                  <span>
                    <strong className="text-foreground">
                      {data.failed_authorizations.expired_count}
                    </strong>{" "}
                    expired
                  </span>
                )}
              </div>
            )}

          {/* Usage by app */}
          {data?.usage_by_app && data.usage_by_app.length > 0 && (
            <Card className="mb-6 rounded-2xl border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5" />
                  Usage by app
                </CardTitle>
                <CardDescription>
                  New sign-ins and active sessions per OAuth app in the selected
                  period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>App</TableHead>
                      <TableHead className="text-right">
                        New sign-ins ({range})
                      </TableHead>
                      <TableHead className="text-right">
                        Active sessions now
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.usage_by_app.map((row) => (
                      <TableRow key={row.app_id}>
                        <TableCell className="font-medium">
                          {row.app_name}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.new_sign_ins}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.active_sessions}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Empty state: no apps yet */}
          {data?.summary?.oauth_apps_count === 0 && (
            <Card className="rounded-2xl border border-dashed border-border/50 bg-muted/20">
              <CardContent className="py-10 text-center">
                <Key className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-2">
                  No OAuth apps yet. Create credentials to start
                  seeing usage here.
                </p>
                <Button asChild>
                  <Link to="/credentials">Go to Credentials</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {isError && (
        <p className="text-sm text-destructive mb-4">
          Failed to load usage data. Try refreshing.
        </p>
      )}
    </div>
  );
};

export default Dashboard;

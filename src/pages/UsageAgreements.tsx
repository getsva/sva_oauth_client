import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, RotateCcw, HelpCircle, ChevronDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const UsageAgreements = () => {
  return (
    <div className="">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Usage agreements</h1>
        <p className="text-muted-foreground mt-1">Consent and revoke access for services used by the developer console</p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Button variant="default">
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <Button variant="outline">
          Revoke
        </Button>
      </div>

      <div className="bg-card/50 border border-border/50 rounded-2xl p-4 mb-6 shadow-card">
        <p className="text-sm text-foreground">
          These are agreements you have consented to as a developer so that certain SVA developer console features can send or share data with external systems (for example, analytics, support tools, or integrations). Revoking consent may limit or disable those features. You may revoke your consent at any time using this page.
        </p>
      </div>

      <div className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden shadow-card">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-medium text-foreground">Developer console usage agreements</h2>
        </div>

        <div className="px-6 py-3 border-b border-border flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by agreement or service"
            className="max-w-xs h-8 text-sm bg-transparent border-0 focus-visible:ring-0"
          />
          <HelpCircle className="w-4 h-4 text-muted-foreground ml-auto" />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input type="checkbox" className="rounded border-border" />
              </TableHead>
              <TableHead>Data sharing for</TableHead>
              <TableHead>Setting status</TableHead>
              <TableHead>Status changed by</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Status changed on
                  <ChevronDown className="w-4 h-4" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                You don&apos;t have any usage agreements yet. When you use console features that share data with external systems, they will appear here.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UsageAgreements;

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, RotateCcw, HelpCircle, ChevronDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const UsageAgreements = () => {
  return (
    <div className="">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Page usage agreements</h1>
        <p className="text-muted-foreground mt-1">Consent and revoke access for third-party services</p>
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
          These are agreements you have consented to in order to use pages in the console that send
          information to systems not owned by Google. These are necessary to let you configure a
          managed cloud service provided by an organization other than Google using the console. You
          may revoke your consent at any time using this page.
        </p>
      </div>

      <div className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden shadow-card">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-medium text-foreground">Page usage agreements</h2>
        </div>

        <div className="px-6 py-3 border-b border-border flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Enter property name or value"
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
                This is a feature that is only used by a few products. You are not using any pages that have page use agreement.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UsageAgreements;

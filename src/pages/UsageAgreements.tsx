import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, RotateCcw, HelpCircle, ChevronDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const UsageAgreements = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-normal text-foreground mb-1">Page usage agreements</h1>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <Button variant="outline">
          Revoke
        </Button>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 mb-6">
        <p className="text-sm text-foreground">
          These are agreements you have consented to in order to use pages in the console that send
          information to systems not owned by Google. These are necessary to let you configure a
          managed cloud service provided by an organization other than Google using the console. You
          may revoke your consent at any time using this page.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
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

import { Card } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

interface APICardProps {
  name: string;
  provider: string;
  description: string;
  icon: React.ReactNode;
  isEnterprise?: boolean;
}

export const APICard = ({ name, provider, description, icon, isEnterprise }: APICardProps) => {
  return (
    <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 flex items-center justify-center bg-muted rounded">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-card-foreground">{name}</h3>
            {isEnterprise && (
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{provider}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
};

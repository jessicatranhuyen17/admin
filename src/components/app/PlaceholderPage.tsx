import { Card } from "@/components/ui/card";

export default function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl">{title}</h1>
        {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <Card className="lux-card rounded-3xl p-6">
        <p className="text-sm text-muted-foreground">
          This module is scaffolded. Functionality & data wiring will be implemented next.
        </p>
      </Card>
    </div>
  );
}

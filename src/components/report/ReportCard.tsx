import { Card, CardContent } from "../ui/card";

export const ReportCard = ({ label, value }: { label: string; value: number }) => (
    <Card>
        <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xl font-semibold">{value ? value.toFixed(2) : '0.00'}</p>
        </CardContent>
    </Card>
)
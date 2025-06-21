
import { Candidate } from "@/types/candidate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface PartyChartProps {
  candidates: Candidate[];
}

export function PartyChart({ candidates }: PartyChartProps) {
  // Calculate party distribution
  const partyStats = candidates.reduce((acc, candidate) => {
    acc[candidate.party] = (acc[candidate.party] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convert to chart data format
  const chartData = Object.entries(partyStats).map(([party, count]) => ({
    party: party.length > 15 ? party.substring(0, 15) + "..." : party,
    fullParty: party,
    count,
  }));

  const chartConfig = {
    count: {
      label: "Candidates",
      color: "hsl(var(--primary))",
    },
  };

  if (candidates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Party Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500">
            No candidates to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Party Distribution ({candidates.length} total candidates)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <XAxis 
              dataKey="party" 
              angle={-45}
              textAnchor="end"
              height={60}
              fontSize={12}
            />
            <YAxis />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value, name, props) => [
                `${value} candidates`,
                props.payload?.fullParty || name
              ]}
            />
            <Bar 
              dataKey="count" 
              fill="var(--color-count)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

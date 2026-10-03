import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Typography } from '@mui/material';

export interface StatusBarChartDatum {
    label: string;
    value: number;
    color?: string;
}

interface StatusBarChartProps {
    data: StatusBarChartDatum[];
    height?: number;
    color?: string;
    onBarClick?: (label: string) => void;
    valueFormatter?: (value: number | null) => string;
}

export default function StatusBarChart({ data, height = 220, color = '#007fff', onBarClick, valueFormatter }: StatusBarChartProps) {
    if (!data.length) {
        return <Typography variant="body2" color="text.secondary">No data</Typography>;
    }

    const categories = data.map((d) => d.label);
    const perBarColors = data.some((d) => d.color);

    const series = perBarColors
        ? data.map((d, i) => ({
              id: d.label,
              data: data.map((_, j) => (j === i ? d.value : null)),
              color: d.color || color,
              valueFormatter,
          }))
        : [
              {
                  id: 'value',
                  data: data.map((d) => d.value),
                  color,
                  valueFormatter,
              },
          ];

    return (
        <Box sx={{ width: '100%', height }}>
            <BarChart
                layout="horizontal"
                series={series}
                yAxis={[{ data: categories, scaleType: 'band' }]}
                height={height}
                margin={{ left: 120, right: 20, top: 10, bottom: 30 }}
                slotProps={{ legend: { hidden: true } }}
                onItemClick={(_event, itemIdentifier) => {
                    if (!onBarClick) return;
                    onBarClick(categories[itemIdentifier.dataIndex]);
                }}
            />
        </Box>
    );
}

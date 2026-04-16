import { theme } from 'antd';
import type { EChartsOption } from 'echarts';
import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { GpuHoursByCategoryDto } from '../../../mocks/dashboardData';

interface GpuHoursByCategoryChartProps {
  data: GpuHoursByCategoryDto[];
  height?: number;
}

export function GpuHoursByCategoryChart({ data, height = 280 }: GpuHoursByCategoryChartProps) {
  const { token } = theme.useToken();

  const option = useMemo<EChartsOption>(() => {
    const text = token.colorText;
    const textSecondary = token.colorTextSecondary;
    const border = token.colorBorderSecondary;

    const palette = [token.colorPrimary, token.colorSuccess, token.colorWarning, token.colorInfo, token.colorError];

    return {
      textStyle: { color: text },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: token.colorBgElevated,
        borderColor: token.colorBorder,
        textStyle: { color: text },
      },
      grid: { left: 160, right: 24, top: 16, bottom: 32 },
      xAxis: {
        type: 'value',
        name: 'GPU-hours',
        nameTextStyle: { color: textSecondary },
        axisLine: { lineStyle: { color: border } },
        axisLabel: { color: textSecondary },
        splitLine: { lineStyle: { color: border, type: 'dashed' } },
      },
      yAxis: {
        type: 'category',
        data: data.map((d) => d.category),
        axisLine: { lineStyle: { color: border } },
        axisLabel: { color: textSecondary, width: 150, overflow: 'truncate' },
      },
      series: [
        {
          name: 'GPU-hours',
          type: 'bar',
          data: data.map((d, i) => ({
            value: d.gpuHours,
            itemStyle: { color: palette[i % palette.length] },
          })),
          barMaxWidth: 28,
        },
      ],
    };
  }, [data, token]);

  return (
    <ReactECharts
      option={option}
      style={{ height, width: '100%' }}
      notMerge
      lazyUpdate
      opts={{ renderer: 'canvas' }}
    />
  );
}

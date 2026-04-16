import { theme } from 'antd';
import type { EChartsOption } from 'echarts';
import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { DevHomeResourceTotalsDto } from '../../../mocks/homeData';

interface PortfolioResourceTotalsChartProps {
  totals: DevHomeResourceTotalsDto;
  height?: number;
}

/** Org-level counts across all projects (Dev home) — distinct from per-project dashboard training charts. */
export function PortfolioResourceTotalsChart({ totals, height = 260 }: PortfolioResourceTotalsChartProps) {
  const { token } = theme.useToken();

  const option = useMemo<EChartsOption>(() => {
    const text = token.colorText;
    const textSecondary = token.colorTextSecondary;
    const border = token.colorBorderSecondary;
    const categories = ['Datasets', 'Models', 'Running jobs'];
    const values = [totals.datasets, totals.models, totals.runningJobs];
    const palette = [token.colorPrimary, token.colorSuccess, token.colorWarning];

    return {
      textStyle: { color: text },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: token.colorBgElevated,
        borderColor: token.colorBorder,
        textStyle: { color: text },
      },
      grid: { left: 48, right: 24, top: 24, bottom: 32 },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: border } },
        axisLabel: { color: textSecondary },
      },
      yAxis: {
        type: 'value',
        name: 'Count',
        minInterval: 1,
        nameTextStyle: { color: textSecondary },
        axisLine: { show: true, lineStyle: { color: border } },
        axisLabel: { color: textSecondary },
        splitLine: { lineStyle: { color: border, type: 'dashed' } },
      },
      series: [
        {
          name: 'Total',
          type: 'bar',
          data: values.map((v, i) => ({
            value: v,
            itemStyle: { color: palette[i % palette.length] },
          })),
          barMaxWidth: 48,
        },
      ],
    };
  }, [totals, token]);

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

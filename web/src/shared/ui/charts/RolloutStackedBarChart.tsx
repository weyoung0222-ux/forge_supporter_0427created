import { theme } from 'antd';
import type { EChartsOption } from 'echarts';
import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { SimulationRolloutStatDto } from '../../../mocks/dashboardData';

interface RolloutStackedBarChartProps {
  data: SimulationRolloutStatDto[];
  height?: number;
}

/** Stacked bar: successful vs failed simulation episodes per day (second dashboard chart). */
export function RolloutStackedBarChart({ data, height = 260 }: RolloutStackedBarChartProps) {
  const { token } = theme.useToken();

  const option = useMemo<EChartsOption>(() => {
    const text = token.colorText;
    const textSecondary = token.colorTextSecondary;
    const border = token.colorBorderSecondary;

    return {
      color: [token.colorSuccess, token.colorError],
      textStyle: { color: text },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: token.colorBgElevated,
        borderColor: token.colorBorder,
        textStyle: { color: text },
      },
      legend: {
        data: ['Success episodes', 'Failure episodes'],
        textStyle: { color: textSecondary },
        bottom: 0,
      },
      grid: { left: 40, right: 16, top: 16, bottom: 48 },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.day),
        axisLine: { lineStyle: { color: border } },
        axisLabel: { color: textSecondary },
      },
      yAxis: {
        type: 'value',
        name: 'Episodes',
        nameTextStyle: { color: textSecondary },
        axisLine: { show: true, lineStyle: { color: border } },
        axisLabel: { color: textSecondary },
        splitLine: { lineStyle: { color: border, type: 'dashed' } },
      },
      series: [
        {
          name: 'Success episodes',
          type: 'bar',
          stack: 'rollout',
          data: data.map((d) => d.successEpisodes),
        },
        {
          name: 'Failure episodes',
          type: 'bar',
          stack: 'rollout',
          data: data.map((d) => d.failureEpisodes),
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

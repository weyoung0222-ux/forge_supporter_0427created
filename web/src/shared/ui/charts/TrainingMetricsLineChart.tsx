import { theme } from 'antd';
import type { EChartsOption } from 'echarts';
import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { TrainingEpochMetricDto } from '../../../mocks/dashboardData';

interface TrainingMetricsLineChartProps {
  data: TrainingEpochMetricDto[];
  height?: number;
}

export function TrainingMetricsLineChart({ data, height = 280 }: TrainingMetricsLineChartProps) {
  const { token } = theme.useToken();

  const option = useMemo<EChartsOption>(() => {
    const text = token.colorText;
    const textSecondary = token.colorTextSecondary;
    const border = token.colorBorderSecondary;
    const primary = token.colorPrimary;
    const success = token.colorSuccess;

    return {
      color: [primary, success],
      textStyle: { color: text },
      tooltip: {
        trigger: 'axis',
        backgroundColor: token.colorBgElevated,
        borderColor: token.colorBorder,
        textStyle: { color: text },
      },
      legend: {
        data: ['Mean episode reward', 'Eval success rate (%)'],
        textStyle: { color: textSecondary },
        bottom: 0,
      },
      grid: { left: 48, right: 48, top: 24, bottom: 56 },
      xAxis: {
        type: 'category',
        name: 'Epoch',
        nameTextStyle: { color: textSecondary },
        data: data.map((d) => d.epoch),
        axisLine: { lineStyle: { color: border } },
        axisLabel: { color: textSecondary },
        splitLine: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Reward',
          min: 0,
          max: 1,
          nameTextStyle: { color: textSecondary },
          axisLine: { show: true, lineStyle: { color: border } },
          axisLabel: { color: textSecondary },
          splitLine: { lineStyle: { color: border, type: 'dashed' } },
        },
        {
          type: 'value',
          name: 'Success %',
          min: 0,
          max: 100,
          nameTextStyle: { color: textSecondary },
          axisLine: { show: true, lineStyle: { color: border } },
          axisLabel: { color: textSecondary },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'Mean episode reward',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: data.map((d) => Number(d.meanEpisodeReward.toFixed(3))),
        },
        {
          name: 'Eval success rate (%)',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          showSymbol: false,
          data: data.map((d) => Number(d.evalSuccessRatePct.toFixed(1))),
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

export interface HealthIndicatorProps {
  score: number | null | undefined;
  label?: string;
}

function toneClass(score: number): string {
  if (score >= 80) return 'robot-op-health--good';
  if (score >= 50) return 'robot-op-health--warn';
  return 'robot-op-health--bad';
}

export function HealthIndicator({ score, label }: HealthIndicatorProps) {
  if (score == null) {
    return <span className="robot-op-health robot-op-health--empty">—</span>;
  }
  return (
    <span className={`robot-op-health ${toneClass(score)}`} title={label}>
      <span className="robot-op-health__value">{score}</span>
    </span>
  );
}

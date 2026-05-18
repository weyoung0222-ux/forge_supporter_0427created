import { Typography } from 'antd';

export interface EmptyTaskGroupStateProps {
  message: string;
}

export function EmptyTaskGroupState({ message }: EmptyTaskGroupStateProps) {
  return (
    <div className="task-resource-group__empty">
      <Typography.Text type="secondary">{message}</Typography.Text>
    </div>
  );
}

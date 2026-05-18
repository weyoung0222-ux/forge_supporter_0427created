import { Tag, Typography } from 'antd';
import type { MenuProps } from 'antd';
import type { SupportTaskDto } from '../../../mocks/supportTasksMock';
import { TaskActionsMenu } from './TaskActionsMenu';

function statusTagClass(status: SupportTaskDto['status']): string {
  if (status === 'active') return 'task-resource-row__status--active';
  if (status === 'done') return 'task-resource-row__status--done';
  return 'task-resource-row__status--draft';
}

export interface TaskItemRowProps {
  task: SupportTaskDto;
  statusLabel: (s: SupportTaskDto['status']) => string;
  modalityLabel: string;
  updatedLabel: string;
  menuAria: string;
  onOpen: () => void;
  menu: MenuProps;
}

export function TaskItemRow({ task, statusLabel, modalityLabel, updatedLabel, menuAria, onOpen, menu }: TaskItemRowProps) {
  return (
    <div
      className="task-resource-row"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="task-resource-row__main">
        <Typography.Text strong className="task-resource-row__title" ellipsis>
          {task.title}
        </Typography.Text>
        <Typography.Text type="secondary" className="task-resource-row__key" ellipsis>
          {task.subtypeCode}
        </Typography.Text>
        <Typography.Paragraph type="secondary" className="task-resource-row__desc" ellipsis={{ rows: 1 }}>
          {task.subtitle || task.taskDescription}
        </Typography.Paragraph>
      </div>

      <div className="task-resource-row__meta">
        <Tag bordered={false} className={`task-resource-row__status ${statusTagClass(task.status)}`}>
          {statusLabel(task.status)}
        </Tag>
        <Typography.Text type="secondary" className="task-resource-row__meta-item" ellipsis title={task.requiredModality}>
          {modalityLabel}: {task.requiredModality}
        </Typography.Text>
        <Typography.Text type="secondary" className="task-resource-row__meta-item" ellipsis>
          {updatedLabel}: {task.updatedAt}
        </Typography.Text>
      </div>

      <div className="task-resource-row__actions" onClick={(e) => e.stopPropagation()} role="presentation">
        <TaskActionsMenu menu={menu} ariaLabel={menuAria} />
      </div>
    </div>
  );
}

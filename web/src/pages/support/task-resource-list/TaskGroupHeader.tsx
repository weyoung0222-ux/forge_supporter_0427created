import { DeleteOutlined, DownOutlined, EditOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { Tag, Typography } from 'antd';
import type { MenuProps } from 'antd';
import type { SupportTaskTypeRef } from '../../../mocks/supportTasksMock';
import { TaskActionsMenu } from './TaskActionsMenu';

export interface TaskGroupHeaderProps {
  group: SupportTaskTypeRef;
  taskCountChip: string;
  expanded: boolean;
  kindLabel: string;
  disabledLabel: string;
  editGroupLabel: string;
  deleteGroupLabel: string;
  addTaskLabel: string;
  menuAria: string;
  onToggle: () => void;
  onEditGroup: () => void;
  onDeleteGroup: () => void;
  onAddTask: () => void;
}

export function TaskGroupHeader({
  group,
  taskCountChip,
  expanded,
  kindLabel,
  disabledLabel,
  editGroupLabel,
  deleteGroupLabel,
  addTaskLabel,
  menuAria,
  onToggle,
  onEditGroup,
  onDeleteGroup,
  onAddTask,
}: TaskGroupHeaderProps) {
  const metaParts: string[] = [kindLabel];
  if (group.description) metaParts.push(group.description);

  const groupMenu: MenuProps = {
    items: [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: editGroupLabel,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          onEditGroup();
        },
      },
      {
        key: 'add',
        icon: <PlusOutlined />,
        label: addTaskLabel,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          onAddTask();
        },
      },
      { type: 'divider' },
      {
        key: 'delete',
        danger: true,
        icon: <DeleteOutlined />,
        label: deleteGroupLabel,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          onDeleteGroup();
        },
      },
    ],
  };

  return (
    <div className={`task-resource-group-header ${expanded ? 'is-expanded' : 'is-collapsed'}`}>
      <button type="button" className="task-resource-group-header__toggle" onClick={onToggle} aria-expanded={expanded}>
        <span className="task-resource-group-header__chevron" aria-hidden>
          {expanded ? <DownOutlined /> : <RightOutlined />}
        </span>
        <span className="task-resource-group-header__identity">
          <span className="task-resource-group-header__title-row">
            <Typography.Text strong className="task-resource-group-header__title">
              {group.name}
            </Typography.Text>
            <Tag bordered={false} color="default" className="task-resource-group-header__count-chip">
              {taskCountChip}
            </Tag>
          </span>
          <Typography.Text type="secondary" className="task-resource-group-header__code">
            {group.code}
            {!group.enabled ? ` · ${disabledLabel}` : ''}
          </Typography.Text>
          <Typography.Text type="secondary" className="task-resource-group-header__summary">
            {metaParts.join(' · ')}
          </Typography.Text>
        </span>
      </button>

      <div className="task-resource-group-header__actions" onClick={(e) => e.stopPropagation()} role="presentation">
        <TaskActionsMenu menu={groupMenu} ariaLabel={menuAria} className="task-resource-group-header__menu" />
      </div>
    </div>
  );
}

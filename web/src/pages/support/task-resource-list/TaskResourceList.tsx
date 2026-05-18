import { useCallback, useState } from 'react';
import type { MenuProps } from 'antd';
import type { SupportTaskDto } from '../../../mocks/supportTasksMock';
import { TaskGroupSection } from './TaskGroupSection';
import type { TaskGroupBlock } from './types';
import './task-resource-list.css';

export interface TaskResourceListLabels {
  kindLabel: (kind: string) => string;
  taskCountChip: (n: number) => string;
  emptyGroupMessage: string;
  disabledLabel: string;
  editGroupLabel: string;
  deleteGroupLabel: string;
  addTaskLabel: string;
  statusLabel: (s: SupportTaskDto['status']) => string;
  modalityLabel: string;
  updatedLabel: string;
  menuAria: string;
}

export interface TaskResourceListProps {
  groups: TaskGroupBlock[];
  labels: TaskResourceListLabels;
  onEditGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string, groupName: string) => void;
  onAddTask: (groupId: string) => void;
  onOpenTask: (id: string) => void;
  menuForTask: (task: SupportTaskDto) => MenuProps;
}

export function TaskResourceList({
  groups,
  labels,
  onEditGroup,
  onDeleteGroup,
  onAddTask,
  onOpenTask,
  menuForTask,
}: TaskResourceListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const isExpanded = useCallback((id: string) => expanded.has(id), [expanded]);

  const toggleGroup = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="task-resource-list">
      {groups.map((block) => (
        <TaskGroupSection
          key={block.group.id}
          block={block}
          expanded={isExpanded(block.group.id)}
          kindLabel={labels.kindLabel(block.group.kind)}
          taskCountChip={labels.taskCountChip}
          emptyGroupMessage={labels.emptyGroupMessage}
          disabledLabel={labels.disabledLabel}
          editGroupLabel={labels.editGroupLabel}
          deleteGroupLabel={labels.deleteGroupLabel}
          addTaskLabel={labels.addTaskLabel}
          statusLabel={labels.statusLabel}
          modalityLabel={labels.modalityLabel}
          updatedLabel={labels.updatedLabel}
          menuAria={labels.menuAria}
          onToggle={() => toggleGroup(block.group.id)}
          onEditGroup={() => onEditGroup(block.group.id)}
          onDeleteGroup={() => onDeleteGroup(block.group.id, block.group.name)}
          onAddTask={() => onAddTask(block.group.id)}
          onOpenTask={onOpenTask}
          menuForTask={menuForTask}
        />
      ))}
    </div>
  );
}

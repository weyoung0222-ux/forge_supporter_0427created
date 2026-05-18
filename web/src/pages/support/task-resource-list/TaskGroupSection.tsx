import type { MenuProps } from 'antd';
import type { SupportTaskDto } from '../../../mocks/supportTasksMock';
import { EmptyTaskGroupState } from './EmptyTaskGroupState';
import { TaskGroupHeader } from './TaskGroupHeader';
import { TaskItemRow } from './TaskItemRow';
import type { TaskGroupBlock } from './types';

export interface TaskGroupSectionProps {
  block: TaskGroupBlock;
  expanded: boolean;
  kindLabel: string;
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
  onToggle: () => void;
  onEditGroup: () => void;
  onDeleteGroup: () => void;
  onAddTask: () => void;
  onOpenTask: (id: string) => void;
  menuForTask: (task: SupportTaskDto) => MenuProps;
}

export function TaskGroupSection({
  block,
  expanded,
  kindLabel,
  taskCountChip,
  emptyGroupMessage,
  disabledLabel,
  editGroupLabel,
  deleteGroupLabel,
  addTaskLabel,
  statusLabel,
  modalityLabel,
  updatedLabel,
  menuAria,
  onToggle,
  onEditGroup,
  onDeleteGroup,
  onAddTask,
  onOpenTask,
  menuForTask,
}: TaskGroupSectionProps) {
  const { group, tasks } = block;

  return (
    <section className="task-resource-group" aria-labelledby={`task-resource-group-${group.id}`}>
      <TaskGroupHeader
        group={group}
        taskCountChip={taskCountChip(tasks.length)}
        expanded={expanded}
        kindLabel={kindLabel}
        disabledLabel={disabledLabel}
        editGroupLabel={editGroupLabel}
        deleteGroupLabel={deleteGroupLabel}
        addTaskLabel={addTaskLabel}
        menuAria={menuAria}
        onToggle={onToggle}
        onEditGroup={onEditGroup}
        onDeleteGroup={onDeleteGroup}
        onAddTask={onAddTask}
      />

      <div className={`task-resource-group__body ${expanded ? 'is-expanded' : 'is-collapsed'}`}>
        <div className="task-resource-group__body-inner" id={`task-resource-group-${group.id}`}>
          {tasks.length === 0 ? (
            <EmptyTaskGroupState message={emptyGroupMessage} />
          ) : (
            tasks.map((task) => (
              <TaskItemRow
                key={task.id}
                task={task}
                statusLabel={statusLabel}
                modalityLabel={modalityLabel}
                updatedLabel={updatedLabel}
                menuAria={menuAria}
                onOpen={() => onOpenTask(task.id)}
                menu={menuForTask(task)}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

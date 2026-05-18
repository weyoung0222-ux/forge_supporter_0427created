import { App, Button, Empty, Input, Select, Space, Tag, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getSupportTaskTypesCatalog,
  getSupportTasksMock,
  type SupportTaskDto,
  type SupportTaskGroupKind,
  type SupportTaskTypeRef,
} from '../../mocks/supportTasksMock';
import { supportRobotWorkspaceDetailPath, supportRobotWorkspaceEditPath } from '../../shared/config/supportPaths';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import { matchesSearchQuery } from '../../shared/lib/listQuery';
import { useDescriptionScreen } from '../../shared/ui/common/DescriptionModeProvider';
import '../dev/dev-data-foundry-page.css';
import { CreateRobotTaskTypeModal } from './robot-create/CreateRobotTaskTypeModal';
import { EditRobotTaskTypeModal } from './robot-create/EditRobotTaskTypeModal';
import { TaskResourceList, type TaskGroupBlock } from './task-resource-list';
import './support-tasks-page.css';

type SortKey = 'recent' | 'oldest' | 'nameAsc' | 'nameDesc';

const KIND_ORDER: SupportTaskGroupKind[] = ['Manipulation', 'Locomotion', 'Sensing', 'Compute'];

function kindTranslationKey(kind: SupportTaskGroupKind): string {
  switch (kind) {
    case 'Manipulation':
      return 'support.robot.definition.filter.deviceClass.manipulation';
    case 'Locomotion':
      return 'support.robot.definition.filter.deviceClass.locomotion';
    case 'Sensing':
      return 'support.robot.definition.filter.deviceClass.sensing';
    case 'Compute':
      return 'support.robot.definition.filter.deviceClass.compute';
    default:
      return 'support.robot.definition.filter.deviceClass.sensing';
  }
}

function haystack(row: SupportTaskDto): string {
  return `${row.title} ${row.subtitle} ${row.subtypeCode} ${row.taskType.name} ${row.taskType.code} ${row.taskType.kind} ${row.taskDescription}`;
}

function filterByKind(list: SupportTaskDto[], facet: string): SupportTaskDto[] {
  if (facet === 'all') return list;
  return list.filter((r) => r.taskType.kind === facet);
}

function sortRows(list: SupportTaskDto[], sortKey: SortKey): SupportTaskDto[] {
  const next = [...list];
  switch (sortKey) {
    case 'recent':
      return next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case 'oldest':
      return next.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
    case 'nameAsc':
      return next.sort((a, b) => a.title.localeCompare(b.title, 'en'));
    case 'nameDesc':
      return next.sort((a, b) => b.title.localeCompare(a.title, 'en'));
    default:
      return next;
  }
}

function groupTasksByTaskType(tasks: SupportTaskDto[]): TaskGroupBlock[] {
  const map = new Map<string, SupportTaskDto[]>();
  const order: string[] = [];
  for (const row of tasks) {
    const id = row.taskType.id;
    if (!map.has(id)) {
      map.set(id, []);
      order.push(id);
    }
    map.get(id)!.push(row);
  }
  return order.map((id) => {
    const list = map.get(id)!;
    return { group: { ...list[0].taskType }, tasks: list };
  });
}

function mergeOrphanGroups(blocks: TaskGroupBlock[], catalog: SupportTaskTypeRef[], facet: string, includeEmpty: boolean): TaskGroupBlock[] {
  if (!includeEmpty) return blocks;
  const existing = new Set(blocks.map((b) => b.group.id));
  const orphans = catalog
    .filter((t) => (facet === 'all' ? true : t.kind === facet))
    .filter((t) => !existing.has(t.id))
    .map((group) => ({ group: { ...group }, tasks: [] as SupportTaskDto[] }));
  return [...blocks, ...orphans].sort((a, b) => a.group.name.localeCompare(b.group.name, 'en'));
}

export interface SupportTasksPageProps {
  screenId: string;
  titleKey: string;
  leadKey: string;
}

export function SupportTasksPage({ screenId, titleKey, leadKey }: SupportTasksPageProps) {
  const { t, locale } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [listTick, setListTick] = useState(0);
  const items = useMemo(() => getSupportTasksMock(), [listTick]);
  const catalog = useMemo(() => getSupportTaskTypesCatalog(), [listTick]);

  const [search, setSearch] = useState('');
  const [facetFilter, setFacetFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('recent');

  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [editGroupTargetId, setEditGroupTargetId] = useState<string | undefined>(undefined);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createTaskGroupId, setCreateTaskGroupId] = useState<string | undefined>(undefined);

  const sortOptions = useMemo(
    (): { value: SortKey; label: string }[] => [
      { value: 'recent', label: t('library.sort.recent') },
      { value: 'oldest', label: t('library.sort.oldest') },
      { value: 'nameAsc', label: t('library.sort.nameAsc') },
      { value: 'nameDesc', label: t('library.sort.nameDesc') },
    ],
    [t, locale],
  );

  const kindFilterOptions = useMemo(
    (): { value: string; label: string }[] => [
      { value: 'all', label: t('support.robot.task.filter.kind.all') },
      ...KIND_ORDER.map((k) => ({ value: k, label: t(kindTranslationKey(k)) })),
    ],
    [t],
  );

  const filteredItems = useMemo(() => {
    let list: SupportTaskDto[] = [...items];
    if (search.trim()) {
      list = list.filter((row) => matchesSearchQuery(haystack(row), search));
    }
    list = filterByKind(list, facetFilter);
    return sortRows(list, sortKey);
  }, [items, search, facetFilter, sortKey]);

  const groupedTasks = useMemo(() => {
    const grouped = groupTasksByTaskType(filteredItems);
    return mergeOrphanGroups(grouped, catalog, facetFilter, !search.trim());
  }, [filteredItems, catalog, facetFilter, search]);

  const descriptionMeta = useMemo(
    () => ({
      screenName: 'Robot Support — Task',
      screenId,
      screenDescription: 'Robot Task Type 관리 — Task Group 섹션과 그 안의 Task 리소스 행으로 구성됩니다.',
      areas: [
        {
          id: 'task-list-heading',
          name: '섹션 헤더',
          role: 'Title + counts + New Task Group / Edit Task Group',
          userAction: 'Task group 생성·편집',
          linkedScreen: '—',
        },
        {
          id: 'task-toolbar',
          name: '툴바',
          role: '검색·도메인 필터·정렬',
          userAction: '검색·필터',
          linkedScreen: '—',
        },
        {
          id: 'task-list',
          name: 'Task group 목록',
          role: 'Group header + task rows',
          userAction: '항목 선택·그룹별 Add Task',
          linkedScreen: '상세',
        },
      ],
    }),
    [screenId],
  );

  const { bindArea } = useDescriptionScreen(descriptionMeta);

  const openNewTaskGroup = () => {
    setEditGroupTargetId('__new__');
    setEditGroupOpen(true);
  };

  const openEditTaskGroup = (groupId?: string) => {
    setEditGroupTargetId(groupId);
    setEditGroupOpen(true);
  };

  const openAddTask = (groupId: string) => {
    setCreateTaskGroupId(groupId);
    setCreateTaskOpen(true);
  };

  const menuForRow = (row: SupportTaskDto): MenuProps => ({
    items: [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: t('support.robot.definition.card.edit'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          navigate(supportRobotWorkspaceEditPath('task', row.id));
        },
      },
      { type: 'divider' },
      {
        key: 'delete',
        danger: true,
        icon: <DeleteOutlined />,
        label: t('support.robot.definition.card.delete'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          message.warning(`${t('support.robot.definition.card.deleteDemoPrefix')}${row.title}`);
        },
      },
    ],
  });

  const taskGroupCount = groupedTasks.length;
  const badgeGroupsLabel = t('support.robot.task.badge.taskGroups').replace('{n}', String(taskGroupCount));
  const listHeadAria = `${t('support.robot.definition.section.countAria')}: ${badgeGroupsLabel}`;

  const listLabels = useMemo(
    () => ({
      kindLabel: (kind: string) => t(kindTranslationKey(kind as SupportTaskGroupKind)),
      taskCountChip: (n: number) => t('support.robot.task.taskCount').replace('{n}', String(n)),
      emptyGroupMessage: t('support.robot.task.emptyGroup'),
      disabledLabel: t('support.robot.task.typeDisabled'),
      editGroupLabel: t('support.robot.task.editGroup'),
      deleteGroupLabel: t('support.robot.task.deleteGroup'),
      addTaskLabel: t('support.robot.task.addTask'),
      statusLabel: (s: SupportTaskDto['status']) => {
        if (s === 'active') return t('support.robot.task.status.active');
        if (s === 'done') return t('support.robot.task.status.done');
        return t('support.robot.task.status.draft');
      },
      modalityLabel: t('support.robot.task.modality'),
      updatedLabel: t('support.robot.task.updated'),
      menuAria: t('support.robot.definition.card.menuAria'),
    }),
    [t],
  );

  const refreshList = useCallback(() => setListTick((n) => n + 1), []);

  return (
    <div className="support-task-page support-workspace-page dev-data-foundry">
      <div className="support-task-page__stack">
        <div className="dev-data-foundry-header support-task-page__header" {...bindArea('task-list-heading')}>
          <div>
            <Space align="center" wrap className="support-workspace-title-line" size={8} aria-label={listHeadAria}>
              <Typography.Title level={3} className="dev-data-foundry-title domain-content-title" style={{ margin: 0 }}>
                {t(titleKey)}
              </Typography.Title>
              <Tag bordered={false} color="default">
                {badgeGroupsLabel}
              </Tag>
            </Space>
            <Typography.Paragraph type="secondary" className="domain-1depth-page-lead">
              {t(leadKey)}
            </Typography.Paragraph>
          </div>
          <Space align="center" size={8} wrap={false} className="support-task-page__header-actions">
            <Button type="primary" onClick={openNewTaskGroup}>
              {t('support.robot.ui.createPlus')}
            </Button>
          </Space>
        </div>

        <div className="dev-data-foundry-toolbar-sticky" style={{ position: 'static', paddingTop: 0, marginBottom: 12 }}>
          <div className="dev-data-foundry-toolbar" {...bindArea('task-toolbar')}>
            <Input
              allowClear
              className="dev-data-foundry-search forge-search-input"
              placeholder={t('support.robot.task.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t('support.robot.task.search.aria')}
            />
            <Select<string>
              value={facetFilter}
              onChange={setFacetFilter}
              options={kindFilterOptions}
              style={{ minWidth: 200 }}
              popupMatchSelectWidth={false}
              aria-label={t('support.robot.task.filter.kind.aria')}
            />
            <div className="dev-data-foundry-toolbar-spacer">
              <Select<SortKey>
                value={sortKey}
                onChange={(v) => setSortKey(v)}
                options={sortOptions}
                style={{ minWidth: 200 }}
                popupMatchSelectWidth={false}
                aria-label={t('support.robot.definition.sort.aria')}
              />
            </div>
          </div>
        </div>

        <div {...bindArea('task-list')}>
          {groupedTasks.length === 0 ? (
            <Empty description={t('support.robot.task.empty')} />
          ) : (
            <TaskResourceList
              groups={groupedTasks}
              labels={listLabels}
              onEditGroup={(id) => openEditTaskGroup(id)}
              onDeleteGroup={(_id, name) => {
                message.warning(`${t('support.robot.definition.card.deleteDemoPrefix')}${name}`);
              }}
              onAddTask={openAddTask}
              onOpenTask={(id) => navigate(supportRobotWorkspaceDetailPath('task', id))}
              menuForTask={menuForRow}
            />
          )}
        </div>
      </div>

      <EditRobotTaskTypeModal
        open={editGroupOpen}
        initialTargetId={editGroupTargetId}
        onClose={() => {
          setEditGroupOpen(false);
          setEditGroupTargetId(undefined);
        }}
        onSaved={() => {
          refreshList();
          setEditGroupOpen(false);
          setEditGroupTargetId(undefined);
        }}
      />

      <CreateRobotTaskTypeModal
        open={createTaskOpen}
        layout="modal"
        initialTaskTypeId={createTaskGroupId}
        onClose={() => {
          setCreateTaskOpen(false);
          setCreateTaskGroupId(undefined);
        }}
        onCreated={() => {
          refreshList();
          setCreateTaskOpen(false);
          setCreateTaskGroupId(undefined);
        }}
      />
    </div>
  );
}

import {
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { App, Button, Card, Dropdown, Empty, Input, Select, Space, Tag, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supportRobotWorkspaceDetailPath } from '../../shared/config/supportPaths';
import {
  getSupportTasksMock,
  type SupportTaskDto,
  type SupportTaskGroupKind,
} from '../../mocks/supportTasksMock';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import { matchesSearchQuery } from '../../shared/lib/listQuery';
import { useDescriptionScreen } from '../../shared/ui/common/DescriptionModeProvider';
import '../dev/dev-data-foundry-page.css';
import { CreateRobotTaskGroupModal } from './robot-create/CreateRobotTaskGroupModal';
import { CreateRobotTaskTypeModal } from './robot-create/CreateRobotTaskTypeModal';
import './support-definition-cards-page.css';
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

function kindTagColor(kind: SupportTaskGroupKind): string {
  switch (kind) {
    case 'Manipulation':
      return 'orange';
    case 'Locomotion':
      return 'blue';
    case 'Sensing':
      return 'green';
    case 'Compute':
      return 'purple';
    default:
      return 'default';
  }
}

function haystack(row: SupportTaskDto): string {
  return `${row.title} ${row.subtitle} ${row.projectName} ${row.taskGroup.name} ${row.taskGroup.kind}`;
}

function filterByKind(list: SupportTaskDto[], facet: string): SupportTaskDto[] {
  if (facet === 'all') {
    return list;
  }
  return list.filter((r) => r.taskGroup.kind === facet);
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

function statusLabelKey(status: SupportTaskDto['status']): string {
  switch (status) {
    case 'draft':
      return 'support.robot.task.status.draft';
    case 'active':
      return 'support.robot.task.status.active';
    case 'done':
      return 'support.robot.task.status.done';
    default:
      return 'support.robot.task.status.draft';
  }
}

function statusTagColor(status: SupportTaskDto['status']): string {
  switch (status) {
    case 'draft':
      return 'default';
    case 'active':
      return 'processing';
    case 'done':
      return 'success';
    default:
      return 'default';
  }
}

/** Preserve first-seen order of groups after sort/filter (each group header shown once). */
function groupTasksByTaskGroup(tasks: SupportTaskDto[]): { group: SupportTaskDto['taskGroup']; tasks: SupportTaskDto[] }[] {
  const map = new Map<string, SupportTaskDto[]>();
  const order: string[] = [];
  for (const row of tasks) {
    const id = row.taskGroup.id;
    if (!map.has(id)) {
      map.set(id, []);
      order.push(id);
    }
    map.get(id)!.push(row);
  }
  return order.map((id) => {
    const list = map.get(id)!;
    return { group: list[0].taskGroup, tasks: list };
  });
}

export interface SupportTasksPageProps {
  screenId: string;
  titleKey: string;
  leadKey: string;
}

export function SupportTasksPage({ screenId, titleKey, leadKey }: SupportTasksPageProps) {
  const { token } = theme.useToken();
  const { t, locale } = useLocale();
  const { message } = App.useApp();
  const [listTick, setListTick] = useState(0);
  const items = useMemo(() => getSupportTasksMock(), [listTick]);

  const [search, setSearch] = useState('');
  const [taskTypeOpen, setTaskTypeOpen] = useState(false);
  const [taskGroupOpen, setTaskGroupOpen] = useState(false);
  const [facetFilter, setFacetFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('recent');

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

  const groupedTasks = useMemo(() => groupTasksByTaskGroup(filteredItems), [filteredItems]);

  const descriptionMeta = useMemo(
    () => ({
      screenName: 'Robot Support — Task',
      screenId,
      screenDescription:
        '지원 워크스페이스 태스크 목록입니다. 목록 제목 옆에 태스크 그룹 수·태스크 수 뱃지가 있고, 그룹 구역에서는 태스크 종류(예: Manipulation) 뱃지를 상위로 두고 그 아래에 그룹 이름을 제목으로 표시하며, 태스크 개수는 보조 메타로 둡니다.',
      areas: [
        {
          id: 'task-list-heading',
          name: '섹션 헤더',
          role: 'Title + 태스크 그룹 수·태스크 수 뱃지 + 편집 + 등록',
          userAction: '등록·그룹 편집',
          linkedScreen: '—',
        },
        {
          id: 'task-toolbar',
          name: '툴바',
          role: '검색·종류 필터·정렬',
          userAction: '검색·필터',
          linkedScreen: '—',
        },
        {
          id: 'task-list',
          name: '태스크 그룹별 목록',
          role: '그룹 헤더(종류 뱃지 상위 → 그룹명 제목 → 태스크 수 메타) + 태스크 카드',
          userAction: '항목 선택',
          linkedScreen: '상세(예정)',
        },
      ],
    }),
    [screenId],
  );

  const { bindArea } = useDescriptionScreen(descriptionMeta);
  const navigate = useNavigate();

  const handleCardActivate = (row: SupportTaskDto) => {
    navigate(supportRobotWorkspaceDetailPath('task', row.id));
  };

  const menuForRow = (row: SupportTaskDto): MenuProps => ({
    items: [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: t('support.robot.definition.card.edit'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          message.info(`${t('support.robot.definition.card.editDemoPrefix')}${row.title}`);
        },
      },
      {
        type: 'divider',
      },
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
  const taskCount = filteredItems.length;
  const badgeTaskGroupsLabel = t('support.robot.task.badge.taskGroups').replace('{n}', String(taskGroupCount));
  const badgeTasksLabel = t('support.robot.task.badge.tasks').replace('{n}', String(taskCount));
  const listHeadAria = `${t('support.robot.definition.section.countAria')}: ${badgeTaskGroupsLabel}, ${badgeTasksLabel}`;
  const updatedPrefix = t('support.robot.definition.card.updatedPrefix');
  const iconProps = { style: { fontSize: 12, color: token.colorTextSecondary, flexShrink: 0 } };

  const createMenu: MenuProps = {
    items: [
      {
        key: 'task-type',
        label: t('support.robot.create.taskType.open'),
        onClick: () => setTaskTypeOpen(true),
      },
      {
        key: 'task-group',
        label: t('support.robot.create.taskGroup.open'),
        onClick: () => setTaskGroupOpen(true),
      },
    ],
  };

  return (
    <div className="support-task-page support-workspace-page dev-data-foundry">
      <div className="support-task-page__stack">
        <div className="dev-data-foundry-header" {...bindArea('task-list-heading')}>
          <div>
            <Space align="center" wrap className="support-workspace-title-line" size={8} aria-label={listHeadAria}>
              <Typography.Title level={3} className="dev-data-foundry-title domain-content-title" style={{ margin: 0 }}>
                {t(titleKey)}
              </Typography.Title>
              <Tag bordered={false} color="default">
                {badgeTaskGroupsLabel}
              </Tag>
              <Tag bordered={false} color="default">
                {badgeTasksLabel}
              </Tag>
            </Space>
            <Typography.Paragraph type="secondary" className="domain-1depth-page-lead">
              {t(leadKey)}
            </Typography.Paragraph>
          </div>
          <Space wrap>
            <Button
              onClick={() => {
                message.info(t('support.robot.task.editTaskGroupDemo'));
              }}
            >
              {t('support.robot.task.editTaskGroup')}
            </Button>
            <Dropdown menu={createMenu} trigger={['click']}>
              <Button type="primary">{t('support.sim.create.button')}</Button>
            </Dropdown>
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

        <div className="support-task-list" {...bindArea('task-list')}>
          {filteredItems.length === 0 ? (
            <Empty description={t('support.robot.task.empty')} />
          ) : (
            groupedTasks.map(({ group, tasks }) => (
              <section key={group.id} className="support-task-group" aria-labelledby={`support-task-group-${group.id}`}>
                <header className="support-task-group__header" id={`support-task-group-${group.id}`}>
                  <div className="support-task-group__kind">
                    <Tag color={kindTagColor(group.kind)}>{t(kindTranslationKey(group.kind))}</Tag>
                  </div>
                  <Typography.Title level={4} className="support-task-group__group-title">
                    {group.name}
                  </Typography.Title>
                  <Typography.Text type="secondary" className="support-task-group__task-count">
                    {t('support.robot.task.badge.tasks').replace('{n}', String(tasks.length))}
                  </Typography.Text>
                </header>
                <div className="support-task-group__cards">
                  {tasks.map((row) => (
                    <Card
                      key={row.id}
                      size="small"
                      bordered
                      className="support-task-card"
                      styles={{ body: { padding: 0 } }}
                      tabIndex={0}
                      role="link"
                      aria-label={row.title}
                      onClick={() => handleCardActivate(row)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCardActivate(row);
                        }
                      }}
                      style={{ borderColor: token.colorBorderSecondary }}
                    >
                      <div className="support-task-card__corner-actions">
                        <Dropdown menu={menuForRow(row)} trigger={['hover']} placement="bottomRight">
                          <Button
                            type="text"
                            icon={<MoreOutlined />}
                            className="support-definition-card__taco"
                            aria-label={t('support.robot.definition.card.menuAria')}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Dropdown>
                      </div>
                      <div className="support-task-card__main">
                        <Typography.Title level={5} style={{ margin: 0 }}>
                          {row.title}
                        </Typography.Title>
                        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }} ellipsis={{ rows: 2 }}>
                          {row.subtitle}
                        </Typography.Paragraph>
                        <Space size={8} align="center" style={{ marginTop: 8 }}>
                          <FolderOutlined aria-hidden {...iconProps} />
                          <Typography.Text type="secondary">{row.projectName}</Typography.Text>
                        </Space>
                      </div>
                      <div className="support-task-card__aside">
                        <Space align="center" style={{ justifyContent: 'flex-end', width: '100%' }} size={8}>
                          <Tag color={statusTagColor(row.status)}>{t(statusLabelKey(row.status))}</Tag>
                        </Space>
                        <Space size={6} align="center">
                          <ClockCircleOutlined aria-hidden {...iconProps} />
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {updatedPrefix}
                            {row.updatedAt}
                          </Typography.Text>
                        </Space>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      <CreateRobotTaskTypeModal open={taskTypeOpen} onClose={() => setTaskTypeOpen(false)} onCreated={() => setListTick((n) => n + 1)} />
      <CreateRobotTaskGroupModal open={taskGroupOpen} onClose={() => setTaskGroupOpen(false)} onCreated={() => setListTick((n) => n + 1)} />
    </div>
  );
}

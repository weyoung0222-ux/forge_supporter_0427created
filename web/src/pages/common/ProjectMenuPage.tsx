import {
  ArrowRightOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Empty, Flex, Input, Row, Select, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import type { DomainKey } from '../../shared/config/domainNavigation';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import { useDescriptionScreen } from '../../shared/ui/common/DescriptionModeProvider';
import { matchesSearchQuery } from '../../shared/lib/listQuery';
import './project-menu-page.css';

interface ProjectMenuPageProps {
  domain: DomainKey;
  onSelectProject: () => void;
}

interface ProjectRow {
  key: string;
  title: string;
  description: string;
  members: number;
  createdAt: number;
}

type ProjectSortKey = 'recent' | 'oldest' | 'nameAsc' | 'nameDesc' | 'membersDesc' | 'membersAsc';

function projectHaystack(item: ProjectRow): string {
  return `${item.title} ${item.description} ${item.members}`;
}

function filterBySearch(items: ProjectRow[], query: string): ProjectRow[] {
  return items.filter((item) => matchesSearchQuery(projectHaystack(item), query));
}

function sortProjects(items: ProjectRow[], sortKey: ProjectSortKey): ProjectRow[] {
  const next = [...items];
  switch (sortKey) {
    case 'recent':
      return next.sort((a, b) => b.createdAt - a.createdAt);
    case 'oldest':
      return next.sort((a, b) => a.createdAt - b.createdAt);
    case 'nameAsc':
      return next.sort((a, b) => a.title.localeCompare(b.title));
    case 'nameDesc':
      return next.sort((a, b) => b.title.localeCompare(a.title));
    case 'membersDesc':
      return next.sort((a, b) => b.members - a.members);
    case 'membersAsc':
      return next.sort((a, b) => a.members - b.members);
    default:
      return next;
  }
}

const now = Date.now();

const BASE_PROJECTS: ProjectRow[] = [
  {
    key: 'p1',
    title: 'Urban Navigation Pilot',
    description: 'City-scale routing datasets and evaluation harnesses.',
    members: 8,
    createdAt: now - 2 * 60 * 60 * 1000,
  },
  {
    key: 'p2',
    title: 'Warehouse Pick v2',
    description: 'Pick-place episodes with failure labels for policy learning.',
    members: 14,
    createdAt: now - 26 * 60 * 60 * 1000,
  },
  {
    key: 'p3',
    title: 'Night Drive Corpus',
    description: 'Low-light highway logs with synchronized lidar.',
    members: 5,
    createdAt: now - 4 * 24 * 60 * 60 * 1000,
  },
];

const BASE_INVITATIONS: ProjectRow[] = [
  {
    key: 'i1',
    title: 'Sim Lab Rollouts',
    description: 'Invitation to review synthetic rollout bundles.',
    members: 3,
    createdAt: now - 12 * 60 * 60 * 1000,
  },
  {
    key: 'i2',
    title: 'Customer Pilot — Site A',
    description: 'Join the pilot workspace for on-site data capture.',
    members: 9,
    createdAt: now - 3 * 24 * 60 * 60 * 1000,
  },
  {
    key: 'i3',
    title: 'Foundation Model Review',
    description: 'Stakeholder review for next checkpoint drop.',
    members: 6,
    createdAt: now - 6 * 60 * 60 * 1000,
  },
];

export function ProjectMenuPage({ domain, onSelectProject }: ProjectMenuPageProps) {
  const { t, locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<ProjectSortKey>('recent');

  const projectSortOptions = useMemo(
    (): { value: ProjectSortKey; label: string }[] => [
      { value: 'recent', label: t('project.sort.recent') },
      { value: 'oldest', label: t('project.sort.oldest') },
      { value: 'nameAsc', label: t('project.sort.nameAsc') },
      { value: 'nameDesc', label: t('project.sort.nameDesc') },
      { value: 'membersDesc', label: t('project.sort.membersDesc') },
      { value: 'membersAsc', label: t('project.sort.membersAsc') },
    ],
    [t, locale],
  );

  const domainCodeMap: Record<DomainKey, string> = {
    customer: 'CS',
    dev: 'DV',
    support: 'SP',
    admin: 'AD',
  };

  const visibleProjects = useMemo(() => {
    return sortProjects(filterBySearch(BASE_PROJECTS, searchQuery), sortKey);
  }, [searchQuery, sortKey]);

  const visibleInvitations = useMemo(() => {
    return sortProjects(filterBySearch(BASE_INVITATIONS, searchQuery), sortKey);
  }, [searchQuery, sortKey]);

  const descriptionMeta = useMemo(
    () => ({
      screenName: '내 프로젝트',
      screenId: `${domainCodeMap[domain]}-PJ-LS-001`,
      screenDescription: '프로젝트 목록과 초대 목록을 확인하고 프로젝트를 선택하는 화면',
      areas: [
        {
          id: 'project-header',
          name: '프로젝트 헤더',
          role: '화면 목적과 프로젝트 생성 액션 제공',
          userAction: 'Create Project 버튼 선택',
          linkedScreen: '프로젝트 생성 화면(예정)',
        },
        {
          id: 'project-list',
          name: '내 프로젝트 목록',
          role: '사용자가 참여 중인 프로젝트를 표시',
          userAction: '프로젝트 카드를 선택',
          linkedScreen: '선택 프로젝트 상세 홈',
        },
        {
          id: 'project-invitations',
          name: '초대 대기 목록',
          role: '수락 대기 중인 프로젝트 초대를 표시',
          userAction: '초대 프로젝트 확인',
          linkedScreen: '프로젝트 상세 또는 초대 처리 화면',
        },
      ],
    }),
    [domain],
  );
  const { bindArea } = useDescriptionScreen(descriptionMeta);

  return (
    <div className="project-menu-page">
      <div className="domain-1depth-page-header" {...bindArea('project-header')}>
        <Row justify="space-between" align="middle" gutter={[24, 16]}>
          <Col>
            <Typography.Title level={2} className="domain-1depth-page-title">
              {t('project.title')}
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="domain-1depth-page-lead">
              {t('project.subtitle')}
            </Typography.Paragraph>
          </Col>
          <Col>
            <Button icon={<PlusOutlined />}>{t('project.create')}</Button>
          </Col>
        </Row>
      </div>

      <Row align="middle" gutter={[24, 12]} className="project-menu-toolbar" wrap>
        <Col xs={24} md={16} lg={17} xl={18} style={{ minWidth: 0 }}>
          <Input
            placeholder={t('project.search')}
            prefix={<SearchOutlined />}
            className="project-menu-search forge-search-input"
            allowClear
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Col>
        <Col xs={24} md={8} lg={7} xl={6}>
          <Select<ProjectSortKey>
            value={sortKey}
            onChange={(v) => setSortKey(v)}
            options={projectSortOptions}
            className="project-menu-sort"
            popupMatchSelectWidth={false}
          />
        </Col>
      </Row>

      <Space direction="vertical" size={12} className="project-menu-list" {...bindArea('project-list')}>
        {visibleProjects.length === 0 ? (
          <Empty description={t('project.empty')} />
        ) : (
          visibleProjects.map((item) => (
            <Card key={item.key} hoverable onClick={onSelectProject}>
              <Flex align="center" justify="space-between" gap={16}>
                <Flex align="center" gap={12}>
                  <div className="project-card-image">image</div>
                  <Space direction="vertical" size={2}>
                    <Typography.Text strong>{item.title}</Typography.Text>
                    <Typography.Text type="secondary" className="project-card-description">
                      {item.description}
                    </Typography.Text>
                    <Typography.Text type="secondary" className="project-card-meta">
                      <TeamOutlined /> {t('project.members').replace('{n}', String(item.members))}
                    </Typography.Text>
                  </Space>
                </Flex>
                <Button
                  type="text"
                  icon={<ArrowRightOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProject();
                  }}
                />
              </Flex>
            </Card>
          ))
        )}
      </Space>

      <div className="project-menu-more">
        <Button size="small">{t('project.showMore')}</Button>
      </div>

      <div {...bindArea('project-invitations')}>
        <Typography.Title level={3} className="project-menu-subtitle">
          {t('project.pending')}
        </Typography.Title>

        <Space direction="vertical" size={12} className="project-menu-list">
          {visibleInvitations.length === 0 ? (
            <Empty description={t('project.inviteEmpty')} />
          ) : (
            visibleInvitations.map((item) => (
              <Card key={item.key}>
                <Flex align="center" gap={12}>
                  <div className="project-card-image">image</div>
                  <Space direction="vertical" size={2}>
                    <Typography.Text strong>{item.title}</Typography.Text>
                    <Typography.Text type="secondary" className="project-card-description">
                      {item.description}
                    </Typography.Text>
                    <Typography.Text type="secondary" className="project-card-meta">
                      <TeamOutlined /> {t('project.members').replace('{n}', String(item.members))}
                    </Typography.Text>
                  </Space>
                </Flex>
              </Card>
            ))
          )}
        </Space>
      </div>

      <div className="project-menu-more">
        <Button size="small">{t('project.showMore')}</Button>
      </div>
      <Typography.Text type="secondary" className="project-menu-domain">
        {domain} domain
      </Typography.Text>
    </div>
  );
}

import {
  Divider,
  Drawer,
  Space,
  Tag,
  Typography,
} from 'antd';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useLocale } from '../../i18n/LocaleProvider';

interface DescriptionAreaMeta {
  id: string;
  name: string;
  role: string;
  userAction: string;
  linkedScreen: string;
}

interface DescriptionScreenMeta {
  screenName: string;
  screenId: string;
  screenDescription: string;
  areas: DescriptionAreaMeta[];
}

interface DescriptionRegistration {
  meta: DescriptionScreenMeta;
  getElementById: (id: string) => HTMLElement | null;
}

interface DescriptionContextValue {
  registerScreen: (registration: DescriptionRegistration) => () => void;
  isEnabled: boolean;
}

const DescriptionContext = createContext<DescriptionContextValue>({
  registerScreen: () => () => undefined,
  isEnabled: false,
});

interface BadgeItem extends DescriptionAreaMeta {
  number: number;
  x: number;
  y: number;
}

function sortClockwiseFromTopLeft(
  items: Array<{ id: string; x: number; y: number }>,
): string[] {
  if (items.length === 0) {
    return [];
  }

  const centerX = items.reduce((sum, item) => sum + item.x, 0) / items.length;
  const centerY = items.reduce((sum, item) => sum + item.y, 0) / items.length;
  const start = (-3 * Math.PI) / 4;

  return items
    .map((item) => {
      const angle = Math.atan2(item.y - centerY, item.x - centerX);
      const normalized = (angle - start + Math.PI * 2) % (Math.PI * 2);
      return { id: item.id, normalized };
    })
    .sort((a, b) => a.normalized - b.normalized)
    .map((item) => item.id);
}

const FORGE_APP_BASES = ['/customer', '/dev', '/support', '/admin'] as const;

function isForgeAppPath(pathname: string): boolean {
  if (pathname === '/login') {
    return true;
  }
  return FORGE_APP_BASES.some((base) => pathname === base || pathname.startsWith(`${base}/`));
}

export function DescriptionModeProvider({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  const location = useLocation();
  const showForgeChrome = isForgeAppPath(location.pathname);

  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [registration, setRegistration] = useState<DescriptionRegistration | null>(null);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const registerScreen = (next: DescriptionRegistration) => {
    setRegistration(next);
    return () => {
      setRegistration((prev) => (prev === next ? null : prev));
    };
  };

  const updateBadges = () => {
    if (!registration) {
      setBadges([]);
      return;
    }

    const positions = registration.meta.areas
      .map((area) => {
        const element = registration.getElementById(area.id);
        if (!element) {
          return null;
        }
        const rect = element.getBoundingClientRect();
        return {
          ...area,
          id: area.id,
          x: Math.max(10, rect.left + 10),
          y: Math.max(10, rect.top + 10),
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
        };
      })
      .filter(Boolean) as Array<DescriptionAreaMeta & { x: number; y: number; centerX: number; centerY: number }>;

    const order = sortClockwiseFromTopLeft(
      positions.map((item) => ({ id: item.id, x: item.centerX, y: item.centerY })),
    );
    const orderMap = new Map(order.map((id, idx) => [id, idx + 1]));

    setBadges(
      positions
        .map((item) => ({
          ...item,
          number: orderMap.get(item.id) ?? 0,
        }))
        .sort((a, b) => a.number - b.number),
    );
  };

  useEffect(() => {
    if (!isEnabled) {
      setSelectedAreaId(null);
      return;
    }
    updateBadges();
    const onChange = () => updateBadges();
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
    };
  }, [isEnabled, registration]);

  useEffect(() => {
    if (!registration) {
      return;
    }

    registration.meta.areas.forEach((area) => {
      const el = registration.getElementById(area.id);
      if (!el) {
        return;
      }
      if (isEnabled && selectedAreaId === area.id) {
        el.classList.add('description-highlight');
      } else {
        el.classList.remove('description-highlight');
      }
    });
  }, [registration, selectedAreaId, isEnabled]);

  useEffect(() => {
    if (!selectedAreaId) {
      return;
    }
    itemRefs.current[selectedAreaId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [selectedAreaId]);

  useEffect(() => {
    if (!showForgeChrome) {
      setIsEnabled(false);
      setSelectedAreaId(null);
    }
  }, [showForgeChrome]);

  const ctxValue = useMemo(
    () => ({
      registerScreen,
      isEnabled,
    }),
    [isEnabled],
  );

  return (
    <DescriptionContext.Provider value={ctxValue}>
      {children}

      {showForgeChrome && (
        <>
          <button
            type="button"
            className={`description-fab ${isEnabled ? 'description-fab-on' : ''}`}
            onClick={() => {
              const next = !isEnabled;
              setIsEnabled(next);
              if (!next) {
                setSelectedAreaId(null);
              }
            }}
          >
            {t('description.fab')}
          </button>

          {isEnabled &&
            badges.map((badge) => (
              <button
                key={badge.id}
                type="button"
                className={`description-badge ${selectedAreaId === badge.id ? 'description-badge-active' : ''}`}
                style={{ left: badge.x, top: badge.y }}
                onClick={() => setSelectedAreaId((prev) => (prev === badge.id ? null : badge.id))}
              >
                {badge.number}
              </button>
            ))}

          <Drawer
            title="화면 설명"
            placement="right"
            open={isEnabled}
            closable={false}
            mask={false}
            width={360}
          >
            {registration ? (
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {registration.meta.screenName}
                </Typography.Title>
                <Tag color="blue">{registration.meta.screenId}</Tag>
                <Typography.Text type="secondary">{registration.meta.screenDescription}</Typography.Text>
                <Divider style={{ margin: '6px 0' }} />

                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    ref={(el) => {
                      itemRefs.current[badge.id] = el;
                    }}
                    className={`description-item ${selectedAreaId === badge.id ? 'description-item-active' : ''}`}
                    onClick={() => setSelectedAreaId((prev) => (prev === badge.id ? null : badge.id))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedAreaId((prev) => (prev === badge.id ? null : badge.id));
                      }
                    }}
                  >
                    <Typography.Text strong>
                      {badge.number}. {badge.name}
                    </Typography.Text>
                    <Typography.Paragraph style={{ margin: '6px 0 0' }}>
                      - 역할: {badge.role}
                    </Typography.Paragraph>
                    <Typography.Paragraph style={{ margin: '0' }}>
                      - 사용자 동작: {badge.userAction}
                    </Typography.Paragraph>
                    <Typography.Paragraph style={{ margin: '0' }}>
                      - 연결 화면: {badge.linkedScreen}
                    </Typography.Paragraph>
                  </div>
                ))}
              </Space>
            ) : (
              <Typography.Text type="secondary">현재 화면 설명 정보가 없습니다.</Typography.Text>
            )}
          </Drawer>
        </>
      )}
    </DescriptionContext.Provider>
  );
}

export function useDescriptionScreen(meta: DescriptionScreenMeta) {
  const { registerScreen } = useContext(DescriptionContext);
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const unregister = registerScreen({
      meta,
      getElementById: (id) => refs.current[id] ?? null,
    });
    return unregister;
  }, [meta, registerScreen]);

  const bindArea = (id: string) => ({
    ref: (el: HTMLElement | null) => {
      refs.current[id] = el;
    },
  });

  return { bindArea };
}

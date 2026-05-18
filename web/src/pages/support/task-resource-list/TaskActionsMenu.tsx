import { MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';

export interface TaskActionsMenuProps {
  menu: MenuProps;
  ariaLabel: string;
  className?: string;
}

export function TaskActionsMenu({ menu, ariaLabel, className }: TaskActionsMenuProps) {
  return (
    <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
      <Button
        type="text"
        icon={<MoreOutlined />}
        className={className ?? 'support-definition-card__taco task-resource-actions-menu'}
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
      />
    </Dropdown>
  );
}

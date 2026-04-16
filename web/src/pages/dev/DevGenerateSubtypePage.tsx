import { Button, Card, Col, Row, message } from 'antd';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import './dev-generate-subtype-page.css';

export interface DevGenerateSubtypePageProps {
  onSelectMimicAugmentation: () => void;
}

export function DevGenerateSubtypePage({ onSelectMimicAugmentation }: DevGenerateSubtypePageProps) {
  const { t } = useLocale();

  const comingSoon = () => message.info(t('dataGenerate.comingSoon'));

  return (
    <div className="dev-generate-subtype domain-workspace-route-root">
      <Row gutter={[16, 16]} className="dev-generate-subtype-cards">
        <Col xs={24} md={8}>
          <Card bordered className="dev-generate-subtype-card" title={t('dataGenerate.option.syntheticVideo')}>
            <Button type="default" block onClick={comingSoon}>
              {t('dataGenerate.open')}
            </Button>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered className="dev-generate-subtype-card" title={t('dataGenerate.option.mimicAugmentation')}>
            <Button type="primary" block onClick={onSelectMimicAugmentation}>
              {t('dataGenerate.open')}
            </Button>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered className="dev-generate-subtype-card" title={t('dataGenerate.option.idm')}>
            <Button type="default" block onClick={comingSoon}>
              {t('dataGenerate.open')}
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

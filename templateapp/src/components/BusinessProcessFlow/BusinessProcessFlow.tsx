import { customerConfig } from '../../config/customer.config';
import './BusinessProcessFlow.css';

interface BusinessProcessFlowProps {
  activeStage: number;
  onStageClick?: (stageId: number) => void;
}

export function BusinessProcessFlow({ activeStage, onStageClick }: BusinessProcessFlowProps) {
  const { stages } = customerConfig;

  return (
    <div className="bpf-container">
      {stages.map((stage, index) => {
        const isFirst = index === 0;
        const isLast = index === stages.length - 1;
        const isCompleted = stage.id < activeStage;
        const isActive = stage.id === activeStage;

        const statusClass = isCompleted
          ? 'bpf-stage--completed'
          : isActive
            ? 'bpf-stage--active'
            : 'bpf-stage--future';

        const shapeClass = isFirst
          ? 'bpf-stage--first'
          : isLast
            ? 'bpf-stage--last'
            : '';

        // Earlier stages sit on top so their right arrow is visible over the next stage
        const zIndex = stages.length - index + (isActive ? 10 : 0);

        return (
          <div
            key={stage.id}
            className={`bpf-stage ${statusClass} ${shapeClass}`}
            style={{ zIndex }}
            onClick={() => onStageClick?.(stage.id)}
            role="button"
            tabIndex={0}
            aria-label={`Stage ${stage.id}: ${stage.name}`}
            onKeyDown={(e) => e.key === 'Enter' && onStageClick?.(stage.id)}
          >
            {isCompleted && <span className="bpf-icon">✓</span>}
            {isActive && <span className="bpf-icon">●</span>}
            <span>{stage.name}</span>
          </div>
        );
      })}
    </div>
  );
}

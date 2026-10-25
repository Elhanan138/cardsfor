import { Icon, type IconName } from "./Icon";

export function EmptyState({ icon, text, action }: { icon: IconName; text: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="empty">
      <span className="empty-ico"><Icon name={icon} size="lg" /></span>
      <p>{text}</p>
      {action}
    </div>
  );
}

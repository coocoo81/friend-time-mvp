type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="card rounded-3xl px-5 py-6 text-center">
      <p className="text-base font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
    </div>
  );
}

import type { AdminContentViewModel } from '../viewmodel/useAdminContentViewModel';

export function CompactOverview({ vm }: { vm: AdminContentViewModel }) {
    return (
        <section aria-label="Journey overview" className="content-surface flex flex-wrap items-center justify-between">
            <dl className="content-summary">
                {vm.stats.map(stat => (
                    <div key={stat.label}>
                        <dt>{stat.label}</dt>
                        <dd className={stat.accent ? 'text-deep-teal' : ''}>{stat.value ?? '—'}</dd>
                    </div>
                ))}
            </dl>
            {vm.overviewError && (
                <p role="status" className="content-muted px-5 pb-3 text-xs">
                    {vm.overviewError} <button onClick={vm.retry} className="min-h-11 underline">Retry overview</button>
                </p>
            )}
        </section>
    );
}

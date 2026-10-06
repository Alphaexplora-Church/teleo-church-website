import { useState } from 'react';
import { Archive, BookOpen, Loader2, Pencil, RotateCcw } from 'lucide-react';
import { CONTENT_TYPE_OPTIONS } from '../model/adminContent.types';
import type { Journey } from '../model/adminContent.types';
import type { AdminContentViewModel } from '../viewmodel/useAdminContentViewModel';
import { statusBadgeClass } from './contentStyles';

export function JourneyRow({ journey, vm }: { journey: Journey; vm: AdminContentViewModel }) {
    const count = vm.detailCounts[journey.id];
    const knownCount = count?.updatedAt === journey.updatedAt ? count : undefined;
    const pending = vm.pendingStatusId === journey.id;
    const archived = journey.status === 'archived';
    return (
        <li className="content-row">
            <div className="flex min-w-0 items-center gap-3">
                <JourneyThumbnail key={journey.thumbnailUrl ?? 'no-thumbnail'} url={journey.thumbnailUrl} />
                <div className="min-w-0 flex-1">
                    <button onClick={() => vm.openPreview(journey)} className="min-h-11 break-words text-left font-serif text-lg text-midnight-teal hover:underline">
                        {journey.title}
                    </button>
                    <p className="content-muted line-clamp-1 text-sm">{journey.summary || journey.description || 'No description'}</p>
                </div>
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold">{CONTENT_TYPE_OPTIONS.find(option => option.value === journey.contentType)?.label}</p>
                <div className="content-muted mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs">
                    {journey.categories.map(category => <span key={category}>{category}</span>)}
                </div>
            </div>
            <div>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusBadgeClass(journey.status)}`}>
                    {journey.status}
                </span>
            </div>
            <div className="text-xs">
                <p>
                    {knownCount?.total !== undefined ? `${knownCount.total} total` : knownCount?.error ? (
                        <button className="min-h-11 text-left underline" onClick={() => vm.retryDetail(journey.id)}>Count unavailable · Retry</button>
                    ) : <span className="content-muted">Loading count…</span>}
                </p>
                <p className="content-muted mt-1">{journey.totalPublishedParts ?? '—'} published</p>
            </div>
            <div className="content-row-actions flex items-center gap-1">
                <button disabled={Boolean(vm.pendingStatusId)} onClick={() => vm.openEditEditor(journey)} className="content-button px-3">
                    <Pencil size={14} aria-hidden="true" /> Edit
                </button>
                <button
                    disabled={Boolean(vm.pendingStatusId)}
                    onClick={() => archived ? void vm.handleSetStatus(journey, 'published') : vm.openArchiveModal(journey)}
                    aria-label={`${archived ? 'Restore and publish' : 'Archive'} ${journey.title}`}
                    title={archived ? 'Restore and publish' : 'Archive'}
                    className="content-button w-11 px-2 text-amber-800"
                >
                    {pending ? <Loader2 size={16} className="animate-spin" /> : archived ? <RotateCcw size={16} /> : <Archive size={16} />}
                </button>
            </div>
        </li>
    );
}

function JourneyThumbnail({ url }: { url?: string | null }) {
    const [failed, setFailed] = useState(false);
    return (
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-soft-linen" aria-hidden="true">
            {url && !failed ? (
                <img src={url} alt="" width={64} height={64} loading="lazy" decoding="async" onError={() => setFailed(true)} className="h-full w-full object-cover" />
            ) : <BookOpen size={24} className="text-deep-teal" />}
        </div>
    );
}

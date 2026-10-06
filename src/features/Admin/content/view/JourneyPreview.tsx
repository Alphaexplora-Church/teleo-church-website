import { useEffect, useState } from 'react';
import { BookOpen, ExternalLink, Pencil, X } from 'lucide-react';
import { AdminContentService } from '../model/adminContent.service';
import { CONTENT_TYPE_OPTIONS } from '../model/adminContent.types';
import type { Journey } from '../model/adminContent.types';
import { ContentDialog } from './ContentDialog';
import { statusBadgeClass } from './contentStyles';

export function JourneyPreview({ journey, onClose, onEdit }: { journey: Journey; onClose: () => void; onEdit: (journey: Journey) => void }) {
    const [detail, setDetail] = useState<Journey | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [revision, setRevision] = useState(0);
    const [imageFailed, setImageFailed] = useState(false);
    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            setError(null);
            try {
                const loaded = await AdminContentService.fetchJourneyDetail(journey.id, { signal: controller.signal });
                if (!controller.signal.aborted) setDetail(loaded);
            } catch (err) { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Could not load the preview.'); }
        };
        void load();
        return () => controller.abort();
    }, [journey.id, revision]);
    const data = detail ?? journey;
    return <ContentDialog labelledBy="journey-preview-title" onClose={onClose}>
        <header className="flex items-center justify-between gap-4 bg-midnight-teal px-6 py-5 text-soft-linen"><div><h2 id="journey-preview-title" className="font-serif text-2xl">Journey preview</h2><p className="mt-1 text-xs">Read-only · Saved content</p></div><button className="content-button w-11 px-2 text-soft-linen" onClick={onClose} aria-label="Close preview"><X size={18} /></button></header>
        <div className="content-dialog-body space-y-6" aria-busy={!detail && !error}>
            {!detail && !error ? <div role="status" className="animate-pulse rounded-xl bg-soft-linen p-10 text-center">Loading saved content…</div> : error ? <div role="alert"><p className="text-red-700">{error}</p><button className="content-button underline" onClick={() => setRevision(v => v + 1)}>Retry preview</button></div> : <>
                <div className="flex flex-col gap-5 sm:flex-row">
                    {data.thumbnailUrl && !imageFailed ? <img src={data.thumbnailUrl} onError={() => setImageFailed(true)} alt="Journey thumbnail" className="h-36 w-full rounded-xl object-cover sm:w-52" /> : <div className="grid h-36 w-full place-items-center rounded-xl bg-soft-linen sm:w-52"><BookOpen size={36} aria-hidden="true" /><span className="text-xs">No thumbnail available</span></div>}
                    <div className="min-w-0 flex-1"><h3 className="break-words font-serif text-2xl">{data.title}</h3><p className="content-muted mt-2 text-sm">{CONTENT_TYPE_OPTIONS.find(o => o.value === data.contentType)?.label}</p><span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClass(data.status)}`}>{data.status}</span><div className="content-muted mt-3 flex flex-wrap gap-2 text-xs">{data.categories.map(c => <span key={c}>{c}</span>)}</div></div>
                </div>
                {data.status !== 'published' && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">This {data.status} Journey is hidden from members. Its Parts are shown here for admin review.</p>}
                {data.summary && <section><h4 className="font-semibold">Summary</h4><p className="content-muted mt-2 whitespace-pre-wrap break-words text-sm">{data.summary}</p></section>}
                <section><h4 className="font-semibold">Description</h4><p className="content-muted mt-2 whitespace-pre-wrap break-words text-sm">{data.description}</p></section>
                <section><h4 className="mb-3 font-serif text-xl">Parts <span className="content-muted text-sm">({data.parts.length})</span></h4>{data.parts.length === 0 ? <p className="content-muted text-sm">No Parts have been added.</p> : <ol className="divide-y divide-midnight-teal/10">{data.parts.map(part => <li key={part.id}><details className="py-3"><summary className="cursor-pointer rounded-lg py-2 text-sm font-semibold"><span className="mr-2">{part.order}.</span>{part.title}<span className={`ml-3 inline-block rounded-full px-2 py-1 text-xs capitalize ${statusBadgeClass(part.status)}`}>{part.status}</span></summary><div className="space-y-3 py-3 pl-5 text-sm">{(part.status !== 'published' || data.status !== 'published') && <p className="text-amber-800">Hidden from members.</p>}{part.textContent && <p className="content-muted whitespace-pre-wrap break-words">{part.textContent}</p>}{part.videoUrl && (part.videoTitle && /^https?:\/\//i.test(part.videoUrl) ? <div>{part.videoThumbnail && <img src={part.videoThumbnail} alt="" className="mb-2 h-24 w-40 rounded-lg object-cover" onError={e => { e.currentTarget.hidden = true; }} />}<a href={part.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-deep-teal underline">{part.videoTitle}<ExternalLink size={14} aria-hidden="true" /></a></div> : <p className="text-amber-800">Video preview unavailable. Open the editor to check or replace the link.</p>)}{!part.textContent && !part.videoUrl && <p className="content-muted">This Part is an empty placeholder.</p>}</div></details></li>)}</ol>}</section>
            </>}
        </div>
        <footer className="content-dialog-footer flex justify-end gap-2"><button className="content-button" onClick={onClose}>Close</button><button disabled={!detail} className="content-button content-button-primary" onClick={() => detail && onEdit(detail)}><Pencil size={15} aria-hidden="true" />Edit Journey</button></footer>
    </ContentDialog>;
}

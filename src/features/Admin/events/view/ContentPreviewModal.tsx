import { isChurchEvent } from '../model/content.types';
import type { ContentItem } from '../model/content.types';

interface ContentPreviewModalProps {
    item: ContentItem | null;
    type: 'event' | 'announcement';
    onClose: () => void;
}

const formatTimestamp = (value?: string | null) => {
    if (!value) return 'Not available';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

export function ContentPreviewModal({ item, onClose }: ContentPreviewModalProps) {
    if (!item) return null;

    // Announcements have no dates or location; their text is content.
    const event = isChurchEvent(item) ? item : null;
    const startDate = event?.start_date ?? null;
    const endDate = event?.end_date ?? null;
    const text = isChurchEvent(item) ? item.description : item.content;
    const image = item.media?.[0]?.url;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onMouseDown={onClose}>
            <article className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl" onMouseDown={event => event.stopPropagation()}>
                {image && <img src={image} alt="" className="h-56 w-full object-cover" />}
                <div className="p-7 sm:p-8">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <StatusBadge status={item.status} />
                            </div>
                            <h2 className="font-serif text-3xl text-midnight-teal">{item.title}</h2>
                        </div>
                        <button onClick={onClose} aria-label="Close preview" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-midnight-teal">×</button>
                    </div>

                    <div className="grid gap-4 rounded-2xl bg-soft-linen/70 p-5 text-sm sm:grid-cols-2">
                        {event && <PreviewField label="Starts" value={startDate ? `${startDate.date} · ${startDate.time}` : 'Not set'} />}
                        {event && <PreviewField label="Ends" value={endDate ? `${endDate.date} · ${endDate.time}` : 'Not set'} />}
                        {event && <PreviewField label="Location" value={event.location || 'Not set'} />}
                        <PreviewField label="Created by" value={item.author?.username || 'Admin'} />
                        <PreviewField label="Created" value={formatTimestamp(item.created_at)} />
                        <PreviewField label="Last updated" value={formatTimestamp(item.updated_at)} />
                    </div>

                    <div className="mt-6">
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">{event ? 'Description' : 'Content'}</p>
                        <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600">{text || 'No description provided.'}</p>
                    </div>
                </div>
            </article>
        </div>
    );
}

function PreviewField({ label, value }: { label: string; value: string }) {
    return <div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p><p className="mt-1 font-semibold text-midnight-teal">{value}</p></div>;
}

function StatusBadge({ status }: { status?: string | null }) {
    const value = status || 'active';
    const style = value === 'active' ? 'bg-emerald-50 text-emerald-700' : value === 'completed' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600';
    return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${style}`}>{value}</span>;
}

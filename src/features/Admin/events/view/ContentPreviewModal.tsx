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

export function ContentPreviewModal({ item, type, onClose }: ContentPreviewModalProps) {
    if (!item) return null;

    const isEvent = type === 'event';
    const location = 'location' in item ? item.location : null;
    const endDate = 'end_date' in item ? item.end_date : null;
    const image = item.media?.[0]?.file_url;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onMouseDown={onClose}>
            <article className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl" onMouseDown={event => event.stopPropagation()}>
                {image && <img src={image} alt="" className="h-56 w-full object-cover" />}
                <div className="p-7 sm:p-8">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <StatusBadge status={item.status} />
                                {item.category_content && <span className="rounded-full border border-harvest-orange/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-harvest-orange">{item.category_content}</span>}
                            </div>
                            <h2 className="font-serif text-3xl text-midnight-teal">{item.title}</h2>
                        </div>
                        <button onClick={onClose} aria-label="Close preview" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-midnight-teal">×</button>
                    </div>

                    <div className="grid gap-4 rounded-2xl bg-soft-linen/70 p-5 text-sm sm:grid-cols-2">
                        <PreviewField label={isEvent ? 'Starts' : 'Publish date'} value={item.start_date ? `${item.start_date.date} · ${item.start_date.time}` : 'Not set'} />
                        {isEvent && <PreviewField label="Ends" value={endDate ? `${endDate.date} · ${endDate.time}` : 'Not set'} />}
                        {isEvent && <PreviewField label="Location" value={location || 'Not set'} />}
                        <PreviewField label="Created by" value={item.author?.username || 'Admin'} />
                        <PreviewField label="Created" value={formatTimestamp(item.created_at)} />
                        <PreviewField label="Last updated" value={formatTimestamp(item.updated_at)} />
                    </div>

                    <div className="mt-6">
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Description</p>
                        <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600">{item.description || 'No description provided.'}</p>
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

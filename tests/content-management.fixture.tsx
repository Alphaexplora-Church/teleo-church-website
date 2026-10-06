// Development-only fixture. All requests are intercepted; no church data is used.
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../src/shared/context/authContextInstance';
import AdminContentView from '../src/features/Admin/content/view/AdminContentView';
import '../src/index.css';

const scenario = new URLSearchParams(location.search).get('scenario') ?? 'populated';
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const titles = ['Rooted: A Journey Through Colossians', 'Practicing prayer in everyday life', 'The Sermon on the Mount', 'Walking together in faith'];
const journeys = Array.from({ length: scenario === 'empty' ? 0 : 61 }, (_, n) => ({
    journeyId: id(n + 1), title: `${titles[n % 4]}${n > 3 ? ` · ${n + 1}` : ''}`,
    description: 'A thoughtful series for our congregation. Read, reflect, and grow together through weekly teaching and practical passages.',
    summary: 'Explore Scripture together and bring it into daily life.',
    contentType: ['sunday_service', 'bible_study', 'devotional', 'general'][n % 4],
    status: ['draft', 'published', 'archived'][n % 3], thumbnailUrl: null,
    categories: n % 2 ? ['Prayer', 'Community'] : ['Faith', 'Discipleship', 'Scripture'], totalPublishedParts: 1,
    createdAt: new Date(Date.UTC(2026, 9, 7 - n)).toISOString(), updatedAt: new Date(Date.UTC(2026, 9, 7 - (n % 7))).toISOString(),
}));
const partsByJourney = new Map(journeys.map(j => [j.journeyId, [
    { partId: id(1000 + Number(j.journeyId.slice(-12)) * 10), partOrder: 1, title: 'The foundation', status: 'published', mediaUrl: null, readingText: 'Read the passage slowly.\n\nWhat does this teaching invite us to practice this week?', mediaType: null },
    { partId: id(1001 + Number(j.journeyId.slice(-12)) * 10), partOrder: 2, title: 'Reflection and next steps', status: 'draft', mediaUrl: null, readingText: null, mediaType: null },
]]));
let nextId = 9000;
window.fetch = async (input, init = {}) => {
    if (init.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const url = new URL(String(input), location.origin);
    const method = init.method ?? 'GET';
    const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
    if (url.hostname.includes('youtube') || url.hostname.includes('vimeo')) return respond({ title: 'Fixture teaching video', thumbnail_url: '' });
    if (!url.pathname.startsWith('/api/journeys')) throw new Error(`Fixture blocked an unexpected request: ${url.pathname}`);
    if (scenario === 'error') return respond({ error: 'Fixture: the service is unavailable. Try again.' }, 503);
    if (scenario === 'slow') await new Promise(resolve => setTimeout(resolve, 1200));
    if (url.pathname.endsWith('/categories')) return scenario === 'category-error' ? respond({ error: 'Fixture: categories unavailable.' }, 503) : respond({ categories: ['Faith', 'Prayer', 'Discipleship', 'Community', 'Scripture', 'Hope'].map((name, n) => ({ categoryId: id(200 + n), name, sortOrder: n })) });
    if (url.pathname.endsWith('/discover')) {
        const term = (url.searchParams.get('search') ?? '').toLowerCase();
        const rows = journeys.filter(j => (!term || [j.title, j.summary, j.description, ...j.categories].some(s => s.toLowerCase().includes(term))) && (!url.searchParams.get('status') || j.status === url.searchParams.get('status')) && (!url.searchParams.get('content_type') || j.contentType === url.searchParams.get('content_type')) && (!url.searchParams.get('category') || j.categories.includes(url.searchParams.get('category')!)));
        const page = Number(url.searchParams.get('page') ?? 1); const limit = Number(url.searchParams.get('limit') ?? 50);
        return respond({ journeys: rows.slice((page - 1) * limit, page * limit), pagination: { page, limit, total: rows.length, totalPages: Math.ceil(rows.length / limit) } });
    }
    if (url.pathname === '/api/journeys' && method === 'POST') {
        const body = JSON.parse(String(init.body)); const journeyId = id(++nextId);
        journeys.unshift({ ...journeys[0], ...body, journeyId, title: body.title, contentType: body.content_type, categories: ['Faith'], status: 'draft', totalPublishedParts: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        partsByJourney.set(journeyId, []); return respond({ journeyId });
    }
    const segments = url.pathname.split('/').filter(Boolean); const journey = journeys.find(j => j.journeyId === segments[2]);
    if (!journey) return respond({ error: 'Fixture journey not found.' }, 404);
    const parts = partsByJourney.get(journey.journeyId)!;
    if (segments[3] === 'parts') {
        if (method === 'POST') { const body = JSON.parse(String(init.body)); const partId = id(++nextId); parts.push({ partId, partOrder: parts.length + 1, title: body.title, status: 'draft', mediaUrl: null, readingText: null, mediaType: null }); return respond({ partId }); }
        const body = init.body ? JSON.parse(String(init.body)) : {};
        if (segments[4] === 'reorder') { body.orderedPartIds.forEach((partId: string, n: number) => { const part = parts.find(p => p.partId === partId); if (part) part.partOrder = n + 1; }); return respond({}); }
        const part = parts.find(p => p.partId === segments[4]);
        if (!part) return respond({ error: 'Part not found' }, 404);
        if (segments[5] === 'archive') part.status = 'archived';
        else if (segments[5] === 'publish') part.status = body.status;
        else Object.assign(part, { title: body.title, mediaUrl: body.media_url, readingText: body.reading_text, mediaType: body.media_type });
    } else if (segments[3] === 'archive') journey.status = 'archived';
    else if (segments[3] === 'publish') { if (!parts.some(p => p.status === 'published')) return respond({ error: 'At least one Published Part is required.' }, 400); journey.status = 'published'; }
    else if (method === 'PATCH') { const body = JSON.parse(String(init.body)); Object.assign(journey, { title: body.title, description: body.description, summary: body.summary, contentType: body.content_type }); }
    journey.totalPublishedParts = parts.filter(p => p.status === 'published').length;
    return respond({ journey, parts: [...parts].sort((a, b) => a.partOrder - b.partOrder) });
};

createRoot(document.getElementById('root')!).render(
    <MemoryRouter initialEntries={['/admin/content']}><AuthContext.Provider value={{ user: { email: 'fixture@example.invalid', username: 'Local test fixture', roles: ['super_admin'] }, isAuthenticated: true, isLoading: false, features: null, login: async () => {}, logout: async () => {} }}>
        <AdminContentView />
    </AuthContext.Provider></MemoryRouter>,
);

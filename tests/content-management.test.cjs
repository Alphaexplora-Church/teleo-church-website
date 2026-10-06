const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(relative, fetch = async () => { throw new Error('Unexpected request'); }) {
    const source = fs.readFileSync(path.join(__dirname, '../src/features/Admin/content', relative), 'utf8').replace('import.meta.env.VITE_API_BASE_URL', 'undefined');
    const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const module = { exports: {} };
    vm.runInNewContext(js, { module, exports: module.exports, require, fetch, URLSearchParams, Response, FormData, AbortController, window: { localStorage: { getItem: () => 'fixture-church' }, setTimeout, clearTimeout }, console });
    return module.exports;
}
const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
const row = n => ({ journeyId: `j${n}`, title: `Journey ${n}`, contentType: 'bible_study', status: 'draft', categories: ['Faith'], totalPublishedParts: 3, description: 'Description', createdAt: '2026-10-01', updatedAt: '2026-10-02' });

test('fetches complete catalogs for 0, 1, 8, 9 and 61 records, with authenticated church scope', async () => {
    for (const size of [0, 1, 8, 9, 61]) {
        const calls = [];
        const { AdminContentService } = load('model/adminContent.service.ts', async (url, init) => {
            calls.push(url);
            assert.equal(init.credentials, 'include');
            const query = new URL(url).searchParams;
            assert.equal(query.get('churchId'), 'fixture-church');
            const page = Number(query.get('page'));
            return json({ journeys: Array.from({ length: size }, (_, n) => row(n)).slice((page - 1) * 50, page * 50), pagination: { page, totalPages: Math.ceil(size / 50), total: size, limit: 50 } });
        });
        const items = await AdminContentService.fetchJourneys();
        assert.equal(items.length, size);
        assert.equal(calls.length, Math.max(1, Math.ceil(size / 50)));
        if (size) { assert.equal(items[0].totalPublishedParts, 3); assert.equal(items[0].parts.length, 0); }
    }
});

test('deduplicates page overlap and retains filter parameters on each page', async () => {
    const calls = [];
    const { AdminContentService } = load('model/adminContent.service.ts', async url => {
        const q = new URL(url).searchParams; calls.push(q);
        return json({ journeys: Number(q.get('page')) === 1 ? [row(1), row(2)] : [row(2), row(3)], pagination: { totalPages: 2 } });
    });
    const items = await AdminContentService.fetchJourneys({ search: 'faith', status: 'draft', category: 'Faith', contentType: 'bible-study' });
    assert.equal(items.length, 3);
    for (const q of calls) { assert.equal(q.get('search'), 'faith'); assert.equal(q.get('category'), 'Faith'); assert.equal(q.get('status'), 'draft'); assert.equal(q.get('content_type'), 'bible_study'); }
});

test('failed later pages and malformed pagination reject instead of exposing partial totals', async () => {
    const { AdminContentService } = load('model/adminContent.service.ts', async url => Number(new URL(url).searchParams.get('page')) === 1 ? json({ journeys: [row(1)], pagination: { totalPages: 2 } }) : json({ error: 'Later page failed' }, 503));
    await assert.rejects(AdminContentService.fetchJourneys(), /Later page failed/);
    const malformed = load('model/adminContent.service.ts', async () => json({ journeys: [row(1)] }));
    await assert.rejects(malformed.AdminContentService.fetchJourneys(), /incomplete pagination/);
});

test('passes cancellation through all discovery requests', async () => {
    const controller = new AbortController(); let calls = 0;
    const { AdminContentService } = load('model/adminContent.service.ts', async (_, init) => {
        calls++;
        assert.equal(init.signal, controller.signal);
        if (init.signal.aborted) throw new Error('Aborted');
        controller.abort();
        return json({ journeys: [row(1)], pagination: { totalPages: 2 } });
    });
    await assert.rejects(AdminContentService.fetchJourneys({}, controller.signal), /Aborted/);
    assert.equal(calls, 2);
});

test('sorts complete data before slicing, uses stable ties and leaves input unchanged', () => {
    const { sortJourneys } = load('model/contentCollection.ts');
    const items = [{ id: 'b', title: 'Alpha', createdAt: '2026-10-01', updatedAt: '2026-10-05' }, { id: 'a', title: 'alpha', createdAt: '2026-10-03', updatedAt: '2026-10-01' }, { id: 'c', title: 'Beta', createdAt: '2026-10-02', updatedAt: '2026-10-04' }];
    assert.equal(sortJourneys(items, 'title').map(j => j.id).join(), 'a,b,c');
    assert.equal(sortJourneys(items, 'created').map(j => j.id).join(), 'a,c,b');
    assert.equal(sortJourneys(items, 'updated').map(j => j.id).join(), 'b,c,a');
    assert.equal(items.map(j => j.id).join(), 'b,a,c');
});

test('detail count is derived from real Parts without fetching provider previews', async () => {
    let requests = 0;
    const { AdminContentService } = load('model/adminContent.service.ts', async () => {
        requests++; return json({ journey: row(1), parts: [{ partId: 'part', partOrder: 1, title: 'Part', status: 'published', mediaUrl: 'https://youtu.be/abcdefghijk' }, { partId: 'draft', partOrder: 2, title: 'Draft', status: 'draft' }] });
    });
    const detail = await AdminContentService.fetchJourneyDetail('j1', { previews: false });
    assert.equal(detail.parts.length, 2); assert.equal(detail.totalPublishedParts, 1); assert.equal(requests, 1);
});

test('retry after Part-content failure reuses created Journey and Part IDs', async () => {
    const journeyId = '00000000-0000-4000-8000-000000000001';
    const partId = '00000000-0000-4000-8000-000000000002';
    let journeyPosts = 0; let partPosts = 0; let failContent = true;
    const { AdminContentService } = load('model/adminContent.service.ts', async (url, init) => {
        const pathname = new URL(url).pathname;
        if (pathname.endsWith('/categories')) return json({ categories: [{ categoryId: 'category', name: 'Faith', sortOrder: 0 }] });
        if (pathname === '/api/journeys' && init.method === 'POST') { journeyPosts++; return json({ journeyId }); }
        if (pathname.endsWith('/parts') && init.method === 'POST') { partPosts++; return json({ partId }); }
        if (init.method === 'PUT' && failContent) { failContent = false; return json({ error: 'Content save failed' }, 503); }
        if (!init.method) return json({ journey: { ...row(1), journeyId }, parts: [{ partId, partOrder: 1, title: 'Reading', status: 'draft', readingText: null }] });
        return json({});
    });
    const form = { title: 'Journey', description: 'Description', contentType: 'bible-study', categories: ['Faith'], summary: '' };
    const parts = [{ id: 'local-part', order: 1, title: 'Reading', type: 'text', status: 'draft', textContent: 'Passage' }];
    const progress = { partIds: {} };
    await assert.rejects(AdminContentService.createJourney(form, parts, undefined, undefined, progress), /Content save failed/);
    assert.equal(progress.journeyId, journeyId); assert.equal(progress.partIds['local-part'], partId);
    await AdminContentService.createJourney(form, parts, undefined, undefined, progress);
    assert.equal(journeyPosts, 1); assert.equal(partPosts, 1);
});

test('definitive create rejection allows retry; uncertain network outcome blocks duplicate creation', async () => {
    const form = { title: 'Journey', description: 'Description', contentType: 'bible-study', categories: ['Faith'], summary: '' };
    for (const uncertain of [false, true]) {
        let posts = 0;
        const { AdminContentService } = load('model/adminContent.service.ts', async (url, init) => {
            if (new URL(url).pathname.endsWith('/categories')) return json({ categories: [{ categoryId: 'category', name: 'Faith', sortOrder: 0 }] });
            if (init.method === 'POST') { posts++; if (uncertain) throw new Error('Network interrupted'); return json({ error: 'Invalid metadata' }, 400); }
            throw new Error('Unexpected request');
        });
        const progress = { partIds: {} };
        await assert.rejects(AdminContentService.createJourney(form, [], undefined, undefined, progress));
        assert.equal(Boolean(progress.uncertainJourney), uncertain);
        await assert.rejects(AdminContentService.createJourney(form, [], undefined, undefined, progress));
        assert.equal(posts, uncertain ? 1 : 2);
    }
});

import type { Journey, JourneySort } from './adminContent.types';

export function sortJourneys(items: Journey[], sort: JourneySort): Journey[] {
    return [...items].sort((a, b) => {
        const comparison = sort === 'title'
            ? a.title.localeCompare(b.title, 'en', { sensitivity: 'base' })
            : (Date.parse(sort === 'updated' ? b.updatedAt : b.createdAt) || 0)
                - (Date.parse(sort === 'updated' ? a.updatedAt : a.createdAt) || 0);
        return comparison || a.id.localeCompare(b.id);
    });
}

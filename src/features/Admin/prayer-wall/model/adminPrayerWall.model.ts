import type { NewPrayerForm, PrayerRequest } from './adminPrayerWall.types';

const STORAGE_KEY = 'adminPrayerWallPreview';

// Sample requests shown when no local data exists.
const SAMPLE_PRAYERS: PrayerRequest[] = [
    {
        id: 'prayer-1',
        author: 'Sarah K.',
        message: 'If anyone is up, I need prayer urgently right now.',
        description: "I just received some difficult news about my health and I'm feeling overwhelmed and scared. Please pray for peace, wisdom for the doctors, and healing if it is God's will.",
        createdAt: new Date(Date.now() - 86_400_000).toISOString(),
        prayerCount: 18,
        commentCount: 4,
    },
    {
        id: 'prayer-2',
        author: 'Daniel M.',
        message: 'Please pray for peace, wisdom, and strength for our family this week.',
        description: 'Our family is facing several important decisions this week. Please pray that we remain patient, united, and guided by wisdom.',
        createdAt: new Date(Date.now() - 172_800_000).toISOString(),
        prayerCount: 27,
        commentCount: 6,
    },
    {
        id: 'prayer-3',
        author: 'Anonymous',
        message: 'Praying for healing and a good result from an upcoming medical appointment.',
        description: 'I have an upcoming medical appointment and would appreciate prayers for courage, healing, and a reassuring result.',
        createdAt: new Date(Date.now() - 259_200_000).toISOString(),
        prayerCount: 35,
        commentCount: 8,
    },
    {
        id: 'prayer-4',
        author: 'Maria L.',
        message: 'Guidance for a new season',
        description: 'Please pray that I make wise decisions as I begin a new season in my career and personal life.',
        createdAt: new Date(Date.now() - 345_600_000).toISOString(),
        prayerCount: 14,
        commentCount: 2,
    },
    {
        id: 'prayer-5',
        author: 'Joshua P.',
        message: 'Strength for my studies',
        description: 'I am preparing for important examinations and need focus, discipline, and peace throughout the process.',
        createdAt: new Date(Date.now() - 432_000_000).toISOString(),
        prayerCount: 21,
        commentCount: 3,
    },
    {
        id: 'prayer-6',
        author: 'Leah R.',
        message: 'Prayer for my grandmother',
        description: 'My grandmother is recovering at home. Please pray for renewed strength, comfort, and complete healing.',
        createdAt: new Date(Date.now() - 518_400_000).toISOString(),
        prayerCount: 32,
        commentCount: 5,
    },
    {
        id: 'prayer-7',
        author: 'Nathan C.',
        message: 'Peace for our community',
        description: 'Please pray for unity, understanding, and peace among families and leaders in our local community.',
        createdAt: new Date(Date.now() - 604_800_000).toISOString(),
        prayerCount: 26,
        commentCount: 4,
    },
    {
        id: 'prayer-8',
        author: 'Grace T.',
        message: 'A friend needs encouragement',
        description: 'A close friend is going through a difficult time. Please pray that they feel supported, hopeful, and loved.',
        createdAt: new Date(Date.now() - 691_200_000).toISOString(),
        prayerCount: 19,
        commentCount: 2,
    },
    {
        id: 'prayer-9',
        author: 'Michael D.',
        message: 'Wisdom for our church leaders',
        description: 'Please pray for wisdom, strength, and protection for our pastors and ministry leaders as they serve.',
        createdAt: new Date(Date.now() - 777_600_000).toISOString(),
        prayerCount: 41,
        commentCount: 7,
    },
    {
        id: 'prayer-10',
        author: 'Anonymous',
        message: 'Restoration in our family',
        description: 'Please pray for forgiveness, patient conversations, and restored relationships within our family.',
        createdAt: new Date(Date.now() - 864_000_000).toISOString(),
        prayerCount: 29,
        commentCount: 6,
    },
    {
        id: 'prayer-11',
        author: 'Esther B.',
        message: 'Safe travels this week',
        description: 'Our family will be traveling a long distance. Please pray for safety, good health, and a peaceful journey.',
        createdAt: new Date(Date.now() - 950_400_000).toISOString(),
        prayerCount: 12,
        commentCount: 1,
    },
    {
        id: 'prayer-12',
        author: 'Samuel J.',
        message: 'Provision for daily needs',
        description: 'Please pray for stable work and provision as our household manages several unexpected expenses.',
        createdAt: new Date(Date.now() - 1_036_800_000).toISOString(),
        prayerCount: 24,
        commentCount: 3,
    },
];

export const AdminPrayerWallModel = {
    // Loads saved requests for this frontend preview.
    getPrayers: (): PrayerRequest[] => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return SAMPLE_PRAYERS;

            // Adds descriptions to older locally saved sample requests.
            const savedPrayers = (JSON.parse(saved) as PrayerRequest[]).map(prayer => ({
                ...prayer,
                description: prayer.description
                    || SAMPLE_PRAYERS.find(sample => sample.id === prayer.id)?.description
                    || prayer.message,
            }));

            // Adds any new samples without duplicating saved requests.
            const savedIds = new Set(savedPrayers.map(prayer => prayer.id));
            return [...savedPrayers, ...SAMPLE_PRAYERS.filter(prayer => !savedIds.has(prayer.id))];
        } catch {
            return SAMPLE_PRAYERS;
        }
    },

    // Saves requests in the browser.
    savePrayers: (prayers: PrayerRequest[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prayers));
    },

    // Builds a new prayer request.
    createPrayer: (form: NewPrayerForm): PrayerRequest => ({
        id: crypto.randomUUID(),
        author: form.author.trim() || 'Anonymous',
        message: form.message.trim(),
        description: form.description.trim(),
        createdAt: new Date().toISOString(),
        prayerCount: 0,
        commentCount: 0,
    }),
};

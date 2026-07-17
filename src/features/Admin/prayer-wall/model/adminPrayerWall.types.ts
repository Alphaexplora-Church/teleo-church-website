export interface PrayerRequest {
    id: string;
    author: string;
    message: string;
    description?: string;
    createdAt: string;
    prayerCount: number;
    commentCount: number;
}

export interface NewPrayerForm {
    author: string;
    message: string;
    description: string;
}

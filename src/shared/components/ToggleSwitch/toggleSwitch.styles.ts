export type ToggleSwitchSize = "sm" | "md" | "lg";

export interface ToggleSwitchSizeConfig {
    track: string;
    thumb: string;
    travelDistance: number; // Pixels na gagalawin ng knob
    text: string;
}

export const toggleSwitchSizes: Record<ToggleSwitchSize, ToggleSwitchSizeConfig> = {
    sm: {
        track: "h-5 w-9 p-0.5",
        thumb: "h-4 w-4",
        travelDistance: 16,
        text: "text-xs",
    },
    md: {
        track: "h-6 w-11 p-0.5",
        thumb: "h-5 w-5",
        travelDistance: 20,
        text: "text-sm",
    },
    lg: {
        track: "h-7 w-14 p-0.5",
        thumb: "h-6 w-6",
        travelDistance: 28,
        text: "text-base",
    },
};
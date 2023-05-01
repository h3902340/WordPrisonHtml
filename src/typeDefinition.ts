export interface ILevel {
    Begin(): void;
}

export type Slot = {
    rect: Rect;
    isVerb: boolean;
    card: Card | null;
}

export type Card = {
    rect: Rect;
    inventoryX: number;
    inventoryY: number;
    word: string;
    isVerb: boolean;
    isSelected: boolean;
}

export type Rect = {
    x: number;
    y: number;
    w: number;
    h: number;
};

export type Position = {
    x: number;
    y: number;
}
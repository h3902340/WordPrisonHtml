export interface ILevel {
    begin(): void;
    onCanvasClick(mousePos: Position): void;
}

export type LevelTable = {
    CardTable: CardDef[];
    SentenceTable: SentenceDef[];
    DialogueTable: DialogueDef[];
}

export type CardValue = {
    Word: string;
    PartOfSpeech: string;
}

export type SentenceKey = {
    CardID1: number;
    CardID2: number;
    CardID3: number;
    Status: string;
}

export type SentenceValue = {
    NewCardID: number[];
    DialogueID: number;
}

export const noun: string = "名";
export const verb: string = "動";

export type CardDef = {
    ID: number;
    Word: string;
    PartOfSpeech: string;
};

export type SentenceDef = {
    CardID1: number;
    CardID2: number;
    CardID3: number;
    Status: string;
    NewCardID: number[];
    DialogueID: number;
}

export type DialogueDef = {
    ID: number;
    Dialogue: string;
};

export type Card = {
    rect: Rect;
    inventoryX: number;
    inventoryY: number;
    word: string;
    partOfSpeech: string;
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
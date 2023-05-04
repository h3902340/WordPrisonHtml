export interface ILevel {
    begin(): void;
    onCanvasClick(mousePos: Position): void;
}

export interface IClickable {
    CheckIfHit(mousePos: Position): boolean;
}

export type SentenceKey = {
    CardID1: number;
    CardID2: number;
    CardID3: number;
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
    Condition: string;
    NewCardID: number[];
    DialogueID: number;
    Consequence: string;
}

export type DialogueDef = {
    ID: number;
    Dialogue: string;
};

export type FallbackDef = {
    CardID1: number;
    CardID2: number;
    CardID3: number;
    Condition: string;
    FallbackDialogueID: number;
};

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
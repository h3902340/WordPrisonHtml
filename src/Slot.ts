import { verb_color, noun_color } from "./GlobalSetting";
import { Card, Rect, verb } from "./TypeDefinition";
import { clearRect, drawCard, drawHollowRect } from "./Utility";

export class Slot {
    private readonly rect: Rect;
    private readonly partOfSpeech: string;
    private readonly lineWidth = 6;
    private card: Card;

    constructor(rect: Rect, partOfSpeech: string, card: Card) {
        this.rect = rect;
        this.partOfSpeech = partOfSpeech;
        this.card = card;
    }

    public drawSlot(): void {
        clearRect(this.rect);
        if (this.partOfSpeech == verb) {
            drawHollowRect(this.rect, verb_color, this.lineWidth);
        } else {
            drawHollowRect(this.rect, noun_color, this.lineWidth);
        }
        if (this.card) {
            drawCard(this.card);
        }
    }

    public InsertCard(card: Card): void {
        this.card = card;
        card.isSelected = true;
        card.rect.x = this.rect.x + (this.rect.w - card.rect.w) * .5;
        card.rect.y = this.rect.y;
    }

    public IsPartOfSpeechEqual(partOfSpeech: string): boolean {
        return this.partOfSpeech == partOfSpeech;
    }

    public RemoveCard(): void {
        this.card = null;
    }

    public IsCardEqual(card: Card): boolean {
        return this.card == card;
    }

    public GetCardID(): number {
        if (!this.card) return -1;
        return this.card.cardInfo.ID;
    }

    public HasCard(): boolean {
        return this.card != null;
    }
}
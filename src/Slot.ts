import { verb_color, noun_color } from "./GlobalSetting";
import { Card, Rect, verb } from "./TypeDefinition";
import { clearRect, drawCardFromCenter, drawHollowRect } from "./Utility";

export class Slot {
    public rect: Rect;
    public partOfSpeech: string;
    private card: Card;
    private readonly lineWidth = 6;

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
            drawCardFromCenter(this.card, this.rect.x + this.rect.w * .5, this.rect.y + this.rect.h * .5);
        }
    }

    public InsertCard(card: Card): void {
        this.card = card;
        card.isSelected = true;
        card.rect.x = this.rect.x + (this.rect.w - card.rect.w) * .5;
        card.rect.y = this.rect.y;
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
}
import { Card } from "./Card";
import { verb_color, noun_color } from "./GlobalSetting";
import { IClickable, Position, Rect, verb } from "./TypeDefinition";
import { clearRect, drawHollowRect, isInside } from "./Utility";

export class Slot implements IClickable {
    private readonly rect: Rect;
    private readonly partOfSpeech: string;
    private readonly lineWidth = 6;
    private card: Card;

    constructor(rect: Rect, partOfSpeech: string, card: Card) {
        this.rect = rect;
        this.partOfSpeech = partOfSpeech;
        this.card = card;
    }

    public CheckIfHit(mousePos: Position): boolean {
        return isInside(mousePos, this.rect);
    }

    public CheckIfHitCard(_mousePos: Position): Card {
        return this.card;
    }

    public drawSlot(): void {
        clearRect(this.rect);
        if (this.partOfSpeech == verb) {
            drawHollowRect(this.rect, verb_color, this.lineWidth);
        } else {
            drawHollowRect(this.rect, noun_color, this.lineWidth);
        }
        if (this.card) {
            this.card.drawCard();
        }
    }

    public AddCard(card: Card): void {
        this.card = card;
        card.PlaceAt({
            x: this.rect.x + (this.rect.w - card.GetRect().w) * .5,
            y: this.rect.y
        });
    }

    public IsPartOfSpeechEqual(partOfSpeech: string): boolean {
        return this.partOfSpeech == partOfSpeech;
    }

    public RemoveCard(): Card {
        let card: Card = this.card;
        this.card = null;
        return card;
    }

    public IsCardEqual(card: Card): boolean {
        return this.card == card;
    }

    public GetCardID(): number {
        if (!this.card) return -1;
        return this.card.GetCardID();
    }

    public HasCard(): boolean {
        return this.card != null;
    }
}
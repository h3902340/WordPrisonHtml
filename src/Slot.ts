import { verb_color, noun_color } from "./GlobalSetting";
import { Card, Rect, verb } from "./TypeDefinition";
import {clearRect, drawCardFromCenter, drawHollowRect} from "./Utility";

export class Slot{
    public rect: Rect;
    public partOfSpeech: string;
    public card: Card;
    private readonly lineWidth = 6;

    constructor(rect: Rect, partOfSpeech: string, card: Card){
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
}
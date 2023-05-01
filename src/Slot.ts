import { verb_color, noun_color } from "./GlobalSetting";
import { Card, Rect } from "./TypeDefinition";
import {drawCardFromCenter, drawHollowRect} from "./Util";

export class Slot{
    public rect: Rect;
    public isVerb: boolean;
    public card: Card;
    private readonly lineWidth = 6;

    constructor(rect: Rect, isVerb: boolean, card: Card){
        this.rect = rect;
        this.isVerb = isVerb;
        this.card = card;
    }

    public drawSlot(): void {
        if (this.isVerb) {
            drawHollowRect(this.rect, verb_color, this.lineWidth);
        } else {
            drawHollowRect(this.rect, noun_color, this.lineWidth);
        }
        if (this.card) {
            drawCardFromCenter(this.card, this.rect.x + this.rect.w * .5, this.rect.y + this.rect.h * .5);
        }
    }
}
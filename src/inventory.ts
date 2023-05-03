import { card_height, card_width_unit, inventory_background_color } from "./GlobalSetting";
import { Card, CardDef, Position, Rect } from "./TypeDefinition";
import { clearRect, drawCard, drawFilledRect } from "./Utility";

export class Inventory {
    public cardArray: Card[] = [];
    private readonly rect: Rect;
    private readonly padding: number;
    private currentTail: Position;

    constructor(rect: Rect, padding: number) {
        this.rect = rect;
        this.padding = padding;
        this.currentTail = {
            x: rect.x + padding,
            y: rect.y + padding
        };
    }

    public drawInventory(): void {
        clearRect(this.rect);
        drawFilledRect(this.rect, inventory_background_color)
        for (let i = 0; i < this.cardArray.length; i++) {
            if (this.cardArray[i].isSelected) continue;
            drawCard(this.cardArray[i]);
        }
    }

    public addCard(cardInfo: CardDef): void {
        let cardWidth = card_width_unit * cardInfo.Word.length;
        let nextTailX = this.currentTail.x + this.padding + cardWidth;
        if (nextTailX > this.rect.x + this.rect.w) {
            this.currentTail.y += this.padding + card_height;
            this.currentTail.x = this.rect.x + this.padding;
        }
        this.cardArray.push({
            rect: {
                x: this.currentTail.x,
                y: this.currentTail.y,
                w: cardWidth,
                h: card_height,
            },
            inventoryX: this.currentTail.x,
            inventoryY: this.currentTail.y,
            cardInfo: cardInfo,
            isSelected: false
        });
        this.currentTail.x += cardWidth + this.padding;
    }
}
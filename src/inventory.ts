import { card_height, card_width_unit, inventory_background_color } from "./GlobalSetting";
import { Card, CardDef, Position, Rect } from "./TypeDefinition";
import { clearRect, drawCardFromTopLeft, drawFilledRect } from "./Utility";

export class Inventory {
    public cardArray: Card[] = [];

    private readonly originTail: Position = {x:110, y: 350};
    private currentTail: Position;
    private readonly rect: Rect = {
        x: 100,
        y: 340,
        w: 600,
        h: 220
    };

    constructor(){
        this.currentTail = {
            x: this.originTail.x,
            y: this.originTail.y
        };
    }

    public drawInventory(): void {
        clearRect(this.rect);
        drawFilledRect(this.rect, inventory_background_color)
        for (let i = 0; i < this.cardArray.length; i++) {
            if (this.cardArray[i].isSelected) continue;
            drawCardFromTopLeft(this.cardArray[i]);
        }
    }

    public addCard(cardInfo: CardDef): void {
        let cardWidth = card_width_unit * cardInfo.Word.length;
        let nextTailX = this.currentTail.x + 10 + cardWidth;
        if (nextTailX > 700) {
            this.currentTail.y += 10 + card_height;
            this.currentTail.x = this.originTail.x;
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
        this.currentTail.x += cardWidth + 10;
    }
}
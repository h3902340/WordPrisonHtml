import { card_height, card_width_unit, inventory_background_color } from "./globalSetting";
import { Card, Rect } from "./typeDefinition";
import { drawCardFromTopLeft, drawRect } from "./util";

export class Inventory {
    public cardArray: Card[] = [];

    private inventoryTailX: number = 110;
    private inventoryTailY: number = 350;
    private readonly rect: Rect = {
        x: 100,
        y: 340,
        w: 600,
        h: 220
    };

    public drawInventory(): void {
        drawRect(this.rect, inventory_background_color)

        for (let i = 0; i < this.cardArray.length; i++) {
            if (this.cardArray[i].isSelected) continue;
            drawCardFromTopLeft(this.cardArray[i]);
        }
    }

    public addCard(word: string, isVerb: boolean): void {
        let cardWidth = card_width_unit * word.length;
        let nextTailX = this.inventoryTailX + 10 + cardWidth;
        if (nextTailX > 600) {
            this.inventoryTailY += 10 + card_height;
        }
        this.cardArray.push({
            rect: {
                x: this.inventoryTailX,
                y: this.inventoryTailY,
                w: cardWidth,
                h: card_height,
            },
            inventoryX: this.inventoryTailX,
            inventoryY: this.inventoryTailY,
            word: word,
            isVerb: isVerb,
            isSelected: false
        });
        this.inventoryTailX = this.inventoryTailX + cardWidth + 10;
    }
}
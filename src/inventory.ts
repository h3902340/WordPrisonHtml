import { card_height, card_width_unit, inventory_background_color } from "./GlobalSetting";
import { Card, CardValue, Rect } from "./TypeDefinition";
import { clearRect, drawCardFromTopLeft, drawFilledRect } from "./Utility";

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
        clearRect(this.rect);
        drawFilledRect(this.rect, inventory_background_color)
        for (let i = 0; i < this.cardArray.length; i++) {
            if (this.cardArray[i].isSelected) continue;
            drawCardFromTopLeft(this.cardArray[i]);
        }
    }

    public addCard(cardInfo: CardValue): void {
        let cardWidth = card_width_unit * cardInfo.Word.length;
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
            word: cardInfo.Word,
            partOfSpeech: cardInfo.PartOfSpeech,
            isSelected: false
        });
        this.inventoryTailX = this.inventoryTailX + cardWidth + 10;
    }
}
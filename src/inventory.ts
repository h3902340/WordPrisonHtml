import { card_height, inventory_background_color } from "./GlobalSetting";
import { IClickable, Position, Rect } from "./TypeDefinition";
import { clearRect, drawFilledRect, isInside } from "./Utility";
import { Card } from './Card';

export class Inventory implements IClickable {
    private cardArray: { card: Card, originalPos: Position, isRemoved: boolean }[] = [];
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

    public CheckIfHit(mousePos: Position): boolean {
        return isInside(mousePos, this.rect);
    }

    public CheckIfHitCard(mousePos: Position): Card {
        for (let i = 0; i < this.cardArray.length; i++) {
            if (this.cardArray[i].isRemoved) continue;
            if (isInside(mousePos, this.cardArray[i].card.GetRect())) {
                return this.cardArray[i].card;
            }
        }
        return null;
    }

    public drawInventory(): void {
        clearRect(this.rect);
        drawFilledRect(this.rect, inventory_background_color)
        for (let i = 0; i < this.cardArray.length; i++) {
            if (this.cardArray[i].isRemoved) continue;
            this.cardArray[i].card.drawCard();
        }
    }

    public AddCard(card: Card): void {
        // 如果已經在cardArray內，表示已經加過，只是被移走。這時把card設回原本位置。
        for (let i = 0; i < this.cardArray.length; i++) {
            if (this.cardArray[i].card != card) continue;
            this.cardArray[i].isRemoved = false;
            this.cardArray[i].card.PlaceAt(this.cardArray[i].originalPos);
            return;
        }

        // 如果card是新的，則將位置設在最後。
        let nextTailX = this.currentTail.x + this.padding + card.GetRect().w;
        if (nextTailX > this.rect.x + this.rect.w) {
            this.currentTail.y += this.padding + card_height;
            this.currentTail.x = this.rect.x + this.padding;
        }

        let cardPosition: Position = {
            x: this.currentTail.x,
            y: this.currentTail.y
        };
        this.cardArray.push({
            card: card,
            originalPos: cardPosition,
            isRemoved: false
        });
        card.PlaceAt(cardPosition);

        this.currentTail.x += card.GetRect().w + this.padding;
    }

    public RemoveCard(card: Card): Card {
        for (let i = 0; i < this.cardArray.length; i++) {
            if (this.cardArray[i].card != card) continue;
            this.cardArray[i].isRemoved = true;
            return card;
        }
        return null;
    }
}
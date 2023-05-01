import { Inventory } from "./inventory";
import { ILevel, Position, Slot } from "./typeDefinition";
import { say, drawSlot, clearCanvas, canvas, getMousePos, isInside } from "./util";

export class Level1 implements ILevel {
    private inventory: Inventory;
    private slotArray: Slot[] = [{
        rect: {
            x: 145,
            y: 270,
            w: 150,
            h: 50,
        }, isVerb: false,
        card: null
    },
    {
        rect: {
            x: 325,
            y: 270,
            w: 150,
            h: 50
        },
        isVerb: true,
        card: null
    }, {
        rect: {
            x: 505,
            y: 270,
            w: 150,
            h: 50
        },
        isVerb: false,
        card: null
    }];
    constructor() {
        this.inventory = new Inventory();
    }

    public Begin(): void {
        this.entrySequence();
    }

    private async entrySequence(): Promise<void>{
        this.drawLevel();
        await say("這裡是哪裡？「我」醒了過來。發現在自己被困在一間「密室」。我摸著自己的口袋，沒有找到手機，無法對外聯繫。但發現一張詞卡「檢視」。這是做什麼用的？（獲得「密室」、「我」、「檢視」）");
        this.inventory.addCard("密室", false);
        this.inventory.addCard("我", false);
        this.inventory.addCard("檢視", true);
        canvas.addEventListener('click', this.checkCardClick.bind(this));
        this.drawLevel();
    }

    private checkCardClick(evt: MouseEvent): void {
        let mousePos: Position = getMousePos(canvas, evt);
        this.inventory.cardArray.forEach(card => {
            if (!isInside(mousePos, card.rect)) return;
            let needToRedrawLevel = false;
            if (card.isSelected) {
                card.rect.x = card.inventoryX;
                card.rect.y = card.inventoryY;
                card.isSelected = false;
                for (let i = 0; i < this.slotArray.length; i++) {
                    if (this.slotArray[i].card == card) {
                        this.slotArray[i].card = null;
                        break;
                    }
                }
                needToRedrawLevel = true;
            } else {
                for (let i = 0; i < this.slotArray.length; i++) {
                    let slot = this.slotArray[i];
                    if (slot.isVerb == card.isVerb) {
                        if (!slot.card) {
                            slot.card = card;
                            card.isSelected = true;
                            card.rect.x = slot.rect.x + (slot.rect.w - card.rect.w) * .5;
                            card.rect.y = slot.rect.y;
                            needToRedrawLevel = true;
                            break;
                        }
                    }
                }
            }

            if (needToRedrawLevel) {
                this.drawLevel();
            }
        });
    }

    private drawLevel(): void {
        clearCanvas({
            startPos: {
                x: 0,
                y: 270
            },
            endPos: {
                x: canvas.width,
                y: canvas.height
            }
        });
        for (let i = 0; i < this.slotArray.length; i++) {
            drawSlot(this.slotArray[i]);
        }
        this.inventory.drawInventory();
    }
}
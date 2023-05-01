import { Inventory } from "../Inventory";
import { CardValue, ILevel, LevelTable, Position, SentenceKey, SentenceValue, noun, verb } from "../TypeDefinition";
import { say, isInside } from "../Utility";
import { Slot } from "../Slot";
import levelTableJson from './Level1Table.json';

export class Level1 implements ILevel {
    private inventory: Inventory;
    private slotArray: Slot[];
    private readonly cardTable = new Map<number, CardValue>();
    private readonly sentenceTable = new Map<SentenceKey, SentenceValue>();
    private readonly dialogueTable = new Map<number, string>();

    constructor() {
        this.inventory = new Inventory();
        this.slotArray = [
            new Slot({ x: 145, y: 270, w: 150, h: 50, }, noun, null),
            new Slot({ x: 325, y: 270, w: 150, h: 50 }, verb, null),
            new Slot({ x: 505, y: 270, w: 150, h: 50 }, noun, null)
        ];
        let levelTableRaw: LevelTable = levelTableJson as LevelTable;

        levelTableRaw.CardTable.forEach(card => {
            this.cardTable.set(card.ID, {
                Word: card.Word,
                PartOfSpeech: card.PartOfSpeech
            });
        });
        levelTableRaw.SentenceTable.forEach(sentence => {
            this.sentenceTable.set({
                CardID1: sentence.CardID1,
                CardID2: sentence.CardID2,
                CardID3: sentence.CardID3,
                Status: sentence.Status,
            }, {
                NewCardID: sentence.NewCardID,
                DialogueID: sentence.DialogueID
            });
        });
        levelTableRaw.DialogueTable.forEach(dialogue => {
            this.dialogueTable.set(dialogue.ID, dialogue.Dialogue);
        });

        console.log("Hello!" + new Error().stack);
    }

    public begin(): void {
        this.entrySequence();
    }

    private async entrySequence(): Promise<void> {
        this.drawLevel();
        await say(this.dialogueTable.get(0));
        this.inventory.addCard(this.cardTable.get(2));
        this.inventory.addCard(this.cardTable.get(0));
        this.inventory.addCard(this.cardTable.get(1));
        this.drawLevel();
    }

    public onCanvasClick(mousePos: Position): void {
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
                    if (slot.partOfSpeech == card.partOfSpeech) {
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
        for (let i = 0; i < this.slotArray.length; i++) {
            this.slotArray[i].drawSlot();
        }
        this.inventory.drawInventory();
    }
}
import { Inventory } from "../Inventory";
import { TypeWriter } from "../TypeWriter";
import { CardDef, DialogueDef, ILevel, Position, SentenceDef, noun, verb } from "../TypeDefinition";
import { isInside } from "../Utility";
import { Slot } from "../Slot";
import cardTableJson from './CardTable.json';
import dialogueTableJson from './DialogueTable.json';
import sentenceTableJson from './SentenceTable.json';

export class Level1 implements ILevel {
    private readonly inventory: Inventory;
    private readonly slotArray: Slot[];
    private readonly typeWriter: TypeWriter;
    private readonly cardTable = new Map<number, CardDef>();
    private readonly sentenceTable: SentenceDef[];
    private readonly dialogueTable = new Map<number, string>();
    private levelState: Level1State;

    constructor() {
        this.inventory = new Inventory();
        this.slotArray = [
            new Slot({ x: 145, y: 270, w: 150, h: 50, }, noun, null),
            new Slot({ x: 325, y: 270, w: 150, h: 50 }, verb, null),
            new Slot({ x: 505, y: 270, w: 150, h: 50 }, noun, null)
        ];
        this.typeWriter = new TypeWriter({ x: 100, y: 70, w: 600, h: 190 });

        let cardTableRaw: CardDef[] = cardTableJson as CardDef[];

        cardTableRaw.forEach(card => {
            this.cardTable.set(card.ID, card);
        });

        this.sentenceTable = sentenceTableJson as SentenceDef[];

        let dialogueTableRaw: DialogueDef[] = dialogueTableJson as DialogueDef[];
        dialogueTableRaw.forEach(dialogue => {
            this.dialogueTable.set(dialogue.ID, dialogue.Dialogue);
        });

        this.levelState = {
            alreadyInspectRoom: false,
            alreadyInspectDoor: false,
            alreadyInspectTable: false,
            alreadyGotOpen: false,
            alreadyOpenDoor: false,
            alreadyOpenTable: false,
            alreadyOpenCornerCeiling: false,
            alreadyOpenDoorCeiling: false,
            alreadyEnterCeiling: false,
            tablePosition: TablePosition.Room,
            mePosition: MePosition.Room
        };
    }

    public begin(): void {
        this.entrySequence();
    }

    private async entrySequence(): Promise<void> {
        for (let i = 0; i < this.slotArray.length; i++) {
            this.slotArray[i].drawSlot();
        }
        this.inventory.drawInventory();
        await this.typeWriter.say(this.dialogueTable.get(0));
        this.inventory.addCard(this.cardTable.get(2));
        this.inventory.addCard(this.cardTable.get(0));
        this.inventory.addCard(this.cardTable.get(1));
        this.inventory.drawInventory();
    }

    public onCanvasClick(mousePos: Position): void {
        this.inventory.cardArray.forEach(card => {
            if (!isInside(mousePos, card.rect)) return;
            if (card.isSelected) {
                card.rect.x = card.inventoryX;
                card.rect.y = card.inventoryY;
                card.isSelected = false;
                for (let i = 0; i < this.slotArray.length; i++) {
                    if (this.slotArray[i].IsCardEqual(card)) {
                        this.slotArray[i].RemoveCard();
                        this.slotArray[i].drawSlot();
                        this.inventory.drawInventory();
                        break;
                    }
                }
            } else {
                for (let i = 0; i < this.slotArray.length; i++) {
                    let slot = this.slotArray[i];
                    if (slot.partOfSpeech == card.cardInfo.PartOfSpeech) {
                        if (slot.IsCardEqual(null)) {
                            slot.InsertCard(card);
                            slot.drawSlot();
                            this.inventory.drawInventory();
                            break;
                        }
                    }
                }
            }

            for (let i = 0; i < this.sentenceTable.length; i++) {
                let sentence: SentenceDef = this.sentenceTable[i];
                // 我檢視密室
                if (sentence.CardID1 == this.slotArray[0].GetCardID() &&
                    sentence.CardID2 == this.slotArray[1].GetCardID() &&
                    sentence.CardID3 == this.slotArray[2].GetCardID()) {
                    // 在boolean前面加一個「+」可以將boolean轉成number
                    if (sentence.StatusID == +this.levelState.alreadyInspectRoom) {
                        this.SayDialogue(sentence);
                        this.levelState.alreadyInspectRoom = true;
                        break;
                    }
                }
            }
        });
    }

    private async SayDialogue(sentenceInfo: SentenceDef): Promise<void> {
        await this.typeWriter.say(this.dialogueTable.get(sentenceInfo.DialogueID));
        if (sentenceInfo.NewCardID) {
            for (let i = 0; i < sentenceInfo.NewCardID.length; i++) {
                this.inventory.addCard(this.cardTable.get(sentenceInfo.NewCardID[i]));
            }
            this.inventory.drawInventory();
        }
    }
}

type Level1State = {
    alreadyInspectRoom: boolean;
    alreadyInspectDoor: boolean;
    alreadyInspectTable: boolean;
    alreadyGotOpen: boolean;
    alreadyOpenDoor: boolean;
    alreadyOpenTable: boolean;
    alreadyOpenCornerCeiling: boolean;
    alreadyOpenDoorCeiling: boolean;
    alreadyEnterCeiling: boolean;
    tablePosition: TablePosition;
    mePosition: MePosition;
}

enum TablePosition {
    Room,
    Door,
    Corner,
}

enum MePosition {
    Room,
    OnTable
}
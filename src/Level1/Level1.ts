import { Inventory } from "../Inventory";
import { TypeWriter } from "../TypeWriter";
import { CardDef, DialogueDef, ILevel, Position, SentenceDef, noun, verb } from "../TypeDefinition";
import { isInside } from "../Utility";
import { Slot } from "../Slot";
import cardTableJson from './CardTable.json';
import dialogueTableJson from './DialogueTable.json';
import sentenceTableJson from './SentenceTable.json';
import stateInitTableJson from './StateInitTable.json';

export class Level1 implements ILevel {
    private readonly inventory: Inventory;
    private readonly slotArray: Slot[];
    private readonly typeWriter: TypeWriter;
    private readonly cardTable = new Map<number, CardDef>();
    private readonly sentenceTable: SentenceDef[];
    private readonly dialogueTable = new Map<number, string>();
    private readonly stateInitTable: { [k: string]: any }[];

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

        this.stateInitTable = stateInitTableJson as { [k: string]: any }[];

        for (let i = 0; i < this.stateInitTable.length; i++) {
            new Function(this.stateInitTable[i]["StateName"] + "=" +
                this.stateInitTable[i]["StateInit"])();
        }
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
            // 如果點選到的詞卡已經輸入，則把詞卡放回inventory。
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
                return;
            }

            // 如果點選到的詞卡還沒有輸入，尋找一個空的slot輸入。
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

            if (!this.isSlotFull()) return;

            // 如果三個輸入框都滿了。檢查造句。
            for (let i = 0; i < this.sentenceTable.length; i++) {
                let sentence: SentenceDef = this.sentenceTable[i];
                if (!this.isSentenceMatch(sentence)) continue;
                if (!this.runLogicalExpression(sentence.Condition)) continue;

                this.SayDialogue(sentence);
                if (sentence.Consequence) {
                    Function(`"use strict";${sentence.Consequence}`)();
                }
                break;
            }
        });
    }

    private isSlotFull(): boolean {
        return this.slotArray[0].HasCard() &&
            this.slotArray[1].HasCard() &&
            this.slotArray[2].HasCard();
    }

    private isSentenceMatch(sentence: SentenceDef): boolean {
        return sentence.CardID1 == this.slotArray[0].GetCardID() &&
            sentence.CardID2 == this.slotArray[1].GetCardID() &&
            sentence.CardID3 == this.slotArray[2].GetCardID()
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

    private runLogicalExpression(str: string): boolean {
        return new Function("return " + str)();
    }
}
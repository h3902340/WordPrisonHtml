import { Inventory } from "../Inventory";
import { TypeWriter } from "../TypeWriter";
import { CardDef, DialogueDef, FallbackDef, ILevel, Position, SentenceDef, noun, verb } from "../TypeDefinition";
import { isInside } from "../Utility";
import { Slot } from "../Slot";
import cardTableJson from './CardTable.json';
import dialogueTableJson from './DialogueTable.json';
import sentenceTableJson from './SentenceTable.json';
import fallbackTableJson from './FallbackTable.json';
import stateInitTableJson from './StateInitTable.json';

export class Level1 implements ILevel {
    private readonly inventory: Inventory;
    private readonly slotArray: Slot[];
    private readonly typeWriter: TypeWriter;
    private readonly cardTable = new Map<number, CardDef>();
    private readonly sentenceTable: SentenceDef[];
    private readonly fallbackTable: FallbackDef[];
    private readonly dialogueTable = new Map<number, string>();
    private readonly stateInitTable: { [k: string]: any }[];
    private isSaying: boolean = false;
    private isTheEnd: boolean = false;

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
        this.fallbackTable = fallbackTableJson as FallbackDef[];

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
        // 遊戲結束時阻擋點擊。
        if (this.isTheEnd) return;
        // 說話時不接受點擊。
        if (this.isSaying) return;
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

            // 如果輸入框已經滿了。就不再檢查造句。
            if (this.isSlotFull()) return;

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
            // 先檢查是否滿足fallback條件
            for (let i = 0; i < this.fallbackTable.length; i++) {
                let fallback: FallbackDef = this.fallbackTable[i];
                if (!this.isFallbackMatch(fallback)) continue;
                if (!this.runLogicalExpression(fallback.Condition)) continue;

                this.SayDialogue(fallback.FallbackDialogueID);
                return;
            }

            for (let i = 0; i < this.sentenceTable.length; i++) {
                let sentence: SentenceDef = this.sentenceTable[i];
                if (!this.isSentenceMatch(sentence)) continue;
                if (!this.runLogicalExpression(sentence.Condition)) continue;

                this.SayDialogue(sentence.DialogueID).then(() => {
                    this.CheckNewCard(sentence);
                });

                if (sentence.Consequence) {
                    Function(`"use strict";${sentence.Consequence}`)();
                    // 檢查是否已經遊戲結束。
                    if (Function("return TheEnd")()) {
                        this.isTheEnd = true;
                    }
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

    private isSentenceMatch(sentence: { CardID1: number, CardID2: number, CardID3: number }): boolean {
        return sentence.CardID1 == this.slotArray[0].GetCardID() &&
            sentence.CardID2 == this.slotArray[1].GetCardID() &&
            sentence.CardID3 == this.slotArray[2].GetCardID();
    }

    private isFallbackMatch(sentence: { CardID1: number, CardID2: number, CardID3: number }): boolean {
        return (!sentence.CardID1 || sentence.CardID1 == this.slotArray[0].GetCardID()) &&
            (!sentence.CardID2 || sentence.CardID2 == this.slotArray[1].GetCardID()) &&
            (!sentence.CardID3 || sentence.CardID3 == this.slotArray[2].GetCardID());
    }

    private async SayDialogue(dialogueID: number): Promise<void> {
        this.isSaying = true;
        await this.typeWriter.say(this.dialogueTable.get(dialogueID));
        this.isSaying = false;
    }

    private CheckNewCard(sentenceInfo: SentenceDef): void {
        if (sentenceInfo.NewCardID) {
            for (let i = 0; i < sentenceInfo.NewCardID.length; i++) {
                this.inventory.addCard(this.cardTable.get(sentenceInfo.NewCardID[i]));
            }
            this.inventory.drawInventory();
        }
    }

    private runLogicalExpression(str: string): boolean {
        if (!str) return true;
        return new Function("return " + str)();
    }
}
import { Inventory } from "../Inventory";
import { TypeWriter } from "../TypeWriter";
import { CardDef, DialogueDef, FallbackDef, HintDef, HintValue, IClickable, ILevel, Position, SentenceDef, noun, verb } from "../TypeDefinition";
import { Slot } from "../Slot";
import cardTableJson from './CardTable.json';
import dialogueTableJson from './DialogueTable.json';
import sentenceTableJson from './SentenceTable.json';
import fallbackTableJson from './FallbackTable.json';
import stateInitTableJson from './StateInitTable.json';
import hintTableJson from './HintTable.json';
import { applauseSound, createAudio, depthInRuinsMusic, endingBassSound, keyboardSound, pickUpSound, putBackSound } from "../AudioTool";
import { card_height, card_width_unit, referenceScreenHeight, referenceScreenWidth } from "../GlobalSetting";
import { Card } from "../Card";
import { HintButton } from '../HintButton'

export class Level1 implements ILevel {
    private readonly inventory: Inventory;
    private readonly slotArray: Slot[];
    private readonly typeWriter: TypeWriter;
    private readonly cardTable = new Map<number, CardDef>();
    private readonly sentenceTable: SentenceDef[];
    private readonly fallbackTable: FallbackDef[];
    private readonly hintTable: Map<number, HintValue>;
    private readonly dialogueTable = new Map<number, string>();
    private readonly stateInitTable: { [k: string]: any }[];
    private isSaying: boolean = false;
    private isTheEnd: boolean = false;
    private musicAudio: HTMLAudioElement;
    private keybaordAudio: HTMLAudioElement;
    private goodEndingAudio: HTMLAudioElement;
    private badEndingAudio: HTMLAudioElement;
    private pickupAudioArray: HTMLAudioElement[];
    private putbackAudioArray: HTMLAudioElement[];
    private clickableArray: IClickable[] = [];
    private hintButton: HintButton;
    private currentHintArray: HintValue[] = [];
    private currentHintIndex: number = 0;

    constructor() {
        let cardPadding: number = 10;
        let slotPadding: number = 20;
        let slotInventoryPadding: number = 10;
        let typeWriterSlotPadding: number = 10;
        let inventoryHeight: number = card_height * 3 + cardPadding * 4;
        let inventoryBottomPadding: number = 20;
        let slotWidth: number = card_width_unit * 3;
        let slotHeight: number = card_height;
        let slotStartY: number = referenceScreenHeight - inventoryBottomPadding - inventoryHeight - slotInventoryPadding - slotHeight;
        let slotStartX: number = (referenceScreenWidth - slotWidth * 3 - slotPadding * 2) * .5;
        let typeWriterExtend: number = -20;
        let typeWriterTopPadding: number = 50;
        let inventorySidePadding: number = 15;

        this.slotArray = [
            new Slot({ x: slotStartX, y: slotStartY, w: slotWidth, h: slotHeight, }, noun, null),
            new Slot({ x: slotStartX + slotWidth + slotPadding, y: slotStartY, w: slotWidth, h: slotHeight }, verb, null),
            new Slot({ x: slotStartX + slotWidth * 2 + slotPadding * 2, y: slotStartY, w: slotWidth, h: slotHeight }, noun, null)
        ];

        this.inventory = new Inventory({
            x: inventorySidePadding, y: slotStartY + slotHeight + slotInventoryPadding,
            w: referenceScreenWidth - inventorySidePadding * 2, h: referenceScreenHeight - slotStartY - slotHeight - slotInventoryPadding - inventoryBottomPadding
        }, 10);

        this.clickableArray.push(this.inventory, this.slotArray[0], this.slotArray[1], this.slotArray[2]);

        this.typeWriter = new TypeWriter({
            x: slotStartX - typeWriterExtend, y: typeWriterTopPadding,
            w: referenceScreenWidth - slotStartX * 2 + typeWriterExtend * 2, h: slotStartY - typeWriterSlotPadding - typeWriterTopPadding
        }, 5);

        let hintPadding: number = 10;
        let hintWidth: number = 70;
        this.hintButton = new HintButton({
            x: referenceScreenWidth - hintPadding - hintWidth,
            y: hintPadding,
            w: hintWidth,
            h: hintWidth
        });

        this.clickableArray.push(this.hintButton);
        this.hintButton.Draw();

        let cardTableRaw: CardDef[] = cardTableJson as CardDef[];

        cardTableRaw.forEach(card => {
            this.cardTable.set(card.ID, card);
        });

        this.sentenceTable = sentenceTableJson as SentenceDef[];
        this.fallbackTable = fallbackTableJson as FallbackDef[];

        this.hintTable = new Map<number, HintValue>();
        let hintTableRaw: HintDef[] = hintTableJson as HintDef[];
        for (let i = 0; i < hintTableRaw.length; i++) {
            this.hintTable.set(hintTableRaw[i].HintID, {
                Hint: hintTableRaw[i].Hint,
                Condition: hintTableJson[i].Condition,
                NextHintID: hintTableRaw[i].NextHintID
            });
        }
        this.currentHintArray.push(this.hintTable.get(0));

        let dialogueTableRaw: DialogueDef[] = dialogueTableJson as DialogueDef[];
        dialogueTableRaw.forEach(dialogue => {
            this.dialogueTable.set(dialogue.ID, dialogue.Dialogue);
        });

        this.stateInitTable = stateInitTableJson as { [k: string]: any }[];

        for (let i = 0; i < this.stateInitTable.length; i++) {
            new Function(this.stateInitTable[i]["StateName"] + "=" +
                this.stateInitTable[i]["StateInit"])();
        }

        this.musicAudio = createAudio(depthInRuinsMusic);
        this.keybaordAudio = createAudio(keyboardSound);
        this.goodEndingAudio = createAudio(applauseSound);
        this.badEndingAudio = createAudio(endingBassSound);
        this.pickupAudioArray = [
            createAudio(pickUpSound),
            createAudio(pickUpSound),
            createAudio(pickUpSound)
        ];

        this.putbackAudioArray = [
            createAudio(putBackSound),
            createAudio(putBackSound),
            createAudio(putBackSound)
        ];

        this.musicAudio.loop = true;
        this.keybaordAudio.loop = true;
    }

    public begin(): void {
        this.entrySequence();
    }

    private async entrySequence(): Promise<void> {
        for (let i = 0; i < this.slotArray.length; i++) {
            this.slotArray[i].drawSlot();
        }
        this.inventory.drawInventory();
        await this.SayDialogueWithoutSound(this.dialogueTable.get(0));
        this.inventory.AddCard(new Card(this.cardTable.get(2)));
        this.inventory.AddCard(new Card(this.cardTable.get(0)));
        this.inventory.AddCard(new Card(this.cardTable.get(1)));
        this.inventory.drawInventory();
    }

    public onCanvasClick(mousePos: Position): void {
        // 遊戲結束時阻擋點擊。
        if (this.isTheEnd) return;
        // 說話時不接受點擊。
        if (this.isSaying) return;

        // 檢查是否有播放BGM。網頁如果按上一頁，再按下一頁，會導致音樂被暫停，但flag不會重設。所以這裡不能用flag來判斷，要用是否paused判斷。
        if (this.musicAudio.paused) {
            this.musicAudio.play();
        }

        let hitClickable: IClickable = null;
        for (let i = 0; i < this.clickableArray.length; i++) {
            if (!this.clickableArray[i].CheckIfHit(mousePos)) continue;
            hitClickable = this.clickableArray[i];
            break;
        }

        if (!hitClickable) return;

        if (hitClickable instanceof HintButton) {
            this.ShowHint();
            return;
        }

        // 如果點到slot，並且該slot有card，則把card退回至inventory
        if (hitClickable instanceof Slot) {
            if (!hitClickable.HasCard()) return;
            let card: Card = hitClickable.RemoveCard();
            this.inventory.AddCard(card);
            hitClickable.drawSlot();
            this.inventory.drawInventory();
            this.pickupAudioArray[this.slotArray.indexOf(hitClickable)].play();
            return;
        }

        // 如果輸入框已經滿了。就不再檢查造句。
        if (this.isSlotFull()) return;

        //如果有點到inventory，則檢查是否有點到裡面的card
        if (hitClickable == this.inventory) {
            let card: Card = this.inventory.CheckIfHitCard(mousePos);
            // 沒有點到inventory，則return
            if (!card) return;

            // 尋找一個空的slot輸入。
            for (let i = 0; i < this.slotArray.length; i++) {
                let slot = this.slotArray[i];
                if (!slot.IsPartOfSpeechEqual(card.GetPartOfSpeech())) continue;
                if (!slot.IsCardEqual(null)) continue;
                this.inventory.RemoveCard(card);
                slot.AddCard(card);
                slot.drawSlot();
                this.inventory.drawInventory();
                this.putbackAudioArray[i].play();
                break;
            }
        }

        // 輸入完後檢查造句。如果三個輸入框還沒滿，則return
        if (!this.isSlotFull()) return;
        // 先檢查是否滿足fallback條件
        for (let i = 0; i < this.fallbackTable.length; i++) {
            let fallback: FallbackDef = this.fallbackTable[i];
            if (!this.isFallbackMatch(fallback)) continue;
            if (!this.runLogicalExpression(fallback.Condition)) continue;

            this.SayDialogue(this.dialogueTable.get(fallback.FallbackDialogueID));
            return;
        }

        for (let i = 0; i < this.sentenceTable.length; i++) {
            let sentence: SentenceDef = this.sentenceTable[i];
            if (!this.isSentenceMatch(sentence)) continue;
            if (!this.runLogicalExpression(sentence.Condition)) continue;

            this.SayDialogue(this.dialogueTable.get(sentence.DialogueID)).then(() => {
                this.CheckNewCard(sentence);
                if (!sentence.Consequence) return;

                Function(`"use strict";${sentence.Consequence}`)();
                // 檢查是否已經遊戲結束。
                if (Function("return EndState != null")()) {
                    this.isTheEnd = true;
                    if (Function("return EndState == 'Good'")()) {
                        this.goodEndingAudio.play();
                    } else if (Function("return EndState == 'Bad'")()) {
                        this.badEndingAudio.play();
                    }
                }

                // 更新提示
                let removedHintArray: HintValue[];
                do{
                    removedHintArray = [];
                    for (let i = this.currentHintArray.length - 1; i >= 0; i--) {
                        if (this.runLogicalExpression(this.currentHintArray[i].Condition)) continue;
                        removedHintArray = removedHintArray.concat(this.currentHintArray.splice(i, 1));
                    }
    
                    for (let i = 0; i < removedHintArray.length; i++) {
                        if (!removedHintArray[i].NextHintID) continue;
                        for (let j = 0; j < removedHintArray[i].NextHintID.length; j++) {
                            let hint: HintValue = this.hintTable.get(removedHintArray[i].NextHintID[j]);
                            if (this.currentHintArray.indexOf(hint) != -1) continue;
                            this.currentHintArray.push(hint);
                        }
                    }
                }
                while(removedHintArray.length != 0)
                this.currentHintIndex = 0;
            });
            break;
        }
    }

    private ShowHint(): void {
        if (this.currentHintArray.length == 0) return;
        this.SayDialogue(`提示：${this.currentHintArray[this.currentHintIndex].Hint}`);
        if (this.currentHintIndex >= this.currentHintArray.length - 1) {
            this.currentHintIndex = 0;
        } else {
            this.currentHintIndex++;
        }
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

    private async SayDialogue(dialogue: string): Promise<void> {
        this.isSaying = true;
        this.keybaordAudio.play();
        await this.typeWriter.say(dialogue);
        this.keybaordAudio.pause();
        this.isSaying = false;
    }

    private async SayDialogueWithoutSound(dialogue: string): Promise<void> {
        this.isSaying = true;
        await this.typeWriter.say(dialogue);
        this.isSaying = false;
    }

    private CheckNewCard(sentenceInfo: SentenceDef): void {
        if (sentenceInfo.NewCardID) {
            for (let i = 0; i < sentenceInfo.NewCardID.length; i++) {
                let cardInfo: CardDef = this.cardTable.get(sentenceInfo.NewCardID[i]);
                this.inventory.AddCard(new Card(cardInfo));
            }
            this.inventory.drawInventory();
        }
    }

    private runLogicalExpression(str: string): boolean {
        if (!str) return true;
        return new Function("return " + str)();
    }
}
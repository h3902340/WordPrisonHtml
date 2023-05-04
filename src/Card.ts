import { verb_color, noun_color, card_font_size, card_word_color, card_font, card_width_unit, card_height } from "./GlobalSetting";
import { CardDef, Position, Rect, verb } from "./TypeDefinition";
import { drawFilledRect, drawText } from "./Utility";

export class Card {
    private readonly rect: Rect;
    private readonly cardInfo: CardDef;

    constructor(cardInfo: CardDef) {
        // 卡片位置預設為(0,0)
        this.rect = {
            x: 0, y: 0,
            w: card_width_unit * cardInfo.Word.length,
            h: card_height
        };
        this.cardInfo = cardInfo;
    }

    public PlaceAt(position: Position): void {
        this.rect.x = position.x;
        this.rect.y = position.y;
    }

    public IsClickable(): boolean {
        return true;
    }

    public GetRect(): Rect {
        return this.rect;
    }

    public GetCardID(): number {
        return this.cardInfo.ID;
    }

    public GetPartOfSpeech(): string {
        return this.cardInfo.PartOfSpeech;
    }

    public drawCard(): void {
        if (this.cardInfo.PartOfSpeech == verb) {
            drawFilledRect(this.rect, verb_color);
        } else {
            drawFilledRect(this.rect, noun_color);
        }

        drawText(this.cardInfo.Word, {
            x: this.rect.x + (this.rect.w - card_font_size * this.cardInfo.Word.length) * .5,
            // 根據這個公式，詞卡文字沒有剛好置中，需要微調
            y: this.rect.y + (this.rect.h + card_font_size) * .5 - 5
        }, card_word_color, card_font, card_font_size);
    }
}
import { dialogue_font, dialogue_width, dialogue_color, type_interval, dialogue_font_size } from "./GlobalSetting";
import { Rect } from "./TypeDefinition";
import { clearRect, splitString, sleep } from "./Utility";
import { ctx } from "./index";

export class TypeWriter {
    private rect: Rect;
    private readonly verticalInterval: number = 5;

    constructor(rect: Rect) {
        this.rect = rect;
    }

    public async say(text: string): Promise<void> {
        clearRect(this.rect);
        ctx.font = dialogue_font;
        let textSplit = splitString(text, dialogue_width);
        for (let i = 0; i < textSplit.length; i++) {
            let currentText = textSplit[i];
            for (let j = 1; j <= currentText.length; j++) {
                ctx.fillStyle = dialogue_color;
                ctx.fillText(currentText.substring(0, j), this.rect.x,
                    // fillText是以y的上界為底線畫文字。所以畫文字時，y要加一個dialogue_font_size
                    this.rect.y + dialogue_font_size + (dialogue_font_size + this.verticalInterval) * i);
                await sleep(type_interval);
            }
        }
    }
}
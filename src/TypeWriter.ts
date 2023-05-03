import { dialogue_font, dialogue_color, type_interval, dialogue_font_size } from "./GlobalSetting";
import { Position, Rect } from "./TypeDefinition";
import { clearRect, splitString, sleep, drawText } from "./Utility";
import { ctx } from "./index";

export class TypeWriter {
    private readonly rect: Rect;
    private readonly lineInterval: number;
    // 一行的字數。根據給定的rect寬度計算
    private readonly lineWordCount: number;
    // 打字機的文字要置中，所以文字的起始x值要額外計算
    private readonly startPosition: Position;

    constructor(rect: Rect, lineInterval: number) {
        this.rect = rect;
        this.lineInterval = lineInterval;
        this.lineWordCount = Math.floor(rect.w / dialogue_font_size);
        this.startPosition = {
            x: rect.x + (rect.w - this.lineWordCount * dialogue_font_size) * .5,
            // fillText是以y的上界為底線畫文字。所以畫文字時，y要加一個dialogue_font_size
            y: rect.y + dialogue_font_size
        };
    }

    public async say(text: string): Promise<void> {
        clearRect(this.rect);
        let textSplit = splitString(text, this.lineWordCount);
        for (let i = 0; i < textSplit.length; i++) {
            let currentText = textSplit[i];
            for (let j = 1; j <= currentText.length; j++) {
                ctx.fillStyle = dialogue_color;
                drawText(currentText.substring(0, j), {
                    x: this.startPosition.x,
                    y: this.startPosition.y + (dialogue_font_size + this.lineInterval) * i
                }, dialogue_color, dialogue_font, dialogue_font_size);
                await sleep(type_interval);
            }
        }
    }
}
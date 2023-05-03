import { card_font, card_font_size, card_word_color, noun_color, verb_color } from "./GlobalSetting";
import { Card, Position, Rect, verb } from "./TypeDefinition";
import { ctx } from "./index";

export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function clearRect(rect: Rect): void {
    ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
}

export function drawCard(card: Card): void {
    if (card.cardInfo.PartOfSpeech == verb) {
        drawFilledRect(card.rect, verb_color);
    } else {
        drawFilledRect(card.rect, noun_color);
    }

    drawText(card.cardInfo.Word, {
        x: card.rect.x + (card.rect.w - card_font_size * card.cardInfo.Word.length) * .5,
        // 根據這個公式，詞卡文字沒有剛好置中，需要微調
        y: card.rect.y + (card.rect.h + card_font_size) * .5 - 5
    }, card_word_color, card_font, card_font_size);
}

export function drawFilledRect(rect: Rect, color: string): void {
    ctx.fillStyle = color;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}

export function drawHollowRect(rect: Rect, color: string, lineWidth: number): void {
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
}

export function drawText(text: string, startPosition: Position, color: string, font: string, size: number): void {
    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.fillText(text, startPosition.x, startPosition.y);
}

export function splitString(str: string, N: number): string[] {
    const arr = [];

    for (let i = 0; i < str.length; i += N) {
        arr.push(str.substring(i, i + N));
    }

    return arr;
}

export function getMousePos(canvas: HTMLCanvasElement, event: MouseEvent): Position {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
}

export function isInside(pos: Position, rect: Rect): boolean {
    return pos.x > rect.x && pos.x < rect.x + rect.w &&
        pos.y < rect.y + rect.h && pos.y > rect.y;
}

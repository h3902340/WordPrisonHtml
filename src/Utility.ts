import { card_height, card_width_unit, dialogue_color, dialogue_font_size, noun_color, verb_color } from "./GlobalSetting";
import { Card, Position, Rect, verb } from "./TypeDefinition";
import { ctx } from "./index";

export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function clearRect(rect: Rect): void {
    ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
}

export function drawCardFromTopLeft(card: Card): void {
    if (card.cardInfo.PartOfSpeech == verb) {
        ctx.fillStyle = verb_color;
    } else {
        ctx.fillStyle = noun_color;
    }
    let cardWidth = card_width_unit * card.cardInfo.Word.length;
    ctx.fillRect(card.rect.x, card.rect.y, cardWidth, card_height);
    ctx.fillStyle = dialogue_color;
    ctx.fillText(card.cardInfo.Word, card.rect.x + (cardWidth - dialogue_font_size * card.cardInfo.Word.length) * .5, card.rect.y + 35);
}

export function drawCardFromCenter(card: Card, centerX: number, centerY: number): void {
    if (card.cardInfo.PartOfSpeech == verb) {
        ctx.fillStyle = verb_color;
    } else {
        ctx.fillStyle = noun_color;
    }
    let cardWidth = 50 * card.cardInfo.Word.length;
    let x = centerX - cardWidth * .5;
    let y = centerY - card_height * .5;
    ctx.fillRect(x, y, cardWidth, card_height);
    ctx.fillStyle = dialogue_color;
    ctx.fillText(card.cardInfo.Word, x + (cardWidth - dialogue_font_size * card.cardInfo.Word.length) * .5, y + 35);
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

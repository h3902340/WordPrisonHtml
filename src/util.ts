import { card_height, card_width_unit, dialogue_color, dialogue_font_size, dialogue_width, noun_color, type_interval, verb_color } from "./globalSetting";
import { Card, Position, Rect, Slot } from "./typeDefinition";

export let canvas: HTMLCanvasElement = document.getElementById("mainCanvas") as HTMLCanvasElement;
let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
ctx.font = `${dialogue_font_size}px Arial`;

export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function clearCanvas(clearArea: { startPos: Position, endPos: Position }): void {
    ctx.clearRect(clearArea.startPos.x, clearArea.startPos.y, clearArea.endPos.x, clearArea.endPos.y);
}

export function drawCardFromTopLeft(card: Card): void {
    if (card.isVerb) {
        ctx.fillStyle = verb_color;
    } else {
        ctx.fillStyle = noun_color;
    }
    let cardWidth = card_width_unit * card.word.length;
    ctx.fillRect(card.rect.x, card.rect.y, cardWidth, card_height);
    ctx.fillStyle = dialogue_color;
    ctx.fillText(card.word, card.rect.x + (cardWidth - dialogue_font_size * card.word.length) * .5, card.rect.y + 35);
}

export function drawCardFromCenter(card: Card, centerX: number, centerY: number): void {
    if (card.isVerb) {
        ctx.fillStyle = verb_color;
    } else {
        ctx.fillStyle = noun_color;
    }
    let cardWidth = 50 * card.word.length;
    let x = centerX - cardWidth * .5;
    let y = centerY - card_height * .5;
    ctx.fillRect(x, y, cardWidth, card_height);
    ctx.fillStyle = dialogue_color;
    ctx.fillText(card.word, x + (cardWidth - dialogue_font_size * card.word.length) * .5, y + 35);
}

export function drawSlot(slot: Slot): void {
    ctx.beginPath();
    ctx.rect(slot.rect.x, slot.rect.y, slot.rect.w, slot.rect.h);
    ctx.lineWidth = 6;
    if (slot.isVerb) {
        ctx.strokeStyle = verb_color;
    } else {
        ctx.strokeStyle = noun_color;
    }
    ctx.stroke();
    if (slot.card) {
        drawCardFromCenter(slot.card, slot.rect.x + slot.rect.w * .5, slot.rect.y + slot.rect.h * .5);
    }
}

export function drawRect(rect: Rect, color: string): void {
    ctx.fillStyle = color;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}

export function splitString(str: string, N: number): string[] {
    const arr = [];

    for (let i = 0; i < str.length; i += N) {
        arr.push(str.substring(i, i + N));
    }

    return arr;
}

export async function say(text: string): Promise<void> {
    let textSplit = splitString(text, dialogue_width);
    for (let i = 0; i < textSplit.length; i++) {
        let currentText = textSplit[i];
        for (let j = 1; j <= currentText.length; j++) {
            ctx.fillStyle = dialogue_color;
            ctx.fillText(currentText.substring(0, j), 100, 100 + 35 * i);
            await sleep(type_interval);
        }
    }
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

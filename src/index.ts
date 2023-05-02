import { referenceScreenHeight, referenceScreenWidth } from "./GlobalSetting";
import { Level1 } from "./Level1/Level1";
import { ILevel, Position } from "./TypeDefinition";
import { getMousePos } from "./Utility";

let canvas: HTMLCanvasElement = document.getElementById("mainCanvas") as HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D = canvas.getContext("2d");

canvas.width = referenceScreenWidth;
canvas.height = referenceScreenHeight;
ctx.strokeStyle = 'white';
ctx.lineWidth = 1;
ctx.strokeRect(0, 0, referenceScreenWidth, referenceScreenHeight);

let level: ILevel = new Level1();

canvas.addEventListener('click', (evt: MouseEvent) => {
  let mousePos: Position = getMousePos(canvas, evt);
  level.onCanvasClick(mousePos);
});

level.begin();
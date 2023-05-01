import { Level1 } from "./Level1/Level1";
import { ILevel, Position } from "./TypeDefinition";
import { getMousePos } from "./Utility";

let canvas: HTMLCanvasElement = document.getElementById("mainCanvas") as HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D = canvas.getContext("2d");

let level: ILevel = new Level1();

canvas.addEventListener('click', (evt: MouseEvent) => {
  let mousePos: Position = getMousePos(canvas, evt);
  level.onCanvasClick(mousePos);
});

level.begin();
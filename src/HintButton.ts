import { ctx } from '.';
import { IClickable, Position, Rect } from './TypeDefinition';
import { isInside } from './Utility';

export class HintButton implements IClickable {
    private readonly rect: Rect;
    private readonly hintImageName: string = "image/hint_icon.png";

    constructor(rect: Rect) {
        this.rect = rect;
    }

    public CheckIfHit(mousePos: Position): boolean {
        return isInside(mousePos, this.rect);
    }

    public Draw(): void {
        let hintImage: CanvasImageSource = new Image();
        hintImage.src = this.hintImageName;
        hintImage.addEventListener(
            "load",
            () => {
                ctx.drawImage(hintImage, this.rect.x, this.rect.y, this.rect.w, this.rect.h);
            },
            false
        );
    }
}
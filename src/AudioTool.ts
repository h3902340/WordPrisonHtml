export const applauseSound: string = "applause";
export const depthInRuinsMusic: string = "Depth in Ruins";
export const endingBassSound: string = "ending_bass";
export const keyboardSound: string = "keyboard3";
export const pickUpSound: string = "pick up";
export const putBackSound: string = "put back";

export function createAudio(audioName: string): HTMLAudioElement{
    return new Audio(`audio/${audioName}.wav`);
}
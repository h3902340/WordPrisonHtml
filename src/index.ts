console.log("Hello World!");
import {Level1} from "./level1";
import { ILevel } from "./typeDefinition";
let level: ILevel = new Level1();
level.drawLevel();
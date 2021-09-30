import * as THREE from "three";
import osuMapUrl from "../map1.osu?raw";
import { Howl } from "howler";
import Playfield from "./playfield";
import Skin from "./skin";
import KeyboardInput from "../input/keyboard";
import Scoreboard from "./ui/scoreboard";
import EtternaJudgement from "./judge/etterna";
import GameEngine from "./engine";
import OsuMap from "../parser/osu";

const baseSpeed = .0035;

export default (canvas: HTMLCanvasElement, setUiState: (a: any) => any) => {
    const canvasSize = canvas.getBoundingClientRect();
    console.log(canvasSize);

    const audio = new Howl({
        src: ["song1.mp3"],
        volume: 0.1
    });

    const gameEngine = new GameEngine(canvas, audio, render);

    const keyboard = new KeyboardInput();
    keyboard.setup();

    const osuMap = new OsuMap();
    osuMap.fromString(osuMapUrl);

    const field = new Playfield(baseSpeed, new Skin(gameEngine.renderer), new EtternaJudgement(4), new Scoreboard(setUiState));
    field.loadChart(osuMap.toChart());
    field.initScene(gameEngine.scene);
    console.log(field);

    field.lanes.forEach((l, i) => {
        l.laneGroup.position.x = i / field.lanes.length;
    });

    function render(delta: number)
    {
        // console.log(field.lanes[0].notes[0].state);
        field.update(delta, [keyboard.isPressed("z"), keyboard.isPressed("x"), keyboard.isPressed(","), keyboard.isPressed(".")]);
    }

    gameEngine.start();

};
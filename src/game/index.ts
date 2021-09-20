import * as THREE from "three";
import osuMapUrl from "../map1.osu?raw";
import { Howl } from "howler";
import Playfield from "./playfield";
import Skin from "./skin";
import KeyboardInput from "../input/keyboard";
import Scoreboard from "./ui/scoreboard";
import EtternaJudgement from "./judge/etterna";
import GameEngine from "./engine";

export default (canvas: HTMLCanvasElement, setUiState: (a: any) => any) => {
    const canvasSize = canvas.getBoundingClientRect();
    console.log(canvasSize);

    const renderer = new THREE.WebGLRenderer({
        canvas
    });
    const scene = new THREE.Scene();

    // const aspectRatio = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    console.log(camera);

    function handleResize(renderer: THREE.WebGLRenderer, camera: THREE.OrthographicCamera)
    {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (canvas.width !== width || canvas.height !== height)
        {
            renderer.setSize(width, height, false);
            const aspect = width / height;
            camera.left = -aspect;
            camera.right = aspect;
            camera.updateProjectionMatrix();
        }
    }

    let speed = .0035;

    const keyboard = new KeyboardInput();
    keyboard.setup();

    const field = new Playfield(speed, new Skin(renderer), new EtternaJudgement(4), new Scoreboard(setUiState));
    field.loadOsuMap(osuMapUrl);
    field.initScene(scene);
    console.log(field);

    field.lanes.forEach((l, i) => {
        l.laneGroup.position.x = i / field.lanes.length;
    });

    const audio = new Howl({
        src: ["song1.mp3"],
        volume: 0.1
    });

    function render(delta: number)
    {

        handleResize(renderer, camera);

        // console.log(field.lanes[0].notes[0].state);

        field.update(delta, [keyboard.isPressed("z"), keyboard.isPressed("x"), keyboard.isPressed(","), keyboard.isPressed(".")]);

        renderer.renderLists.dispose();
        renderer.render(scene, camera);
    }

    const gameEngine = new GameEngine(audio, render);
    gameEngine.start();

};
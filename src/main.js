import "./style.css";
import * as THREE from "three";
import osuMapUrl from "./map1.osu?raw";
import * as Stats from "stats.js";
import { Howl } from "howler";
import Playfield from "./game/playfield";
import Skin from "./game/skin";
import KeyboardInput from "./input/keyboard";

function main()
{
    const stats = new Stats();
    stats.showPanel(1);
    document.body.appendChild(stats.dom);

    const canvas = document.querySelector('#c');
    const canvasSize = canvas.getBoundingClientRect();
    console.log(canvasSize);

    const renderer = new THREE.WebGLRenderer({
        canvas
    });
    const scene = new THREE.Scene();

    // const aspectRatio = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    console.log(camera);

    function handleResize(renderer, camera)
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
    let updateTime = -1;
    let time = 0;

    const field = new Playfield(speed, new Skin(renderer));
    field.loadOsuMap(osuMapUrl)
    console.log(field);
    // return;

    field.lanes.forEach((l, i) => {
        l.laneGroup.position.x = i / field.lanes.length;
        scene.add(l.laneGroup);
    });

    const audio = new Howl({
        src: ["song1.mp3"],
        volume: 0.1
    });

    function render()
    {
        stats.begin();

        const keyboard = new KeyboardInput();
        keyboard.setup();

        handleResize(renderer, camera);

        const nowTime = new Date().getTime();
        if (updateTime > 0)
            time += nowTime - updateTime;
        updateTime = nowTime;

        const error = time - audio.seek() * 1000;
        if (Math.abs(error) > 10)
        {
            // console.log(`error over threshold: ${error}`);
            time = audio.seek() * 1000;
        }

        // console.log(field.lanes[0].notes[0].state);

        field.handleInput(time, [keyboard.isPressed("z"), keyboard.isPressed("x"), keyboard.isPressed(","), keyboard.isPressed(".")]);

        // TODO: start from last hit object, iterate until off screen then stop
        for (const l of field.lanes)
        {
            for (const n of l.notes)
            {
                n.update(time, speed);
            }
        }

        renderer.renderLists.dispose();
        renderer.render(scene, camera);
        // return;
        stats.end();
        requestAnimationFrame(render);
    }

    audio.on("play", () => requestAnimationFrame(render));
    audio.play();

}

main();

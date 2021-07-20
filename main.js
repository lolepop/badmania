import "./style.css"
import * as THREE from "three";
import osuMapUrl from "./map1.osu?raw"
import * as Stats from "stats.js";
import { Howl } from 'howler';
import Playfield from "./game/playfield";

function main()
{
    const stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    const canvas = document.querySelector('#c');
    const canvasSize = canvas.getBoundingClientRect();
    console.log(canvasSize);

    const renderer = new THREE.WebGLRenderer({
        canvas
    });
    const scene = new THREE.Scene();

    const aspectRatio = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(-aspectRatio, aspectRatio, 1, -1, 0.1, 100);
    console.log(camera);

    // const boxSize = 0.2;
    // const geometry = new THREE.BoxGeometry(boxSize, boxSize * .3, 1);
    // geometry.translate(0, boxSize * .3 / 2, 0);
    
    // const lnGeometry = new THREE.BoxGeometry(boxSize * .75, 1, 1);
    // lnGeometry.translate(0, 1/2, 0);
    
    // const material = new THREE.MeshBasicMaterial({color: 0x44aa88});

    // renderer.render(scene, camera);

    let speed = .0035;
    const keys = 4;
    let updateTime = -1;
    let time = 0;

    const field = new Playfield(speed);
    field.loadOsuMap(osuMapUrl)
    console.log(field);

    field.lanes.forEach((l, i) => {
        l.laneGroup.position.x = i / keys;
        scene.add(l.laneGroup);
    });

    const audio = new Howl({
        src: ["song1.mp3"],
        volume: 0.1
    });

    function render()
    {
        stats.begin();

        const nowTime = new Date().getTime();
        if (updateTime > 0)
            time += nowTime - updateTime;
        updateTime = nowTime;

        const error = time - audio.seek() * 1000;
        if (Math.abs(error) > 4)
        {
            // console.log(`error over threshold: ${error}`);
            time = audio.seek() * 1000;
        }

        for (const l of field.lanes)
        {
            for (const n of l.notes)
            {
                n.update(time, speed);
            }
        }

        renderer.render(scene, camera);

        stats.end();
        requestAnimationFrame(render);
    }

    audio.on("play", () => requestAnimationFrame(render));
    audio.play();

}

main();

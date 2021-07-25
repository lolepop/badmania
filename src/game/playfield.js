import * as THREE from "three";
import OsuMap from "../parser/osu";
import Lane from "./lane";

export default class Playfield
{
    constructor(speed, skin)
    {
        this.baseSpeed = speed;
        this.skin = skin;
        this.lanes = [];
    }

    handleInput(time, laneState)
    {
        const autoPlay = n => {
            const st = n.startTime;
            const et = n.endTime;
        
            const d = 60;
        
            const isInRange = (min, max) => time >= min && time <= max;
        
            return isInRange(st - d, st + d) || // note within judge
                (n.isLn && isInRange(st - d, et + d)); // note and ln end within judge
        };

        // console.log(this.lanes[0].lastNoteHitIndex);
        this.lanes.map((l, i) => {
            // if (l.currentNote)
            //     laneState[i] = autoPlay(l.currentNote);
            // if (laneState[i]) console.log(laneState[i]);
            l.handleInput(time, laneState[i])
        });
    }

    loadOsuMap(obj)
    {
        const map = OsuMap.fromString(obj);
        console.log(map);
        
        const keys = parseInt(map.Difficulty.CircleSize);
        
        this.lanes = map.HitObjects.reduce((acc, o) => {
            const lane = Math.trunc(o.x * keys / 512);
            const currLane = acc.laneObjects[lane];

            // if (lane !== 0) return acc;
            
            if (o.type === "maniaHold")
                currLane.addNote(o.time, o.endTime);
            else
                currLane.addNote(o.time);

            return acc;
        }, {
            laneObjects: [...Array(keys)].map(_ => new Lane(this.skin)),
        }).laneObjects;

    }

}
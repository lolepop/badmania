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

    loadOsuMap(obj)
    {
        const map = OsuMap.fromString(obj);
        console.log(map);
        
        const keys = parseInt(map.Difficulty.CircleSize);
        
        this.lanes = map.HitObjects.reduce((acc, o) => {
            const lane = Math.trunc(o.x * keys / 512);
            const currLane = acc.laneObjects[lane];
            
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
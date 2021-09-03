import * as THREE from "three";
import OsuMap from "../parser/osu";
import { IJudgement } from "./judge/IJudgement";
import Lane from "./lane";
import { Note } from "./note";
import Skin from "./skin";
import Scoreboard from "./ui/scoreboard";

export default class Playfield
{
    scoreboard: Scoreboard;

    baseSpeed: number;
    skin: Skin;
    lanes: Lane[];
    judgement: IJudgement;
    // TODO: create scorekeeper and pass into lane.handleNoteInput. use notehitindex to calculate accuracy

    constructor(speed: number, skin: Skin, judgement: IJudgement, scoreboard: Scoreboard)
    {
        this.baseSpeed = speed;
        this.skin = skin;
        this.lanes = [];
        this.judgement = judgement;
        this.scoreboard = scoreboard;
    }

    update(time: number, setUiState: (a: any) => any, laneState: boolean[])
    {
        const autoPlay = (n: Note): boolean => {
            const st = n.startTime;
            const et = n.endTime;
        
            const d = this.judgement.autoPlayHitTime;
        
            const isInRange = (min: number, max: number) => time >= min && time <= max;
        
            return isInRange(st, st + d) || // note within judge
                (n.isLn && isInRange(st, et!)); // note and ln end within judge
        };

        // console.log(this.lanes[0].lastNoteHitIndex);
        this.lanes.forEach((l, i) => {
            if (l.currentNote)
                laneState[i] = autoPlay(l.currentNote);
            
            // TODO: change basespeed to match sv
            l.update(time, laneState[i], this.baseSpeed, this.judgement, this.scoreboard);
        });

        this.scoreboard.update();
    }

    loadOsuMap(obj: string)
    {
        const map = OsuMap.fromString(obj);
        console.log(map);
        
        const keys = parseInt(map.Difficulty.CircleSize);
        
        this.lanes = map.HitObjects.reduce((acc, o) => {
            const lane = Math.trunc(o.x * keys / 512);
            const currLane = acc.laneObjects[lane];

            // if (lane !== 0) return acc;
            
            if (o.type === "maniaHold")
                currLane.addNote(o.time, (<any>o).endTime);
            else
                currLane.addNote(o.time);

            return acc;
        }, {
            laneObjects: [...Array(keys)].map(_ => new Lane(this.skin)),
        }).laneObjects;

    }

}
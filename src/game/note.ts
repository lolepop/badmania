import * as THREE from "three";
import { IJudgement } from "./judge/IJudgement";
import Skin from "./skin";

export enum NoteState
{
    NOT_HIT,
    HIT, // note is fully hit (i.e. single note hit/ln fully held)
    HELD, // ln currently held
    MISSED
}

// export enum HitJudge
// {
//     NOT_HIT,
//     EXCELLENT,
//     MISSED
// }

export class Note
{
    startTime: number;
    endTime?: number;

    startHitTime?: number;
    endHitTime?: number;

    state: NoteState = NoteState.NOT_HIT;

    skin: Skin;

    mesh: THREE.Mesh; // base note
    lnMesh?: THREE.Mesh // ln body
    lnCap?: THREE.Mesh // end ln (goes after the ln body)

    noteGroup: THREE.Group = new THREE.Group(); // groups note, ln body and ln cap

    constructor(startTime: number, skin: Skin)
    {
        this.skin = skin;
        this.mesh = skin.noteMesh;
        this.startTime = startTime;

        this.noteGroup.add(this.mesh);
        this.noteGroup.position.y = 100; // set outside of screen
    }

    set noteMeshVisible(visible: boolean)
    {
        const update = (m?: THREE.Material) => {
            if (m)
            {
                m.opacity = +visible;
                m.needsUpdate = true;
            }
        };

        update(this.mesh.material as THREE.Material);
        update(this.lnMesh?.material as THREE.Material);
        update(this.lnCap?.material as THREE.Material);
    }

    createLn(endTime: number)
    {
        // set to ln visual origin to middle of the note
        this.lnMesh = this.skin.lnMesh;
        this.lnMesh.position.y = this.skin.noteScale / 2;

        this.lnCap = this.skin.lnCapMesh;

        this.endTime = endTime;

        this.noteGroup.add(this.lnMesh);
        this.noteGroup.add(this.lnCap);
    }

    getYFromTime(targetTime: number, time: number, speed: number)
    {
        return (targetTime - time) * speed + this.yOrigin;
    }

    update(time: number, speed: number)
    {
        const startPos = this.getYFromTime(this.startTime, time, speed);
        this.noteGroup.position.y = startPos;

        if (this.state === NoteState.HIT || (!this.isLn && this.state === NoteState.MISSED))
            this.noteMeshVisible = false;

        if (this.isLn)
        {
            const endPos = this.getYFromTime(this.endTime!, time, speed);
            const origin = this.yOrigin;
            const lastHit = this.endHitTime && this.getYFromTime(this.endHitTime, time, speed);

            let relativeEnd = endPos - startPos;
            if (origin > startPos)
            {
                // FIXME: scale down end cap when reach past the point
                // if (origin >= endPos)
                // {
                //     debugger;
                //     this.lnCap!.scale.y = relativeEnd;
                // }
                if (this.state === NoteState.HELD)
                {
                    relativeEnd = endPos - origin;
                    this.noteGroup.position.y = origin;
                }
                else if (lastHit && lastHit >= startPos)
                {
                    relativeEnd = endPos - lastHit;
                    this.noteGroup.position.y = lastHit;
                }
            }
            
            this.lnMesh!.scale.y = relativeEnd - this.skin.noteScale / 2;
            this.lnCap!.position.y = relativeEnd;

        }
    }

    setState(state: NoteState, time?: number)
    {
        if (state === NoteState.HELD)
            if (!this.isLn)
                throw new Error("Regular notes cannot be set to held state");
        else if (time === null)
            throw new Error("Time required when setting non-held states");

        if (state !== NoteState.HELD)
        {
            if (this.state === NoteState.HELD)
                this.endHitTime = time;
        }
        
        this.startHitTime ??= time;
        this.state = state;
        return state;
    }

    get isLn()
    {
        return !!this.endTime;
    }

    get yOrigin()
    {
        // offset bottom of screen by skin visual offset
        return this.skin.receptorOffset - 1;
    }

    private isLnOnScreen(time: number, speed: number)
    {
        if (!this.isLn)
            return false;
        const y = this.getYFromTime(this.startTime, time, speed);
        const ey = this.getYFromTime(this.endTime!, time, speed);
        return ey >= -2 && y <= 1;
    }

    isNoteOnScreen(time: number, speed: number)
    {
        const y = this.getYFromTime(this.startTime, time, speed);
        return this.isLnOnScreen(time, speed) || ((y >= -2) && y <= 1);
    }

    isAboveScreen(time: number, speed: number)
    {
        return this.getYFromTime(this.startTime, time, speed) > 1;
    }

}
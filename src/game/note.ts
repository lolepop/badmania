import * as THREE from "three";
import { IJudgement } from "./judge/judgement";
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

class MeshQueue
{
    queue: THREE.Mesh[] = [];
    newMesh: () => THREE.Mesh;

    constructor(newMesh: () => THREE.Mesh)
    {
        this.newMesh = newMesh;
    }

    popOrNew(): THREE.Mesh
    {
        if (this.queue.length > 0)
            return this.queue.pop()!;
        return this.newMesh();
    }

    push(mesh?: THREE.Mesh)
    {
        if (mesh)
            this.queue.push(mesh);
    }
}

export class FastNoteQueue
{
    noteMeshQueue: MeshQueue;
    lnMeshQueue: MeshQueue;
    lnCapQueue: MeshQueue;

    skin: Skin;

    constructor(skin: Skin)
    {
        this.skin = skin;

        this.noteMeshQueue = new MeshQueue(() => skin.noteMesh);
        this.lnMeshQueue = new MeshQueue(() => skin.lnMesh);
        this.lnCapQueue = new MeshQueue(() => skin.lnCapMesh);
    }

    getNote(isLn: boolean = false)
    {
        const noteMesh = this.noteMeshQueue.popOrNew();
        if (!isLn)
            return noteMesh;

        const lnMesh = this.lnMeshQueue.popOrNew();
        const lnCap = this.lnCapQueue.popOrNew();
        return [noteMesh, lnMesh, lnCap];
    }

    releaseNote(noteMesh?: THREE.Mesh, lnMesh?: THREE.Mesh, lnCap?: THREE.Mesh)
    {
        this.noteMeshQueue.push(noteMesh);
        this.lnMeshQueue.push(lnMesh);
        this.lnCapQueue.push(lnCap);
    }

}

export class Note
{
    startTime: number;
    endTime?: number;

    startHitTime?: number;
    endHitTime?: number;

    state: NoteState = NoteState.NOT_HIT;

    skin: Skin;
    noteQueue: FastNoteQueue;

    mesh?: THREE.Mesh; // base note
    lnMesh?: THREE.Mesh // ln body
    lnCap?: THREE.Mesh // end ln (goes after the ln body)

    noteGroup: THREE.Group = new THREE.Group(); // groups note, ln body and ln cap

    constructor(startTime: number, skin: Skin, noteQueue: FastNoteQueue)
    {
        this.skin = skin;
        // this.mesh = skin.noteMesh;
        this.startTime = startTime;

        // this.noteGroup.add(this.mesh);
        this.noteGroup.position.y = 100; // set outside of screen
        this.noteQueue = noteQueue;
    }

    set noteVisibility(visible: boolean)
    {
        this.noteGroup.visible = false;
    }

    createLn(endTime: number)
    {
        // set to ln visual origin to middle of the note
        this.endTime = endTime;
    }

    getYFromTime(targetTime: number, time: number, speed: number)
    {
        return (targetTime - time) * speed + this.yOrigin;
    }

    private getMeshes()
    {
        const r = this.noteQueue.getNote(this.isLn);
        if (!Array.isArray(r))
        {
            this.mesh = r;
        }
        else
        {
            [this.mesh, this.lnMesh, this.lnCap] = r;
            this.lnMesh.position.y = this.skin.noteScale / 2;

            this.noteGroup.add(this.lnMesh);
            this.noteGroup.add(this.lnCap);
        }

        this.noteGroup.add(this.mesh);
    }

    releaseMeshes()
    {
        this.noteQueue.releaseNote(this.mesh, this.lnMesh, this.lnCap);
    }

    update(time: number, speed: number)
    {
        if (!this.mesh)
            this.getMeshes();

        const startPos = this.getYFromTime(this.startTime, time, speed);
        this.noteGroup.position.y = startPos;

        if (this.state === NoteState.HIT || (!this.isLn && this.state === NoteState.MISSED))
            this.noteVisibility = false;

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
import * as THREE from "three";
import { HitJudge, IJudgement } from "./judge/judgement";
import { FastNoteQueue, Note, NoteState } from "./note";
import Skin from "./skin";
import Scoreboard from "./ui/scoreboard";

export default class Lane
{
    notes: Note[] = [];
    lastActiveState: boolean = false; // is lane pressed by player
    lastNoteHitIndex = -1;
    lastVisualNote = 0; // optimisation for rendering
    
    skin: Skin;
    noteQueue: FastNoteQueue;

    noteReceptor: THREE.Mesh;
    laneGroup: THREE.Group = new THREE.Group();

    constructor(skin: Skin, noteQueue: FastNoteQueue)
    {
        this.skin = skin;
        
        this.noteReceptor = skin.noteReceptorMesh;
        this.noteReceptor.position.y = skin.receptorOffset - 1;
        this.laneGroup.add(this.noteReceptor);
        this.noteQueue = noteQueue;
    }

    initScene(scene: THREE.Scene)
    {
        scene.add(this.laneGroup);
    }

    // visually change note receptor when player presses input key
    set noteReceptorActive(isActive: boolean)
    {
        this.noteReceptor.material = isActive ? this.skin.noteReceptorActiveMaterial : this.skin.noteReceptorMaterial;
        this.noteReceptor.material.needsUpdate = true;
    }
    
    get currentNote(): Note | undefined
    {
        return this.notes[this.lastNoteHitIndex + 1];
    }

    // default stepmania judge system for now. can implement release judge
    handleLnJudge(n: Note, time: number, isLaneActive: boolean, judgement: IJudgement): [NoteState, number] | null
    {
        const judge = judgement.getJudge(time, n.startTime);

        // ln is being held past starting timing
        if (isLaneActive && n.state === NoteState.HELD && time >= n.endTime!)
        {
            // auto count hit once past end point 
            console.log("holding ln");
            return [n.setState(NoteState.HIT, time), n.startHitTime! - n.startTime];
        }

        const laneStateHasChanged = this.lastActiveState !== isLaneActive;
        if (laneStateHasChanged)
        {
            // ln press
            if (isLaneActive)
            {
                console.log("ln hit");
                return [n.setState(judge === HitJudge.MISS ? NoteState.MISSED : NoteState.HELD, time), time - n.startTime];
            }
            else
            {
                // ln release
                // const endJudge = n.checkHit(time, true);
                
                console.log("ln release")
                // release while ln was held and get release judgement
                if (n.state === NoteState.HELD)
                {
                    // n.state = endJudge === HitJudge.MISSED ? NoteState.MISSED : NoteState.HIT;
                    if (n.endTime! - time <= 200)
                        return [n.setState(NoteState.HIT, time), n.startHitTime! - n.startTime];
                    else
                        return [n.setState(NoteState.MISSED, time), judgement.missTiming];
                    // return n.setState(n.endTime! - time <= 200 ? NoteState.HIT : NoteState.MISSED, time);
                }
            }
        }

        return null;

    }

    handleNoteJudge(n: Note, time: number, isLaneActive: boolean, judgement: IJudgement): [NoteState, number] | null
    {
        const judge = judgement.getJudge(time, n.startTime);

        const laneStateHasChanged = this.lastActiveState !== isLaneActive;
        if (laneStateHasChanged && judge !== HitJudge.NOT_HIT && isLaneActive)
        {
            console.log("normal note hit");
            // player pressed key and triggers miss judgement
            return [n.setState(judge === HitJudge.MISS ? NoteState.MISSED : NoteState.HIT, time), time - n.startTime];
        }

        return null;

    }

    handleNoteInput(n: Note, time: number, isActive: boolean, judgement: IJudgement): [NoteState, number] | null
    {
        const judge = judgement.getJudge(time, n.startTime);

        // note passed without player hitting it
        if (n.state !== NoteState.HELD && judge === HitJudge.MISS && time > n.startTime)
        {
            console.log("note expired");
            return [n.setState(NoteState.MISSED, time), judgement.missTiming];
        }

        if (n.isLn)
            return this.handleLnJudge(n, time, isActive, judgement);
        else
            return this.handleNoteJudge(n, time, isActive, judgement);

    }

    update(time: number, isActive: boolean, speed: number, judgement: IJudgement, scoreboard: Scoreboard): number | null
    {
        const updateVisibleNotes = () => {
            for (let i = this.lastVisualNote; i < this.notes.length; i++)
            {
                const n = this.notes[i];
                if (n.isAboveScreen(time, speed))
                    break;
                
                n.update(time, speed);
                if (!n.isNoteOnScreen(time, speed))
                {
                    n.releaseMeshes();
                    this.lastVisualNote = i + 1;
                }
            }
        }

        if (this.lastActiveState !== isActive)
            this.noteReceptorActive = isActive;

        updateVisibleNotes();

        let hitDelta = null;
        const n = this.currentNote;
        if (n !== undefined)
        {
            const noteJudge = this.handleNoteInput(n, time, isActive, judgement);
            if (noteJudge !== null) // not null if note has changed state
            {
                let judge;
                [judge, hitDelta] = noteJudge;
                if (judge !== NoteState.HELD)
                {
                    const score = judgement.scoreHitDelta(hitDelta);
                    scoreboard.recalculateAccuracy(score, judgement.maxScore);
                    // console.log(hitDelta, score);
                    
                    this.lastNoteHitIndex++;
                }
                
                if (judge === NoteState.MISSED)
                    scoreboard.combo = 0;
                else if (judge === NoteState.HIT)
                    scoreboard.combo++;
            }


        }

        this.lastActiveState = isActive;
        
        return hitDelta;

    }

    addNote(startTime: number, endTime = -1)
    {
        const note = new Note(startTime, this.skin, this.noteQueue);
        if (endTime >= 0)
            note.createLn(endTime);
        
        this.notes.push(note);
        this.laneGroup.add(note.noteGroup);
    }

}
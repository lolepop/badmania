import * as THREE from "three";
import { HitJudge, IJudgement } from "./judge/IJudgement";
import { Note, NoteState } from "./note";
import Skin from "./skin";
import Scoreboard from "./ui/scoreboard";

export default class Lane
{
    notes: Note[] = [];
    lastActiveState: boolean = false; // is lane pressed by player
    lastNoteHitIndex = -1;
    
    skin: Skin;

    noteReceptor: THREE.Mesh;
    laneGroup: THREE.Group = new THREE.Group();

    constructor(skin: Skin)
    {
        this.skin = skin;
        
        this.noteReceptor = skin.noteReceptorMesh;
        this.noteReceptor.position.y = skin.receptorOffset - 1;
        this.laneGroup.add(this.noteReceptor);
    }
    
    get currentNote(): Note | undefined
    {
        return this.notes[this.lastNoteHitIndex + 1];
    }

    handleLnJudge(n: Note, time: number, isLaneActive: boolean, judgement: IJudgement)
    {
        const judge = judgement.getJudge(time, n.startTime);

        // ln is being held past starting timing
        if (isLaneActive && n.state === NoteState.HELD && time >= n.endTime!)
        {
            // auto count hit once past end point 
            console.log("holding ln");
            return n.setState(NoteState.HIT, time);
        }

        const laneStateHasChanged = this.lastActiveState !== isLaneActive;
        if (laneStateHasChanged)
        {
            // ln press
            if (isLaneActive)
            {
                console.log("ln hit");
                return n.setState(judge === HitJudge.MISS ? NoteState.MISSED : NoteState.HELD, time);
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
                    return n.setState(n.endTime! - time <= 200 ? NoteState.HIT : NoteState.MISSED, time);
                }
            }
        }

        return null;

    }

    handleNoteJudge(n: Note, time: number, isLaneActive: boolean, judgement: IJudgement)
    {
        const judge = judgement.getJudge(time, n.startTime);

        const laneStateHasChanged = this.lastActiveState !== isLaneActive;
        if (laneStateHasChanged && judge !== HitJudge.NOT_HIT && isLaneActive)
        {
            console.log("normal note hit");
            // player pressed key and triggers miss judgement
            return n.setState(judge === HitJudge.MISS ? NoteState.MISSED : NoteState.HIT, time);
        }

        return null;

    }

    handleNoteInput(n: Note, time: number, isActive: boolean, judgement: IJudgement)
    {
        const judge = judgement.getJudge(time, n.startTime);

        // note passed without player hitting it
        if (n.state !== NoteState.HELD && judge === HitJudge.MISS && time > n.startTime)
        {
            console.log("note expired");
            return n.setState(NoteState.MISSED, time);
        }

        if (n.isLn)
            return this.handleLnJudge(n, time, isActive, judgement);
        else
            return this.handleNoteJudge(n, time, isActive, judgement);

    }

    update(time: number, isActive: boolean, judgement: IJudgement, scoreboard: Scoreboard)
    {
        if (this.lastActiveState !== isActive)
        {
            this.noteReceptor.material = isActive ? this.skin.noteReceptorActiveMaterial : this.skin.noteReceptorMaterial;
            this.noteReceptor.material.needsUpdate = true;
        }

        const n = this.currentNote;
        if (n !== undefined)
        {
            const noteJudge = this.handleNoteInput(n, time, isActive, judgement);
            if (noteJudge !== null) // not null if note has changed state
            {
                if (noteJudge !== NoteState.HELD)
                {
                    this.lastNoteHitIndex++;
                }
                
                if (noteJudge === NoteState.MISSED)
                    scoreboard.combo = 0;
                else if (noteJudge === NoteState.HIT)
                    scoreboard.combo++;
            }


        }

        this.lastActiveState = isActive;

    }

    // getVisibleNotes(time)
    // {

    // }

    addNote(startTime: number, endTime = -1)
    {
        const note = new Note(startTime, this.skin);
        if (endTime >= 0)
            note.createLn(endTime);
        
        this.notes.push(note);
        this.laneGroup.add(note.noteGroup);
    }

}
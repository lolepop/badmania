import * as THREE from "three";
import { Note, HitJudge, NoteState } from "./note";
import Skin from "./skin";

export default class Lane
{
    notes: Note[] = [];
    isActive: boolean = false; // is lane pressed by player
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

    handleInput(time: number, isActive: boolean)
    {
        if (this.isActive !== isActive)
        {
            this.noteReceptor.material = isActive ? this.skin.noteReceptorActiveMaterial : this.skin.noteReceptorMaterial;
            this.noteReceptor.material.needsUpdate = true;
        }

        const n = this.currentNote;
        if (n === undefined) return;

        const handleNoteState = () => {

            const judge = n.checkHit(time);

            // ln is being held past starting timing
            if (isActive && n.state === NoteState.HELD && time >= n.endTime!)
            {
                // auto count hit once past end point 
                console.log("holding ln");
                n.state = NoteState.HIT;
                n.endHitTime = time;
                this.lastNoteHitIndex++;
                return;
            }
    
            if (this.isActive !== isActive)
            {
                // normal note press
                if (!n.isLn)
                {
                    if (judge !== HitJudge.NOT_HIT && isActive)
                    {
                        console.log("normal note hit");
                        // player pressed key and triggers miss judgement
                        n.state = judge === HitJudge.MISSED ? NoteState.MISSED : NoteState.HIT;
                        n.hitTime = time;
                        this.lastNoteHitIndex++;
                        return;
                    }
                }
                else
                {
                    // ln press
                    if (isActive)
                    {
                        console.log("ln hit");
                        if (judge === HitJudge.MISSED)
                        {
                            n.state = NoteState.MISSED;
                            n.hitTime = time;
                            this.lastNoteHitIndex++;
                            return;
                        }
                        else
                        {
                            n.state = NoteState.HELD;
                            return;
                        }
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
                            n.state = n.endTime! - time <= 200 ? NoteState.HIT : NoteState.MISSED;
                            n.endHitTime = time;
                            this.lastNoteHitIndex++;
                            return;
                        }
    
                    }
                }
            }

            // note passed without player hitting it
            if (n.state !== NoteState.HELD && judge === HitJudge.MISSED && time > n.startTime)
            {
                console.log("note expired");
                n.state = NoteState.MISSED;
                n.hitTime = time + 180;
                this.lastNoteHitIndex++;
                return;
            }

        };
        
        handleNoteState();
    
        this.isActive = isActive;

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
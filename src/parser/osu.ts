import { IChartParser, Chart, Note } from "./chart";

const isNum = (v: any) => !isNaN(+v);
const intToBitArr = (n: number, bits: number) => [...Array(bits)].map((x, i) => n >> i & 1);
const bitArrToInt = (arr: number[]) => arr.reduce((acc: number, v: number) => (acc << 1) | v);

export default class OsuMap implements IChartParser
{
    formatVersion?: Number;
    General: { [key: string]: any } = {};
    Editor: { [key: string]: any } = {};
    Metadata: { [key: string]: any } = {};
    Difficulty: { [key: string]: any } = {};
    Events: ReturnType<typeof OsuMap.parseEvent>[] = [];
    TimingPoints: ReturnType<typeof OsuMap.parseTimingPoint>[] = [];
    Colours: { [key: string]: any } = {};
    HitObjects: ReturnType<typeof OsuMap.parseHitObject>[] = [];

    private static parseEvent(values: string[])
    {
        const type = isNum(values[0]) ? parseInt(values[0]) : values[0];
        const startTime = parseInt(values[1]);
        switch (type)
        {
        case 0: // backgrounds
            return { type: "background", filename: values[2], xOffset: parseInt(values[3]), yOffset: parseInt(values[4]) };
        case 1: // videos
        case "Video":
            return { type: "video", startTime, xOffset: parseInt(values[3]), yOffset: parseInt(values[4]) };
        case 2: // breaks
        case "Break":
            return { type: "break", startTime, endTime: parseInt(values[2]) };
        default: // storyboards (not implemented)
            return values;
        }
    }

    private static parseHitObject(values: string[])
    {
        const type = intToBitArr(parseInt(values[3]), 8);
            const hitSample = values[values.length - 1].split(":");
            const typeName = [
                "circle", 
                "slider",
                "spinner",
                "maniaHold"
            ][[0, 1, 3, 7].reduce((acc, v, i) => (acc = !!type[v] && acc < 0 ? i : acc, acc), -1)]

            const ret = {
                x: parseInt(values[0]),
                y: parseInt(values[1]),
                time: parseInt(values[2]),
                type: typeName,
                hitSound: parseInt(values[4]),
                newCombo: !!type[2],
                skipCombo: bitArrToInt(type.slice(4, 7)),
                hitSample: {
                    normalSet: parseInt(hitSample[0]),
                    additionSet: parseInt(hitSample[1]),
                    index: parseInt(hitSample[2]),
                    volume: parseInt(hitSample[3]),
                    filename: hitSample[4],
                }
            }

            switch (typeName)
            {
            case "slider":
                const curve = values[5].split("|");
                return {
                    ...ret,
                    curveType: ["bezier", "catmull", "linear", "circle"]["BCLP".indexOf(curve[0])],
                    curvePoints: curve.slice(1).map(a => { const b = a.split(":"); return { x: parseInt(b[0]), y: parseInt(b[1]) }; }),
                    slides: parseInt(values[6]),
                    length: parseFloat(values[7]),
                    edgeSounds: values[8].split("|").map(a => parseInt(a)),
                    edgeSets: values[9].split("|").map(a => { const b = a.split(":"); return { normalSet: parseInt(b[0]), additionSet: parseInt(b[1]) } })
                };
            case "spinner":
            case "maniaHold":
                return {
                    ...ret,
                    endTime: parseInt(values[5])
                };
            case "circle":
            default:
                return ret;
            }
    }

    private static parseTimingPoint(values: string[])
    {
        return {
            time: parseInt(values[0]),
            beatLength: parseFloat(values[1]),
            meter: parseInt(values[2]),
            sampleSet: parseInt(values[3]),
            sampleIndex: parseInt(values[4]),
            volume: parseInt(values[5]),
            uninherited: parseInt(values[6]),
            effects: parseInt(values[7])
        };
    }

    private static parseCsvString(header: string, values: string[])
    {
        switch (header)
        {
        case "Events":
            return OsuMap.parseEvent(values);
        case "TimingPoints":
            return OsuMap.parseTimingPoint(values);
        case "HitObjects":
            return OsuMap.parseHitObject(values);
        default:
            return values;
        }
    }

    fromString(obj: string)
    {
        const csvIndices = new Set(["Events", "TimingPoints", "HitObjects"]);

        const lines = obj.split(/\r?\n/g);

        let currHeader: string | null = null;
        for (const [i, _line] of lines.entries())
        {
            const line = _line.trim();
            
            // skip linebreaks and comments
            if (line.length <= 0 || line.startsWith("//")) continue;

            // get magic
            if (i === 0)
            {
                // theres no ?[] operator why   ??????????????????????
                this.formatVersion = parseInt((line.match(/osu file format v(\d+)/) || [])[1]);
                continue;
            }

            // match ini header
            {
                const header = (line.match(/\[(\w+)\]/) || [])[1];
                if (header)
                {
                    currHeader = header;
                    continue;
                }
            }

            if (currHeader === null)
                continue;

            const header = (this as any)[currHeader];
            if (!csvIndices.has(currHeader))
            {
                // key: value pair
                const propertykv = line.match(/(\w+)[ ]*:[ ]*(\w+)/) || [];
                if (propertykv.length > 0)
                {
                    header[propertykv[1]] = propertykv[2];
                    continue;
                }
            }
            else
            {
                // csv sections
                const values = line.split(",")
                header.push(OsuMap.parseCsvString(currHeader, values));
                continue;
            }

        }

    }

    toChart()
    {
        const keys = parseInt(this.Difficulty.CircleSize);
        const notes = this.HitObjects.reduce<Note[]>((acc, o) => acc.concat({
            lane: Math.trunc(o.x * keys / 512),
            startTime: o.time,
            endTime: o.type === "maniaHold" ? (<any>o).endTime : undefined
        }), []);
        
        return {keys, notes};
    }

}

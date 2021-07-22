# parser for osu format (ini)
# @builtin "whitespace.ne"
# @builtin "number.ne"

@{%
    // import moo from "moo";
    if (typeof module !== "undefined" && typeof module.exports !== "undefined")
        var moo = require("moo");
    // else
    //    var moo = import("moo");

    // "General", "Editor", "Metadata", "Difficulty", 

    const headers = new Set(["Events", "TimingPoints", "HitObjects"]);
    const lexer = moo.compile({
        // ...symbols,
        // unsigned_int: { match: /[0-9]+/, value: parseInt },
        // float: { match: /-?[0-9]+(?:\.[0-9]+)?/, value: parseFloat },
        lb: { match: /(?:\r\n|\r|\n)+/, lineBreaks: true },
        magicString: { match: /^(?:osu file format v)[0-9]+/, value: a => a.slice("osu file format v".length) } ,
        headerString: { match: /^(?:\[)[A-Z]\w+(?:\])/, value: a => a.slice(1, a.length - 1) },
        propertyPair: { match: /^\w+(?:\s*):(?:\s*).+/, value: a => { const b = a.split(/:(.*)/); return [b[0], b[1].trim()]; }},
        commentString: /\/\/.*/,
        ",": ",",
        quotedString: { match: /"(?:[^"\\]|\\.)*"/, value: a => a.slice(1, a.length - 1) },
        miscVal: /[\d\w\-\.:|]+/
    });

    function parseCsvSection(header, values)
    {
        const argLen = values.length;
        const isNum = v => !isNaN(+v);
        const intToBitArr = (n, bits) => [...Array(bits)].map((x, i) => n >> i & 1);
        const bitArrToInt = arr => arr.reduce((acc, v) => (acc << 1) | v);

        const parseEvent = type => {
            const startTime = parseInt(values[1])
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

        const parseHitObject = () => {
            const type = intToBitArr(parseInt(values[3]), 8);
            const hitSample = values[argLen - 1].split(":");
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
                return Object.assign(ret, {
                    curveType: ["bezier", "catmull", "linear", "circle"]["BCLP".indexOf(curve[0])],
                    curvePoints: curve.slice(1).map(a => { const b = a.split(":"); return { x: parseInt(b[0]), y: parseInt(b[1]) }; }),
                    slides: parseInt(values[6]),
                    length: parseFloat(values[7]),
                    edgeSounds: values[8].split("|").map(a => parseInt(a)),
                    edgeSets: values[9].split("|").map(a => { const b = a.split(":"); return { normalSet: parseInt(b[0]), additionSet: parseInt(b[1]) } })
                });
            case "spinner":
            case "maniaHold":
                return Object.assign(ret, {
                    endTime: parseInt(values[5])
                });
            case "circle":
            default:
                return ret;
            }

            return ;
        }

        switch (header)
        {
        case "Events":
            return parseEvent(isNum(values[0]) ? parseInt(values[0]) : values[0]);
        case "TimingPoints":
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
        case "HitObjects":
            return parseHitObject();
        default:
            return values;
        }
    }

    const kvToObj = f => f.reduce((acc, h) => Object.assign(acc, h), {});

    const empty = () => null;
%}

@lexer lexer

# entire file
osu -> magic headers {%
    o => ({
        ...o[0],
        ...kvToObj(o[1])
    })
%}

magic -> %magicString %lb {%
    o => ({
        version: o[0].value
    })
%}

# [Section]
headers -> header:* {% id %}
header -> %headerString %lb body {%
    o => {
        const f = o[2].filter(a => a !== null);
        return {
            [o[0].value]: headers.has(o[0].value) ?
                f.map(a => parseCsvSection(o[0].value, a)) :
                kvToObj(f)
        };
    }
%}

# under each [Section]
body -> bodyItems:* {% id %}
bodyItems -> (property | comment | csvLine) %lb {% ([[o]]) => o %}

property -> %propertyPair {% ([{value: o}]) => ({ [o[0]]: o[1] }) %}

comment -> %commentString {% empty %}

csvLine -> csv {% ([o]) => o.map(a => a ? a.value : a) %}
csv -> ",":? csvVal {% o => o[1] %}
    | csv "," csvVal:? {% o => o[0].concat(o[2]) %}

csvVal -> %miscVal | %quotedString {% id %}


const fs = require("fs");
const zlib = require("zlib");

const workbookFiles = readZip("./table/Level1.xlsx");
const sharedStrings = parseSharedStrings(workbookFiles["xl/sharedStrings.xml"] || "");
const sheetById = parseRelationships(workbookFiles["xl/_rels/workbook.xml.rels"]);
const sheets = parseWorkbookSheets(workbookFiles["xl/workbook.xml"]);

sheets.forEach(function (sheet) {
    if (sheet.name == "StateTable") return;

    const sheetPath = "xl/" + sheetById[sheet.rId].replace(/^\//, "");
    const worksheet = parseWorksheet(workbookFiles[sheetPath], sharedStrings);
    const headers = {};
    const data = [];

    Object.keys(worksheet).forEach(function (z) {
        let tt = 0;
        for (let i = 0; i < z.length; i++) {
            if (!isNaN(z[i])) {
                tt = i;
                break;
            }
        }
        const col = z.substring(0, tt);
        const row = parseInt(z.substring(tt));
        const value = worksheet[z];

        if (row == 1 && value !== undefined && value !== "") {
            headers[col] = value;
            return;
        }

        if (!data[row]) data[row] = {};
        if (headers[col] == "NewCardID" || headers[col] == "NextHintID") {
            data[row][headers[col]] = JSON.parse(value);
        } else if (headers[col] == "Comment") {
            // omit comment
        } else {
            data[row][headers[col]] = value;
        }
    });

    data.shift();
    data.shift();
    const filePath = "./src/Level1/" + sheet.name + ".json";
    fs.writeFile(filePath, JSON.stringify(data), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved! filePath: " + filePath);
    });
});

function readZip(filePath) {
    const buf = fs.readFileSync(filePath);
    let eocd = buf.length - 22;
    while (eocd > 0 && buf.readUInt32LE(eocd) !== 0x06054b50) {
        eocd -= 1;
    }
    if (eocd <= 0) {
        throw new Error("Not a valid xlsx zip archive");
    }

    const cdCount = buf.readUInt16LE(eocd + 10);
    let pointer = buf.readUInt32LE(eocd + 16);
    const files = {};

    for (let i = 0; i < cdCount; i++) {
        if (buf.readUInt32LE(pointer) !== 0x02014b50) {
            throw new Error("Invalid zip central directory");
        }
        const method = buf.readUInt16LE(pointer + 10);
        const compSize = buf.readUInt32LE(pointer + 20);
        const nameLen = buf.readUInt16LE(pointer + 28);
        const extraLen = buf.readUInt16LE(pointer + 30);
        const commentLen = buf.readUInt16LE(pointer + 32);
        const localOff = buf.readUInt32LE(pointer + 42);
        const name = buf.slice(pointer + 46, pointer + 46 + nameLen).toString();

        const localNameLen = buf.readUInt16LE(localOff + 26);
        const localExtra = buf.readUInt16LE(localOff + 28);
        const dataStart = localOff + 30 + localNameLen + localExtra;
        const data = buf.slice(dataStart, dataStart + compSize);
        let content;
        if (method === 0) {
            content = data;
        } else if (method === 8) {
            content = zlib.inflateRawSync(data);
        } else {
            throw new Error("Unsupported zip compression: " + method);
        }
        files[name] = content.toString("utf8");
        pointer += 46 + nameLen + extraLen + commentLen;
    }
    return files;
}

function parseRelationships(xml) {
    const rels = {};
    const relPattern = /<Relationship\b([^>]+)\/>/g;
    let match;
    while ((match = relPattern.exec(xml)) !== null) {
        const id = attr(match[1], "Id");
        const target = attr(match[1], "Target");
        if (id && target) {
            rels[id] = target;
        }
    }
    return rels;
}

function parseWorkbookSheets(xml) {
    const sheets = [];
    const sheetPattern = /<sheet\b([^>]+)\/>/g;
    let match;
    while ((match = sheetPattern.exec(xml)) !== null) {
        sheets.push({
            name: attr(match[1], "name"),
            rId: attr(match[1], "r:id")
        });
    }
    return sheets;
}

function parseSharedStrings(xml) {
    const strings = [];
    const siPattern = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
    let match;
    while ((match = siPattern.exec(xml)) !== null) {
        let text = "";
        const textPattern = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
        let textMatch;
        while ((textMatch = textPattern.exec(match[1])) !== null) {
            text += decodeXml(textMatch[1]);
        }
        strings.push(text);
    }
    return strings;
}

function parseWorksheet(xml, sharedStrings) {
    const cells = {};
    const cellPattern = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
    let match;
    while ((match = cellPattern.exec(xml)) !== null) {
        const ref = attr(match[1], "r");
        const type = attr(match[1], "t") || "n";
        const inner = match[2] || "";
        const valueMatch = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(inner);
        if (!ref || !valueMatch) continue;
        const raw = decodeXml(valueMatch[1]);
        if (type === "s") {
            cells[ref] = sharedStrings[parseInt(raw, 10)];
        } else if (type === "b") {
            cells[ref] = raw === "1";
        } else if (type === "str" || type === "inlineStr") {
            cells[ref] = raw;
        } else if (raw !== "") {
            cells[ref] = Number(raw);
        }
    }
    return cells;
}

function attr(source, name) {
    const match = new RegExp("\\b" + name.replace(":", "\\:") + "=\"([^\"]*)\"").exec(source);
    return match ? match[1] : "";
}

function decodeXml(value) {
    return value
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&");
}

const { parseSections } = require("./lib/sectionParser");
const { parseResume } = require("./lib/resumeParser");

const text1 = "SUMMARY\nSoftware professional.\n\nLANGUAGES KNOWN\nHindi, English, Marathi\n\nSKILLS\nPython, MySQL";
const text2 = "SUMMARY\nSoftware professional.\n\nSKILLS\nLanguages & Tools: Python, Mysql, Excel\nSoft Skills: Leadership";

const r1 = parseResume(text1);
const r2 = parseResume(text2);

console.log("Test 1 - dedicated section:", JSON.stringify(r1.languagesKnown));
console.log("Test 2 - inline pattern:", JSON.stringify(r2.languagesKnown));

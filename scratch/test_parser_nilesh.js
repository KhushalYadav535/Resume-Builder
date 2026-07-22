function parseEducationLine(line) {
  let institution = "";
  let degree = "";
  let field = "";

  const years = line.match(/\b(19|20)\d{2}\b/g);
  const startDate = years?.[0] || "";
  const endDate = years?.[1] || "";
  let cleanLine = line.replace(/\b(19|20)\d{2}\b/g, "").trim();

  const INST_PATTERN = /\b((?:(?!Electronics|Communication|Engineering|Technology|Computer|Science|Arts|Commerce|Management|Business)[A-Z][a-zA-Z0-9'-]+\s+){1,4}(?:University|College|Institute|School|Academy|Board|IIT|NIT|BITS))\b/i;

  const instMatch = cleanLine.match(INST_PATTERN);
  if (instMatch) {
    institution = instMatch[1].trim();
    cleanLine = cleanLine.replace(instMatch[1], "").trim();
  }

  const inParts = cleanLine.split(/\s+in\s+/i);
  degree = inParts[0] ? inParts[0].trim() : cleanLine;
  field = inParts[1] ? inParts[1].trim() : "";

  return { institution, degree, field, startDate, endDate };
}

console.log(parseEducationLine("Bachelor of Engineering in Electronics & Communication North Gujarat University"));

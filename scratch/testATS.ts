import { calculateDynamicATS } from '../lib/ats';

const resume1 = `
John Doe
Software Engineer
Skills: React, Next.js, Node.js, TypeScript, Tailwind CSS, SQL, Docker
Experience:
Worked as a fullstack developer building scalable applications using ReactJS and NodeJS.
Deployed services on AWS and managed CI/CD pipelines.
`;

const result1 = calculateDynamicATS(resume1);
console.log("--- Software Engineer Resume ---");
console.log(JSON.stringify(result1, null, 2));

const resume2 = `
Jane Smith
Financial Analyst
Skills: Financial Modeling in Excel, Advanced Excel, Valuation, Corporate Finance
Experience:
Performed DCF analysis and built financial projections.
`;

const result2 = calculateDynamicATS(resume2);
console.log("\n--- Financial Analyst Resume ---");
console.log(JSON.stringify(result2, null, 2));

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const outPath = path.resolve(__dirname, "../demo/sample-infrastructure-report.pdf");
fs.mkdirSync(path.dirname(outPath), { recursive: true });

const doc = new PDFDocument({ margin: 50 });
doc.pipe(fs.createWriteStream(outPath));

doc.fontSize(18).font("Helvetica-Bold").text("PUBLIC WORKS DEPARTMENT", { align: "center" });
doc.fontSize(14).font("Helvetica").text("Government of Rajapuram State", { align: "center" });
doc.moveDown();
doc.fontSize(16).font("Helvetica-Bold").text("Infrastructure Project Status Report", { align: "center" });
doc.moveDown(1.5);

doc.fontSize(11).font("Helvetica");

const fields: Array<[string, string]> = [
  ["Project Name", "Rajapuram-Kondapally Highway Widening (Phase II)"],
  ["Department", "Public Works Department (PWD)"],
  ["District", "Kondapally District"],
  ["Contractor", "Sri Balaji Infra Constructions Pvt. Ltd."],
  ["Project ID", "PWD/RJP-KDP/2023/0417"],
  ["Sanctioned Budget", "INR 84.5 Crore"],
  ["Amount Disbursed to Date", "INR 61.2 Crore"],
  ["Timeline", "Start: 12 Jan 2023  |  Original Completion: 11 Jan 2025  |  Revised Completion: 30 Jun 2025"],
  ["Physical Progress", "68% complete as of last quarterly inspection (April 2026)"],
];

fields.forEach(([label, value]) => {
  doc.font("Helvetica-Bold").text(`${label}: `, { continued: true }).font("Helvetica").text(value);
  doc.moveDown(0.4);
});

doc.moveDown();
doc.font("Helvetica-Bold").fontSize(13).text("Financial Summary");
doc.font("Helvetica").fontSize(11).moveDown(0.3);
doc.text(
  "The project has utilized 72% of the sanctioned budget against 68% physical progress, indicating a " +
    "moderate cost overrun risk. A supplementary budget request of INR 6.8 Crore has been submitted to " +
    "the state finance committee to cover increased material costs (bitumen and steel) and is pending approval."
);

doc.moveDown();
doc.font("Helvetica-Bold").fontSize(13).text("Identified Risks & Issues");
doc.font("Helvetica").fontSize(11).moveDown(0.3);
const risks = [
  "Land acquisition delays in the Kondapally bypass segment (2.3 km) have stalled work on that stretch since November 2025.",
  "Monsoon season (July-September) is expected to further delay the earthwork and drainage components.",
  "The contractor has requested a 5-month extension citing rising input material costs.",
  "Quality audit conducted in March 2026 flagged sub-standard aggregate used in a 400m stretch near Chainage 14+200; remedial work is pending contractor response.",
  "Utility relocation (electricity poles, water pipeline) by the local municipal corporation is behind schedule, blocking two additional segments.",
];
risks.forEach((risk) => doc.text(`• ${risk}`, { indent: 10 }));

doc.moveDown();
doc.font("Helvetica-Bold").fontSize(13).text("Oversight Committee Notes");
doc.font("Helvetica").fontSize(11).moveDown(0.3);
doc.text(
  "The District Oversight Committee recommends close monitoring of the budget variance and requests the " +
    "contractor to submit a revised work schedule within 15 days. Independent quality audit for the flagged " +
    "segment is scheduled for the next inspection cycle. Compliance certificate for environmental clearance " +
    "renewal (originally due March 2026) has not yet been submitted by the contractor."
);

doc.moveDown(2);
doc.fontSize(9).font("Helvetica-Oblique").text("This is a synthetic demo document generated for testing Project Sentinel's document ingestion pipeline. It does not represent a real project, department, or contractor.", {
  align: "center",
});

doc.end();

doc.on("end", () => {
  console.log(`Demo PDF written to ${outPath}`);
});

/**
 * Generates the HMRC Charities Online recognition-process sample XML.
 *
 * Uses the exact test data from the HMRC recognition process PDF (v1.7, December 2017).
 * https://www.gov.uk/government/publications/charities-online-service-recognition-process
 *
 * Run with:
 *   npx tsx scripts/generate-recognition-xml.ts
 *
 * Output is written to:
 *   recognition/recognition-submission.xml
 *
 * Before submitting to HMRC, validate the output against the Local Test Service (LTS):
 *   https://www.gov.uk/government/publications/local-test-service-and-lts-update-manager
 *
 * Then email the file (and the other required message samples) to:
 *   SDSTeam@hmrc.gov.uk
 */

import fs from "fs";
import path from "path";
import { buildR68Xml, type DonationXmlRecord, type GasdsInput } from "../src/lib/hmrc/xml-builder";

// ---------------------------------------------------------------------------
// HMRC Recognition Test Data (PDF v1.7, page 4)
// Claim submission date set to 01/05/2015 via GatewayTimestamp
// ---------------------------------------------------------------------------

const donations: DonationXmlRecord[] = [
  // Mrs Mary Smith — sponsored event
  {
    donorTitle: "Mrs",
    donorFirstName: "Mary",
    donorLastName: "Smith",
    donorHouseNameOrNumber: "100",
    donorPostcode: "AB23 4CD",
    sponsored: true,
    donationDate: new Date("2015-04-07"),
    grossAmountPence: 50000, // £500.00
  },
  // Jim Harris — overseas (no UK postcode)
  {
    donorFirstName: "Jim",
    donorLastName: "Harris",
    donorHouseNameOrNumber: "19 The Promenade, Benidorm",
    donorOverseas: true,
    donationDate: new Date("2015-04-15"),
    grossAmountPence: 1000, // £10.00
  },
  // Bill Hill-Jones
  {
    donorFirstName: "Bill",
    donorLastName: "Hill-Jones",
    donorHouseNameOrNumber: "1",
    donorPostcode: "BA23 9CD",
    donationDate: new Date("2015-04-17"),
    grossAmountPence: 250, // £2.50
  },
  // Bob Hill-Jones
  {
    donorFirstName: "Bob",
    donorLastName: "Hill-Jones",
    donorHouseNameOrNumber: "1",
    donorPostcode: "BA23 9CD",
    donationDate: new Date("2015-04-20"),
    grossAmountPence: 1200, // £12.00
  },
  // Captain William Black — BFPO address (no UK postcode)
  {
    donorTitle: "Capt",
    donorFirstName: "William",
    donorLastName: "Black",
    donorHouseNameOrNumber: "59 BFPO 8",
    donorOverseas: true,
    donationDate: new Date("2015-04-20"),
    grossAmountPence: 2000, // £20.00
  },
  // Aggregated donation: 200 × £5 = £1,000 from members
  {
    aggDonationDescription: "200 members x £5 each",
    donationDate: new Date("2015-04-30"),
    grossAmountPence: 100000, // £1,000.00
  },
];

const gasds: GasdsInput = {
  connectedCharities: true,
  charities: [
    {
      name: "Thanks for the Money",
      hmrcRef: "AB98765",
    },
  ],
  gasdsClaims: [
    {
      year: 2014,
      amountPence: 100000, // £1,000.00
    },
  ],
  commBldgs: true,
  buildings: [
    {
      name: "The Village Shed",
      address: "The Village Green, Givingsville",
      postcode: "AA11 1AA",
      claims: [{ year: 2014, amountPence: 10100 }], // £101.00
    },
    {
      name: "The Village Shack",
      address: "The Park, Givingsville",
      postcode: "AA2 2AA",
      claims: [{ year: 2014, amountPence: 99999 }], // £999.99
    },
  ],
  adjustmentPence: 2500, // £25.00 adjustment to GASDS total
};

// ---------------------------------------------------------------------------
// Build XML
// ---------------------------------------------------------------------------

const xml = buildR68Xml({
  charity: {
    hmrcReference: "AB12345",
    orgName: "A Fundraising Organisation",
    regName: "CCEW",
    regNo: "123456",
    authorisedOfficialForename: "Bob",
    authorisedOfficialSurname: "Smith",
    authorisedOfficialPostcode: "AB12 3CD",
    authorisedOfficialPhone: "01234567890",
    contactEmail: "bob.smith@aFundraisingOrganisation.org",
  },
  periodEnd: "2015-04-05",
  donations,
  otherIncome: [
    {
      payer: "Bert Green",
      date: new Date("2015-04-10"),
      grossPence: 1312, // £13.12
      taxPence: 262, // £2.62
    },
  ],
  repaymentAdjustmentPence: 5000, // £50.00 adjustment to repayment claim
  gasds,
  isTest: true,
  gatewayUsername: "RECOGNITION_TEST",
  gatewayPassword: "RECOGNITION_TEST",
  // Adjustment explanations are required by HMRC business rules when any adjustment is present
  otherInfo:
    "Repayment adjustment of £50 to correct previous submission. GASDS adjustment of £25 to correct previous GASDS claim.",
  // Per HMRC test instructions: set submission date to 01/05/2015
  gatewayTimestamp: "2015-05-01T12:00:00",
});

// ---------------------------------------------------------------------------
// Write output
// ---------------------------------------------------------------------------

const outDir = path.join(process.cwd(), "recognition");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "recognition-submission.xml");
fs.writeFileSync(outFile, xml, "utf8");

console.log(`Recognition XML written to: ${outFile}`);
console.log(`File size: ${Buffer.byteLength(xml)} bytes`);
console.log("");
console.log("Next steps:");
console.log("1. Validate against the Local Test Service (LTS)");
console.log("2. Email recognition/recognition-submission.xml to SDSTeam@hmrc.gov.uk");
console.log("   along with SUBMISSION_POLL, DELETE_REQUEST, DATA_REQUEST samples");
console.log("   and the corresponding ISV Reflector response messages.");

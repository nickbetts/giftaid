/**
 * Builds the R68 GovTalk XML envelope for HMRC Charities Online Gift Aid repayment claims.
 *
 * Spec:   https://www.gov.uk/government/collections/charities-online-support-for-software-developers
 * Schema: r68-v2-0.xsd  (namespace http://www.govtalk.gov.uk/taxation/charities/r68/2)
 * Class:  HMRC-CHAR-CLM
 */

export type CharityXmlInfo = {
  hmrcReference: string;
  /** Full legal name of the charity, used in OrgName. */
  orgName: string;
  /** Charity regulator short code (CCEW / CCNI / OSCR). Omit if unregistered. */
  regName?: "CCEW" | "CCNI" | "OSCR";
  /** Regulator registration number. */
  regNo?: string;
  /** Title of the authorised official (max 4 chars, e.g. "Mr", "Mrs", "Dr"). */
  authorisedOfficialTitle?: string;
  authorisedOfficialForename: string;
  authorisedOfficialSurname: string;
  /** UK postcode of the authorised official, used to identify them to HMRC. */
  authorisedOfficialPostcode: string;
  authorisedOfficialPhone: string;
  contactEmail: string;
};

/**
 * A single Gift Aid donation line (GAD element in the schema).
 * Either supply Donor fields (donorFirstName + donorLastName + donorHouseNameOrNumber
 * + postcode/overseas) OR set aggDonationDescription for an aggregated batch.
 */
export type DonationXmlRecord = {
  /** Optional title, max 4 chars (e.g. "Mr", "Mrs", "Dr", "Rev"). */
  donorTitle?: string | null;
  /** Required for individual (non-aggregated) donors. */
  donorFirstName?: string;
  donorLastName?: string;
  /** House name or number — required for individual donors (max 40 chars). */
  donorHouseNameOrNumber?: string | null;
  /** UK postcode. Omit (or leave blank) for overseas / BFPO donors. */
  donorPostcode?: string | null;
  /** Set true when the donor has no UK address. Emits <Overseas>Yes</Overseas>. */
  donorOverseas?: boolean;
  /**
   * For aggregated batches: a short description string (max 35 chars) instead of
   * individual donor details.  E.g. "200 members £5 each".
   */
  aggDonationDescription?: string;
  /** Was this donation part of a sponsored event? Emits <Sponsored>Yes</Sponsored>. */
  sponsored?: boolean;
  donationDate: Date;
  grossAmountPence: number;
};

export type OtherIncRecord = {
  payer: string;
  date: Date;
  /** Gross payment received in pence. */
  grossPence: number;
  /** Tax deducted in pence. */
  taxPence: number;
};

export type GasdsClaim = {
  year: number;
  amountPence: number;
};

export type GasdsBuilding = {
  name: string;
  address: string;
  postcode: string;
  claims: GasdsClaim[];
};

export type GasdsConnectedCharity = {
  name: string;
  hmrcRef: string;
};

export type GasdsInput = {
  /** Whether the charity has any connected charities for GASDS purposes. */
  connectedCharities: boolean;
  /** Details of connected charities (when connectedCharities = true). */
  charities?: GasdsConnectedCharity[];
  /** GASDS claim amounts per year for connected charities (max 3). */
  gasdsClaims?: GasdsClaim[];
  /** Whether the charity has community buildings for GASDS purposes. */
  commBldgs: boolean;
  buildings?: GasdsBuilding[];
  /** Adjustment to the GASDS total (in pence). Positive = increase repayment. */
  adjustmentPence?: number;
};

export type R68BuildInput = {
  charity: CharityXmlInfo;
  claimReference?: string;
  /** ISO date string for the last day of the tax year, e.g. "2024-04-05". */
  periodEnd: string;
  donations: DonationXmlRecord[];
  otherIncome?: OtherIncRecord[];
  /** Adjustment to the Gift Aid repayment total (in pence). */
  repaymentAdjustmentPence?: number;
  gasds?: GasdsInput;
  /**
   * Free-text note for the claim (max 350 chars).  Required by HMRC business rules
   * whenever a Repayment Adjustment or GASDS Adjustment is included.
   */
  otherInfo?: string;
  /**
   * 1 = test submission (GatewayTest flag set), 0 = live.
   * When submitting to the LTS or test-transaction-engine, always pass true.
   */
  isTest: boolean;
  gatewayUsername: string;
  gatewayPassword: string;
  /**
   * Optional ISO datetime string for the GatewayTimestamp element.
   * Required by HMRC recognition test data: pass "2015-05-01T12:00:00".
   */
  gatewayTimestamp?: string;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatPounds(pence: number): string {
  return (pence / 100).toFixed(2);
}

function isoDate(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

/** Build a single <GAD> element per donation record. */
function buildGadXml(donation: DonationXmlRecord): string {
  let donorOrAgg: string;

  if (donation.aggDonationDescription) {
    // Aggregated donation — AggDonation replaces Donor
    donorOrAgg = `<AggDonation>${escapeXml(donation.aggDonationDescription.slice(0, 35))}</AggDonation>`;
  } else {
    // Individual donor
    const ttl = donation.donorTitle
      ? `\n          <Ttl>${escapeXml(donation.donorTitle.slice(0, 4))}</Ttl>`
      : "";
    const fore = `\n          <Fore>${escapeXml(donation.donorFirstName ?? "")}</Fore>`;
    const sur = `\n          <Sur>${escapeXml(donation.donorLastName ?? "")}</Sur>`;
    const house = `\n          <House>${escapeXml((donation.donorHouseNameOrNumber ?? "").slice(0, 40) || " ")}</House>`;
    const isOverseas = donation.donorOverseas || !donation.donorPostcode;
    const postcodeOrOverseas = isOverseas
      ? `\n          <Overseas>yes</Overseas>`
      : `\n          <Postcode>${escapeXml(donation.donorPostcode!)}</Postcode>`;

    donorOrAgg = `<Donor>${ttl}${fore}${sur}${house}${postcodeOrOverseas}
        </Donor>`;
  }

const sponsored = donation.sponsored ? "\n        <Sponsored>yes</Sponsored>" : "";

  return `
        <GAD>
          ${donorOrAgg}${sponsored}
          <Date>${isoDate(donation.donationDate)}</Date>
          <Total>${formatPounds(donation.grossAmountPence)}</Total>
        </GAD>`;
}

/**
 * Derives the tax year-end date (April 5th) from the claim's taxYear string.
 * Input formats: "2023-24", "2024", "2023/24"  →  "2024-04-05"
 */
export function taxYearToPeriodEnd(taxYear: string): string {
  const clean = taxYear.replace(/[^0-9]/g, " ").trim();
  const parts = clean.split(/\s+/);

  let endYear: number;
  if (parts.length >= 2) {
    const second = parseInt(parts[1]!, 10);
    endYear = second < 100 ? Math.floor(parseInt(parts[0]!, 10) / 100) * 100 + second : second;
  } else {
    endYear = parseInt(parts[0]!, 10);
  }

  if (isNaN(endYear) || endYear < 2000 || endYear > 2100) {
    const now = new Date();
    endYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    endYear += 1;
  }

  return `${endYear}-04-05`;
}

function buildGasdsXml(gasds: GasdsInput): string {
  const connectedCharitiesXml = gasds.connectedCharities ? "yes" : "no";

  const charitiesXml = (gasds.charities ?? [])
    .map(
      (c) => `
          <Charity>
            <Name>${escapeXml(c.name)}</Name>
            <HMRCref>${escapeXml(c.hmrcRef)}</HMRCref>
          </Charity>`,
    )
    .join("");

  const gasdsClaimsXml = (gasds.gasdsClaims ?? [])
    .map(
      (c) => `
          <GASDSClaim>
            <Year>${c.year}</Year>
            <Amount>${formatPounds(c.amountPence)}</Amount>
          </GASDSClaim>`,
    )
    .join("");

  const commBldgsXml = gasds.commBldgs ? "yes" : "no";

  const buildingsXml = (gasds.buildings ?? [])
    .map((b) => {
      const claimsXml = b.claims
        .map(
          (c) => `
              <BldgClaim>
                <Year>${c.year}</Year>
                <Amount>${formatPounds(c.amountPence)}</Amount>
              </BldgClaim>`,
        )
        .join("");
      return `
          <Building>
            <BldgName>${escapeXml(b.name)}</BldgName>
            <Address>${escapeXml(b.address.slice(0, 40))}</Address>
            <Postcode>${escapeXml(b.postcode)}</Postcode>${claimsXml}
          </Building>`;
    })
    .join("");

  const adjXml =
    gasds.adjustmentPence != null
      ? `\n          <Adj>${formatPounds(gasds.adjustmentPence)}</Adj>`
      : "";

  return `
        <GASDS>
          <ConnectedCharities>${connectedCharitiesXml}</ConnectedCharities>${charitiesXml}${gasdsClaimsXml}
          <CommBldgs>${commBldgsXml}</CommBldgs>${buildingsXml}${adjXml}
        </GASDS>`;
}

export function buildR68Xml(input: R68BuildInput): string {
  const {
    charity,
    periodEnd,
    donations,
    otherIncome,
    repaymentAdjustmentPence,
    gasds,
    otherInfo,
    isTest,
    gatewayUsername,
    gatewayPassword,
    gatewayTimestamp,
  } = input;

  if (donations.length === 0) {
    throw new Error("Cannot build R68 XML: no eligible donation records provided.");
  }

  // Earliest Gift Aid donation date (optional, informational)
  const gadDates = donations
    .filter((d) => !d.aggDonationDescription)
    .map((d) => d.donationDate)
    .sort((a, b) => a.getTime() - b.getTime());
  const earliestGADate = gadDates.length > 0 ? isoDate(gadDates[0]!) : null;

  // AuthOfficial: official's title (max 4 chars), fore, sur, postcode/overseas, phone
  const officialTtl = charity.authorisedOfficialTitle
    ? `\n              <Ttl>${escapeXml(charity.authorisedOfficialTitle.slice(0, 4))}</Ttl>`
    : "";

  // Regulator block
  let regulatorXml = "";
  if (charity.regName) {
    const regNoXml = charity.regNo
      ? `\n              <RegNo>${escapeXml(charity.regNo)}</RegNo>`
      : "";
    regulatorXml = `
          <Regulator>
            <RegName>${charity.regName}</RegName>${regNoXml}
          </Regulator>`;
  }

  // GAD lines
  const gadsXml = donations.map(buildGadXml).join("");

  // Earliest GA date element
  const earliestGADateXml = earliestGADate
    ? `\n            <EarliestGAdate>${earliestGADate}</EarliestGAdate>`
    : "";

  // OtherInc elements
  const otherIncXml = (otherIncome ?? [])
    .map(
      (oi) => `
            <OtherInc>
              <Payer>${escapeXml(oi.payer.slice(0, 40))}</Payer>
              <OIDate>${isoDate(oi.date)}</OIDate>
              <Gross>${formatPounds(oi.grossPence)}</Gross>
              <Tax>${formatPounds(oi.taxPence)}</Tax>
            </OtherInc>`,
    )
    .join("");

  const adjustmentXml =
    repaymentAdjustmentPence != null
      ? `\n            <Adjustment>${formatPounds(repaymentAdjustmentPence)}</Adjustment>`
      : "";

  const gasdsXml = gasds ? buildGasdsXml(gasds) : "";

  const otherInfoXml = otherInfo
    ? `\n          <OtherInfo>${escapeXml(otherInfo.slice(0, 350))}</OtherInfo>`
    : "";

  const timestampXml = gatewayTimestamp
    ? `\n      <GatewayTimestamp>${escapeXml(gatewayTimestamp)}</GatewayTimestamp>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<GovTalkMessage xmlns="http://www.govtalk.gov.uk/CM/envelope">
  <EnvelopeVersion>2.0</EnvelopeVersion>
  <Header>
    <MessageDetails>
      <Class>HMRC-CHAR-CLM</Class>
      <Qualifier>request</Qualifier>
      <Function>submit</Function>
      <CorrelationID/>
      <Transformation>XML</Transformation>
      <GatewayTest>${isTest ? "1" : "0"}</GatewayTest>${timestampXml}
    </MessageDetails>
    <SenderDetails>
      <IDAuthentication>
        <SenderID>${escapeXml(gatewayUsername)}</SenderID>
        <Authentication>
          <Method>UserNameToken</Method>
          <Role>principal</Role>
          <Value>${escapeXml(gatewayPassword)}</Value>
        </Authentication>
      </IDAuthentication>
      <EmailAddress>${escapeXml(charity.contactEmail)}</EmailAddress>
    </SenderDetails>
  </Header>
  <GovTalkDetails>
    <Keys>
      <Key Type="CHARITIESREF">${escapeXml(charity.hmrcReference)}</Key>
      <Key Type="CHARID">${escapeXml(charity.hmrcReference)}</Key>
    </Keys>
    <ChannelRouting>
      <Channel>
        <URI>https://givta.co.uk</URI>
        <Product>givta Gift Aid Manager</Product>
        <Version>1.0</Version>
      </Channel>
    </ChannelRouting>
  </GovTalkDetails>
  <Body>
    <IRenvelope xmlns="http://www.govtalk.gov.uk/taxation/charities/r68/2">
      <IRheader>
        <Keys>
          <Key Type="CHARITIESREF">${escapeXml(charity.hmrcReference)}</Key>
        </Keys>
        <PeriodEnd>${escapeXml(periodEnd)}</PeriodEnd>
        <DefaultCurrency>GBP</DefaultCurrency>
        <IRmark Type="generic">0</IRmark>
        <Sender>Company</Sender>
      </IRheader>
      <R68>
        <AuthOfficial>
          <OffName>${officialTtl}
            <Fore>${escapeXml(charity.authorisedOfficialForename)}</Fore>
            <Sur>${escapeXml(charity.authorisedOfficialSurname)}</Sur>
          </OffName>
          <OffID>
            <Postcode>${escapeXml(charity.authorisedOfficialPostcode)}</Postcode>
          </OffID>
          <Phone>${escapeXml(charity.authorisedOfficialPhone)}</Phone>
        </AuthOfficial>
        <Declaration>yes</Declaration>
        <Claim>
          <OrgName>${escapeXml(charity.orgName)}</OrgName>
          <HMRCref>${escapeXml(charity.hmrcReference)}</HMRCref>${regulatorXml}
          <Repayment>${gadsXml}${earliestGADateXml}${otherIncXml}${adjustmentXml}
          </Repayment>${gasdsXml}${otherInfoXml}
        </Claim>
      </R68>
    </IRenvelope>
  </Body>
</GovTalkMessage>`;
}

/**
 * Parses the GovTalk response XML into a structured result.
 * HMRC returns qualifier: "acknowledgement" (ok), "error", or "poll" (async).
 */
export type GovTalkResponse = {
  qualifier: "acknowledgement" | "error" | "poll" | string;
  correlationId?: string;
  errors?: string[];
  rawXml: string;
};

export function parseGovTalkResponse(xml: string): GovTalkResponse {
  const qualifier = xml.match(/<Qualifier>([^<]+)<\/Qualifier>/)?.[1] ?? "unknown";
  const correlationId = xml.match(/<CorrelationID>([^<]+)<\/CorrelationID>/)?.[1];

  const errors: string[] = [];
  const errorRegex = /<Text>([^<]+)<\/Text>/g;
  let m: RegExpExecArray | null;
  while ((m = errorRegex.exec(xml)) !== null) {
    errors.push(m[1]!);
  }

  return { qualifier, correlationId, errors: errors.length ? errors : undefined, rawXml: xml };
}

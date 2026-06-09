/**
 * Builds the R68 GovTalk XML envelope for HMRC Charities Online Gift Aid repayment claims.
 *
 * Spec: https://www.gov.uk/government/collections/charities-online-support-for-software-developers
 * Class: HMRC-CHAR-CLM
 * Namespace: http://www.govtalk.gov.uk/taxation/charities/r68/2
 */

export type CharityXmlInfo = {
  hmrcReference: string;
  authorisedOfficialTitle: string;
  authorisedOfficialForename: string;
  authorisedOfficialSurname: string;
  authorisedOfficialPhone: string;
  contactEmail: string;
};

export type DonationXmlRecord = {
  donorTitle?: string | null;
  donorFirstName: string;
  donorLastName: string;
  donorHouseNameOrNumber?: string | null;
  donorPostcode: string;
  donationDate: Date;
  grossAmountPence: number;
};

export type R68BuildInput = {
  charity: CharityXmlInfo;
  claimReference: string;
  /** ISO date string for the last day of the tax year, e.g. "2024-04-05" */
  periodEnd: string;
  donations: DonationXmlRecord[];
  /**
   * 1 = test submission (GatewayTest flag set), 0 = live.
   * When submitting to the LTS or test-transaction-engine, always pass true.
   */
  isTest: boolean;
  gatewayUsername: string;
  gatewayPassword: string;
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

function buildDonorXml(donation: DonationXmlRecord): string {
  const title = donation.donorTitle ? `<Title>${escapeXml(donation.donorTitle)}</Title>` : "";
  const house = donation.donorHouseNameOrNumber
    ? `<House>${escapeXml(donation.donorHouseNameOrNumber)}</House>`
    : "";
  return `
        <Donor>
          ${title}
          <Fore>${escapeXml(donation.donorFirstName)}</Fore>
          <Sur>${escapeXml(donation.donorLastName)}</Sur>
          ${house}
          <Postcode>${escapeXml(donation.donorPostcode)}</Postcode>
          <Sponsored>No</Sponsored>
          <Aggregated>No</Aggregated>
          <Donation>
            <Date>${isoDate(donation.donationDate)}</Date>
            <Total>${formatPounds(donation.grossAmountPence)}</Total>
          </Donation>
        </Donor>`;
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
    // "2023 24" → end is 2024, but "24" might be short-form
    const second = parseInt(parts[1]!, 10);
    endYear = second < 100 ? Math.floor(parseInt(parts[0]!, 10) / 100) * 100 + second : second;
  } else {
    endYear = parseInt(parts[0]!, 10);
  }

  if (isNaN(endYear) || endYear < 2000 || endYear > 2100) {
    // Fallback: current tax year
    const now = new Date();
    endYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    endYear += 1;
  }

  return `${endYear}-04-05`;
}

export function buildR68Xml(input: R68BuildInput): string {
  const { charity, claimReference, periodEnd, donations, isTest, gatewayUsername, gatewayPassword } =
    input;

  if (donations.length === 0) {
    throw new Error("Cannot build R68 XML: no eligible donation records provided.");
  }

  const sortedDates = donations.map((d) => d.donationDate).sort((a, b) => a.getTime() - b.getTime());
  const earliestDate = isoDate(sortedDates[0]!);

  // Year-end is always April 5 per UK tax year
  const periodEndDate = new Date(periodEnd);
  const yearEndDay = periodEndDate.getDate().toString();
  const yearEndMonth = (periodEndDate.getMonth() + 1).toString();

  const donorsXml = donations.map(buildDonorXml).join("");

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
      <GatewayTest>${isTest ? "1" : "0"}</GatewayTest>
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
        <AuthorisedOfficial>
          <Title>${escapeXml(charity.authorisedOfficialTitle)}</Title>
          <Fore>${escapeXml(charity.authorisedOfficialForename)}</Fore>
          <Sur>${escapeXml(charity.authorisedOfficialSurname)}</Sur>
          <Phone>${escapeXml(charity.authorisedOfficialPhone)}</Phone>
        </AuthorisedOfficial>
        <YearEnd Day="${yearEndDay}" Month="${yearEndMonth}"/>
        <Repayment>
          <EarliestGADonationDate>${earliestDate}</EarliestGADonationDate>
          <GAD>${donorsXml}
          </GAD>
        </Repayment>
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

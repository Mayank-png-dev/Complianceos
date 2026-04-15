const axios = require("axios");

const GST_PUBLIC_API_BASE_URL = "https://sheet.gstincheck.cakart.in/checkgstin";

const isValidGSTIN = (gstin) => {
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  return regex.test(gstin);
};

const parseState = (data) =>
  data.pradr?.addr?.st ||
  data.pradr?.addr?.stcd ||
  data.state ||
  data.stj ||
  data.ctj ||
  "";

const parseBusinessName = (data) =>
  data.lgnm || data.tradeNam || data.tradeName || data.businessName || "";

const parseGSTType = (data) =>
  data.dty || data.gstType || data.taxpayerType || "";

const parseRegistrationDate = (data) =>
  data.rgdt || data.registrationDate || "";

const fetchFromPublic = async (gstin) => {
  const url = `${GST_PUBLIC_API_BASE_URL}/${gstin}`;

  console.log("[GST] Fetching GSTIN from public API:", gstin);

  try {
    const response = await axios.get(url, {
      timeout: 15000,
    });

    console.log("[GST] Raw API response:", response.data);

    const data = response.data;

    if (!data || data.flag === false) {
      throw new Error("Invalid GSTIN or no data returned");
    }

    const parsed = {
      businessName: parseBusinessName(data),
      gstType: parseGSTType(data),
      state: parseState(data),
      registrationDate: parseRegistrationDate(data),
      dataSource: "live_basic",
    };

    if (!parsed.businessName) {
      throw new Error("Public API response missing business name");
    }

    return parsed;
  } catch (error) {
    console.error("[GST] External API failure:", error.message);
    throw error;
  }
};

const generateMock = (gstin) => {
  const stateCode = gstin.slice(0, 2);
  const pan = gstin.slice(2, 12);

  return {
    businessName: `Demo Business ${pan}`,
    gstType: "Regular",
    state: stateCode,
    registrationDate: "2020-01-01",
    dataSource: "mock",
  };
};

const getGSTINData = async (gstin) => {
  const normalizedGstin = gstin?.trim().toUpperCase();

  console.log("[GST] Requested GSTIN:", normalizedGstin);

  if (!isValidGSTIN(normalizedGstin)) {
    throw new Error("Invalid GSTIN format");
  }

  try {
    const liveData = await fetchFromPublic(normalizedGstin);
    console.log("[GST] Using live GST data for:", normalizedGstin);
    return liveData;
  } catch (error) {
    console.warn("[GST] Public API failed:", error.message);
    console.warn("[GST] Falling back to mock GST data for:", normalizedGstin);
    return generateMock(normalizedGstin);
  }
};

module.exports = { getGSTINData };

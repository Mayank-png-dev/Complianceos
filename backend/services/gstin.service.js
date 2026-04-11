const axios = require("axios");

const GST_USE_MOCK = process.env.GST_USE_MOCK === "true";
const GST_CACHE_TTL_MS = Number(process.env.GST_CACHE_TTL_MS || 24 * 60 * 60 * 1000);
const GST_FALLBACK_TO_MOCK = process.env.GST_FALLBACK_TO_MOCK !== "false";

const PRIMARY_AUTH_URL =
  process.env.GST_PRIMARY_AUTH_URL || "https://api.primary-demo.com/authenticate";
const PRIMARY_SEARCH_URL =
  process.env.GST_PRIMARY_SEARCH_URL || "https://api.primary-demo.com/gstin/search";
const SECONDARY_AUTH_URL =
  process.env.GST_SECONDARY_AUTH_URL || "https://api.secondary-demo.com/authenticate";
const SECONDARY_SEARCH_URL =
  process.env.GST_SECONDARY_SEARCH_URL || "https://api.secondary-demo.com/gstin/search";

const memoryCache = new Map();

let primaryAccessToken = null;
let secondaryAccessToken = null;

const STATE_DETAILS = {
  "01": { name: "Jammu and Kashmir", city: "Srinagar", pin: "190001" },
  "02": { name: "Himachal Pradesh", city: "Shimla", pin: "171001" },
  "03": { name: "Punjab", city: "Ludhiana", pin: "141001" },
  "04": { name: "Chandigarh", city: "Chandigarh", pin: "160017" },
  "05": { name: "Uttarakhand", city: "Dehradun", pin: "248001" },
  "06": { name: "Haryana", city: "Gurugram", pin: "122001" },
  "07": { name: "Delhi", city: "New Delhi", pin: "110001" },
  "08": { name: "Rajasthan", city: "Jaipur", pin: "302001" },
  "09": { name: "Uttar Pradesh", city: "Lucknow", pin: "226001" },
  "10": { name: "Bihar", city: "Patna", pin: "800001" },
  "11": { name: "Sikkim", city: "Gangtok", pin: "737101" },
  "12": { name: "Arunachal Pradesh", city: "Itanagar", pin: "791111" },
  "13": { name: "Nagaland", city: "Dimapur", pin: "797112" },
  "14": { name: "Manipur", city: "Imphal", pin: "795001" },
  "15": { name: "Mizoram", city: "Aizawl", pin: "796001" },
  "16": { name: "Tripura", city: "Agartala", pin: "799001" },
  "17": { name: "Meghalaya", city: "Shillong", pin: "793001" },
  "18": { name: "Assam", city: "Guwahati", pin: "781001" },
  "19": { name: "West Bengal", city: "Kolkata", pin: "700001" },
  "20": { name: "Jharkhand", city: "Ranchi", pin: "834001" },
  "21": { name: "Odisha", city: "Bhubaneswar", pin: "751001" },
  "22": { name: "Chhattisgarh", city: "Raipur", pin: "492001" },
  "23": { name: "Madhya Pradesh", city: "Indore", pin: "452001" },
  "24": { name: "Gujarat", city: "Ahmedabad", pin: "380001" },
  "25": { name: "Daman and Diu", city: "Daman", pin: "396210" },
  "26": { name: "Dadra and Nagar Haveli and Daman and Diu", city: "Silvassa", pin: "396230" },
  "27": { name: "Maharashtra", city: "Mumbai", pin: "400001" },
  "28": { name: "Andhra Pradesh", city: "Visakhapatnam", pin: "530001" },
  "29": { name: "Karnataka", city: "Bengaluru", pin: "560001" },
  "30": { name: "Goa", city: "Panaji", pin: "403001" },
  "31": { name: "Lakshadweep", city: "Kavaratti", pin: "682555" },
  "32": { name: "Kerala", city: "Kochi", pin: "682001" },
  "33": { name: "Tamil Nadu", city: "Chennai", pin: "600001" },
  "34": { name: "Puducherry", city: "Puducherry", pin: "605001" },
  "35": { name: "Andaman and Nicobar Islands", city: "Port Blair", pin: "744101" },
  "36": { name: "Telangana", city: "Hyderabad", pin: "500001" },
  "37": { name: "Andhra Pradesh", city: "Vijayawada", pin: "520001" },
  "38": { name: "Ladakh", city: "Leh", pin: "194101" },
  "97": { name: "Other Territory", city: "New Delhi", pin: "110001" },
  "99": { name: "Centre Jurisdiction", city: "New Delhi", pin: "110001" },
};

const ENTITY_DETAILS = {
  C: {
    constitution: "Company",
    taxpayerType: "Regular",
    legalSuffix: "Private Limited",
    tradeSuffix: "Industries",
    businessActivities: ["Wholesale Business", "Service Provider"],
  },
  F: {
    constitution: "Partnership Firm",
    taxpayerType: "Regular",
    legalSuffix: "Partners LLP",
    tradeSuffix: "Trading Co",
    businessActivities: ["Retail Business", "Works Contract"],
  },
  H: {
    constitution: "HUF",
    taxpayerType: "Regular",
    legalSuffix: "HUF",
    tradeSuffix: "Family Traders",
    businessActivities: ["Retail Business"],
  },
  L: {
    constitution: "Local Authority",
    taxpayerType: "Regular",
    legalSuffix: "Municipal Services",
    tradeSuffix: "Civic Supply Unit",
    businessActivities: ["Government Department"],
  },
  P: {
    constitution: "Individual",
    taxpayerType: "Regular",
    legalSuffix: "Enterprises",
    tradeSuffix: "Consultancy",
    businessActivities: ["Service Provider"],
  },
  T: {
    constitution: "Trust",
    taxpayerType: "Regular",
    legalSuffix: "Charitable Trust",
    tradeSuffix: "Foundation Services",
    businessActivities: ["Service Provider", "Recipient of Goods or Services"],
  },
  A: {
    constitution: "Association of Persons",
    taxpayerType: "Regular",
    legalSuffix: "Association",
    tradeSuffix: "Business Network",
    businessActivities: ["Retail Business", "Service Provider"],
  },
  G: {
    constitution: "Government Department",
    taxpayerType: "Tax Deductor",
    legalSuffix: "Department",
    tradeSuffix: "Government Unit",
    businessActivities: ["Tax Deductor"],
  },
  J: {
    constitution: "Artificial Juridical Person",
    taxpayerType: "Regular",
    legalSuffix: "Legal Entity",
    tradeSuffix: "Corporate Desk",
    businessActivities: ["Service Provider"],
  },
};

const getStateDetails = (stateCode) =>
  STATE_DETAILS[stateCode] || { name: "Demo State", city: "Demo City", pin: "400001" };

const getEntityDetails = (pan) =>
  ENTITY_DETAILS[pan[3]] || {
    constitution: "Proprietorship",
    taxpayerType: "Regular",
    legalSuffix: "Enterprises",
    tradeSuffix: "Solutions",
    businessActivities: ["Retail Business", "Service Provider"],
  };

const getRegistrationDate = (gstin) => {
  const year = 2018 + (gstin.charCodeAt(12) % 7);
  const month = ((gstin.charCodeAt(13) % 12) + 1).toString().padStart(2, "0");
  const day = ((gstin.charCodeAt(14) % 27) + 1).toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getBusinessStatus = (gstin) => {
  const code = gstin.charCodeAt(13) % 10;

  if (code === 0) {
    return "Cancelled";
  }

  if (code <= 2) {
    return "Suspended";
  }

  return "Active";
};

const getFilingStatus = (gstin, taxpayerType, status) => {
  if (status === "Cancelled") {
    return {
      gstr1: "Not Filed",
      gstr3b: "Not Filed",
      last_filed_period: "2024-12",
      filing_frequency: "Quarterly",
    };
  }

  if (taxpayerType === "Tax Deductor") {
    return {
      gstr7: "Filed",
      last_filed_period: "2026-03",
      filing_frequency: "Monthly",
    };
  }

  const filingMode = gstin.charCodeAt(10) % 2 === 0 ? "Monthly" : "Quarterly";

  return {
    gstr1: "Filed",
    gstr3b: status === "Suspended" ? "Late" : "Filed",
    last_filed_period: status === "Suspended" ? "2026-02" : "2026-03",
    filing_frequency: filingMode,
  };
};

const buildMockGSTINData = (gstin, overrides = {}) => {
  const stateCode = gstin.slice(0, 2);
  const pan = gstin.slice(2, 12);
  const state = getStateDetails(stateCode);
  const entity = getEntityDetails(pan);
  const status = getBusinessStatus(gstin);
  const registrationDate = getRegistrationDate(gstin);
  const filingStatus = getFilingStatus(gstin, entity.taxpayerType, status);
  const nameSeed = pan.slice(0, 5);

  return {
    gstin,
    legal_name: `${nameSeed} ${entity.legalSuffix}`,
    trade_name: `${state.city} ${entity.tradeSuffix}`,
    registration_date: registrationDate,
    constitution_of_business: entity.constitution,
    taxpayer_type: entity.taxpayerType,
    status,
    pan_number: pan,
    state_code: stateCode,
    state_name: state.name,
    principal_place_address: `Unit ${gstin[12]}, ${state.city} Business Park, ${state.city}, ${state.name}, ${state.pin}`,
    nature_of_business_activities: entity.businessActivities,
    filing_status: filingStatus,
    meta: {
      source: "mock",
      stale: false,
      fetched_at: new Date().toISOString(),
    },
    ...overrides,
  };
};

const createStructuredResponse = (data, meta = {}) => ({
  ...data,
  meta: {
    source: meta.source || "unknown",
    stale: Boolean(meta.stale),
    fetched_at: meta.fetchedAt || new Date().toISOString(),
    note: meta.note || null,
  },
});

const getFromCache = async (gstin) => {
  const cachedRecord = memoryCache.get(gstin);

  if (!cachedRecord) {
    return null;
  }

  const isFresh = Date.now() - cachedRecord.updatedAt < GST_CACHE_TTL_MS;

  if (!isFresh) {
    return null;
  }

  return createStructuredResponse(cachedRecord.data, {
    source: "cache",
    stale: false,
    fetchedAt: new Date(cachedRecord.updatedAt).toISOString(),
  });
};

const saveToCache = async (gstin, data) => {
  memoryCache.set(gstin, {
    data,
    updatedAt: Date.now(),
  });
};

const getFromDatabase = async (gstin) => {
  void gstin;

  // Placeholder for MongoDB or another persistent store.
  // Example next step:
  // return await GstinCacheModel.findOne({ gstin }).lean();
  return null;
};

const saveToDatabase = async (gstin, data) => {
  void gstin;
  void data;

  // Placeholder for MongoDB or another persistent store.
  // Example next step:
  // await GstinCacheModel.findOneAndUpdate({ gstin }, { data, updatedAt: new Date() }, { upsert: true });
};

const getStaleDatabaseRecord = async (gstin) => {
  const dbRecord = await getFromDatabase(gstin);

  if (!dbRecord) {
    return null;
  }

  const recordData = dbRecord.data || dbRecord;
  const updatedAt = dbRecord.updatedAt || dbRecord.updated_at || Date.now();

  return createStructuredResponse(recordData, {
    source: "database",
    stale: true,
    fetchedAt: new Date(updatedAt).toISOString(),
    note: "Returning stale GSTIN data because live providers failed.",
  });
};

const getProviderToken = async ({
  authUrl,
  apiKey,
  apiSecret,
  tokenRef,
  providerName,
}) => {
  if (tokenRef.value) {
    return tokenRef.value;
  }

  if (!apiKey || !apiSecret) {
    throw new Error(`${providerName} credentials are missing`);
  }

  const authResponse = await axios.post(
    authUrl,
    {},
    {
      headers: {
        "x-api-key": apiKey,
        "x-api-secret": apiSecret,
        "x-api-version": "2.0",
      },
    }
  );

  const accessToken =
    authResponse.data?.access_token || authResponse.data?.data?.access_token;

  if (!accessToken) {
    throw new Error(`${providerName} authentication failed`);
  }

  tokenRef.value = accessToken;
  return tokenRef.value;
};

const fetchFromProvider = async ({
  gstin,
  providerName,
  authUrl,
  searchUrl,
  apiKey,
  apiSecret,
  tokenRef,
}) => {
  try {
    const accessToken = await getProviderToken({
      authUrl,
      apiKey,
      apiSecret,
      tokenRef,
      providerName,
    });

    const response = await axios.post(
      searchUrl,
      { gstin },
      {
        headers: {
          Authorization: accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    return createStructuredResponse(response.data, {
      source: providerName,
      stale: false,
    });
  } catch (error) {
    if (error.response?.status === 401) {
      tokenRef.value = null;
    }

    const providerError =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.details ||
      error.message;

    throw new Error(`${providerName} failed: ${providerError}`);
  }
};

const fetchFromPrimaryApi = async (gstin) =>
  fetchFromProvider({
    gstin,
    providerName: "primary_api",
    authUrl: PRIMARY_AUTH_URL,
    searchUrl: PRIMARY_SEARCH_URL,
    apiKey: process.env.GST_PRIMARY_API_KEY || process.env.GST_API_KEY,
    apiSecret: process.env.GST_PRIMARY_API_SECRET || process.env.GST_API_SECRET,
    tokenRef: {
      get value() {
        return primaryAccessToken;
      },
      set value(token) {
        primaryAccessToken = token;
      },
    },
  });

const fetchFromSecondaryApi = async (gstin) =>
  fetchFromProvider({
    gstin,
    providerName: "secondary_api",
    authUrl: SECONDARY_AUTH_URL,
    searchUrl: SECONDARY_SEARCH_URL,
    apiKey: process.env.GST_SECONDARY_API_KEY || "demo_secondary_key",
    apiSecret: process.env.GST_SECONDARY_API_SECRET || "demo_secondary_secret",
    tokenRef: {
      get value() {
        return secondaryAccessToken;
      },
      set value(token) {
        secondaryAccessToken = token;
      },
    },
  });

const getGSTINDetails = async (gstin) => {
  if (!gstin) {
    throw new Error("GSTIN is required");
  }

  const normalizedGstin = gstin.trim().toUpperCase();

  if (GST_USE_MOCK) {
    return buildMockGSTINData(normalizedGstin);
  }

  const cachedData = await getFromCache(normalizedGstin);
  if (cachedData) {
    return cachedData;
  }

  try {
    const primaryData = await fetchFromPrimaryApi(normalizedGstin);
    await saveToCache(normalizedGstin, primaryData);
    await saveToDatabase(normalizedGstin, primaryData);
    return primaryData;
  } catch (primaryError) {
    console.error(primaryError.message);
  }

  try {
    const secondaryData = await fetchFromSecondaryApi(normalizedGstin);
    await saveToCache(normalizedGstin, secondaryData);
    await saveToDatabase(normalizedGstin, secondaryData);
    return secondaryData;
  } catch (secondaryError) {
    console.error(secondaryError.message);
  }

  const staleData = await getStaleDatabaseRecord(normalizedGstin);
  if (staleData) {
    return staleData;
  }

  if (GST_FALLBACK_TO_MOCK) {
    return buildMockGSTINData(normalizedGstin, {
      meta: {
        source: "mock",
        stale: false,
        fetched_at: new Date().toISOString(),
        note: "Both APIs failed and no DB record was found. Returning mock data.",
      },
    });
  }

  throw new Error("Unable to fetch GSTIN details");
};

module.exports = { getGSTINDetails };

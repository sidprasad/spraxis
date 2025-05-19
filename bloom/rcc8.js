
export const RCC8Relations = ["DC", "EC", "PO", "EQ", "TPP", "NTPP", "TPPi", "NTPPi"];


// Full RCC8 composition table
export const RCC8CompositionTable = {
  DC: {
    DC: ["DC"],
    EC: ["DC", "EC"],
    PO: ["DC", "PO"],
    EQ: ["DC"],
    TPP: ["DC"],
    NTPP: ["DC"],
    TPPi: ["DC"],
    NTPPi: ["DC"]
  },
  EC: {
    DC: ["DC", "EC"],
    EC: ["DC", "EC", "PO"],
    PO: ["EC", "PO"],
    EQ: ["EC"],
    TPP: ["EC"],
    NTPP: ["EC"],
    TPPi: ["EC"],
    NTPPi: ["EC"]
  },
  PO: {
    DC: ["DC", "PO"],
    EC: ["EC", "PO"],
    PO: ["DC", "EC", "PO", "TPP", "NTPP", "TPPi", "NTPPi"],
    EQ: ["PO"],
    TPP: ["PO", "TPP", "NTPP"],
    NTPP: ["PO", "NTPP"],
    TPPi: ["PO", "TPPi", "NTPPi"],
    NTPPi: ["PO", "NTPPi"]
  },
  EQ: {
    DC: ["DC"],
    EC: ["EC"],
    PO: ["PO"],
    EQ: ["EQ"],
    TPP: ["TPP"],
    NTPP: ["NTPP"],
    TPPi: ["TPPi"],
    NTPPi: ["NTPPi"]
  },
  TPP: {
    DC: ["DC"],
    EC: ["EC"],
    PO: ["PO", "TPP", "NTPP"],
    EQ: ["TPP"],
    TPP: ["TPP", "NTPP"],
    NTPP: ["NTPP"],
    TPPi: ["PO", "TPP", "NTPP"],
    NTPPi: ["PO", "NTPP"]
  },
  NTPP: {
    DC: ["DC"],
    EC: ["EC"],
    PO: ["PO", "NTPP"],
    EQ: ["NTPP"],
    TPP: ["NTPP"],
    NTPP: ["NTPP"],
    TPPi: ["PO", "NTPP"],
    NTPPi: ["PO", "NTPP"]
  },
  TPPi: {
    DC: ["DC"],
    EC: ["EC"],
    PO: ["PO", "TPPi", "NTPPi"],
    EQ: ["TPPi"],
    TPP: ["PO", "TPPi", "NTPPi"],
    NTPP: ["PO", "NTPPi"],
    TPPi: ["TPPi", "NTPPi"],
    NTPPi: ["NTPPi"]
  },
  NTPPi: {
    DC: ["DC"],
    EC: ["EC"],
    PO: ["PO", "NTPPi"],
    EQ: ["NTPPi"],
    TPP: ["PO", "NTPPi"],
    NTPP: ["PO", "NTPPi"],
    TPPi: ["NTPPi"],
    NTPPi: ["NTPPi"]
  }
};
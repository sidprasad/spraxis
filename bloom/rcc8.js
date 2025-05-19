
const DC = "DC"; // Disconnected
const EC = "EC"; // Externally Connected
const PO = "PO"; // Partial Overlap
const EQ = "EQ"; // Equal
const TPP = "TPP"; // Tangential Proper Part
const NTPP = "NTPP"; // Non-Tangential Proper Part
const TPPi = "TPPi"; // Tangential Proper Part inverse
const NTPPi = "NTPPi"; // Non-Tangential Proper Part inverse

export const RCC8Relations = [
  DC,
  EC,
  PO,
  EQ,
  TPP,
  NTPP,
  TPPi,
  NTPPi
];


export function converseRelation(relation) {
  switch (relation) {
    case DC: return DC;
    case EC: return EC;
    case PO: return PO;
    case EQ: return EQ;
    case TPP: return TPPi;
    case NTPP: return NTPPi;
    case TPPi: return TPP;
    case NTPPi: return NTPP;
    default: throw new Error(`Unknown relation: ${relation}`);
  }
}

// Full RCC8 composition table
export const RCC8CompositionTable = {
  DC: {
    DC: RCC8Relations,
    EC: [DC, EC, PO, TPP, NTPP],
    PO: [DC, EC, PO, TPP, NTPP],
    TPP: [DC, EC, PO, TPP, NTPP],
    NTPP: [DC, EC, PO, TPP, NTPP],
    TPPi : [DC],
    NTPPi: [DC],
    EQ: [DC]
  },
  EC : {
    DC: [DC, EC, PO, TPPi, NTPPi],
    EC: [DC, EC, PO, TPP, TPPi, EQ	],
    PO: [DC, EC, PO, TPP, NTPP	],
    TPP: [EC, PO, TPP, NTPP	],
    NTPP: [PO, TPP, NTPP	],
    TPPi : [DC, EC	],
    NTPPi: [DC],
    EQ: [EC]
  },
  PO : {
    DC: [DC, EC, PO, TPPi, NTPPi	],
    EC: [DC, EC, PO, TPPi, NTPPi	],
    PO: RCC8Relations,
    TPP: [PO, TPP, NTPP	],
    NTPP: [PO, TPP, NTPP	],
    TPPi : [DC, EC, PO, TPPi, NTPPi	],
    NTPPi: [DC, EC, PO, TPPi, NTPPi	],
    EQ: [PO]
  },
  TPP : {
    DC: [DC],
    EC: [DC, EC	],
    PO: [DC, EC, PO, TPP, NTPP	],
    TPP: [TPP, NTPP	],
    NTPP: [NTPP],
    TPPi : [DC, EC, PO, TPP, TPPi, EQ	],
    EQ: [TPP],
    NTPPi: [DC, EC, PO, TPPi, NTPPi	]
  },
  NTPP : {
    DC: [DC],
    EC: [DC],
    PO: [DC, EC, PO, TPP, NTPP	],
    TPP: [NTPP],
    NTPP: [NTPP],
    TPPi : [DC, EC, PO, TPP, NTPP	],
    NTPPi: RCC8Relations,
    EQ: [NTPP]
  },
  TPPi : {
    DC: [DC, EC, PO, TPPi, NTPPi	],
    EC: [EC, PO, TPPi, NTPPi	],
    PO: [PO, TPPi, NTPPi	],
    TPP: [PO, TPP, TPPi, EQ	],
    NTPP: [PO, TPP, NTPP	],
    TPPi : [TPPi, NTPPi	],
    NTPPi: [NTPPi],
    EQ: [TPPi]
  },
  NTPPi : {
    DC: [DC, EC, PO, TPPi, NTPPi	],
    EC: [PO, TPPi, NTPPi	],
    PO: [PO, TPPi, NTPPi	],
    TPP: [PO, TPPi, NTPPi	],
    NTPP: [PO, TPP, NTPP, TPPi, NTPPi, EQ	],
    TPPi : [NTPPi	],
    NTPPi: [NTPPi],
    EQ: [NTPPi]
  },
  EQ : {
    DC: [DC],
    EC: [EC],
    PO: [PO],
    TPP: [TPP],
    NTPP: [NTPP],
    TPPi : [TPPi ],
    NTPPi: [NTPPi],
    EQ: [EQ]
  }
  
};
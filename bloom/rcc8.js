const DC = "DC"; // Disconnected
const EC = "EC"; // Externally Connected
const PO = "PO"; // Partial Overlap
const EQ = "EQ"; // Equal
const TPP = "TPP"; // Tangential Proper Part
const NTPP = "NTPP"; // Non-Tangential Proper Part
const TPPi = "TPPi"; // Tangential Proper Part inverse
const NTPPi = "NTPPi"; // Non-Tangential Proper Part inverse

const RCC8Relations = [
  DC,
  EC,
  PO,
  EQ,
  TPP,
  NTPP,
  TPPi,
  NTPPi
];


// Full RCC8 composition table
export const RCC8CompositionTable = {
  DC: {
    DC: RCC8Relations,
    EC: [DC, EC, PO, TPP, NTPP],
    PO: [DC, EC, PO, TPP, NTPP],
    TPP: [DC, EC, PO, TPP, NTPP],
    NTPP: [DC, EC, PO, TPP, NTPP],
    TPPi: [DC],
    NTPPi: [DC],
    EQ: [DC]
  },
  EC: {
    DC: [DC, EC, PO, TPPi, NTPPi],
    EC: [DC, EC, PO, TPP, TPPi, EQ],
    PO: [DC, EC, PO, TPP, NTPP],
    TPP: [EC, PO, TPP, NTPP],
    NTPP: [PO, TPP, NTPP],
    TPPi: [DC, EC],
    NTPPi: [DC],
    EQ: [EC]
  },
  PO: {
    DC: [DC, EC, PO, TPPi, NTPPi],
    EC: [DC, EC, PO, TPPi, NTPPi],
    PO: RCC8Relations,
    TPP: [PO, TPP, NTPP],
    NTPP: [PO, TPP, NTPP],
    TPPi: [DC, EC, PO, TPPi, NTPPi],
    NTPPi: [DC, EC, PO, TPPi, NTPPi],
    EQ: [PO]
  },
  TPP: {
    DC: [DC],
    EC: [DC, EC],
    PO: [DC, EC, PO, TPP, NTPP],
    TPP: [TPP, NTPP],
    NTPP: [NTPP],
    TPPi: [DC, EC, PO, TPP, TPPi, EQ],
    EQ: [TPP],
    NTPPi: [DC, EC, PO, TPPi, NTPPi]
  },
  NTPP: {
    DC: [DC],
    EC: [DC],
    PO: [DC, EC, PO, TPP, NTPP],
    TPP: [NTPP],
    NTPP: [NTPP],
    TPPi: [DC, EC, PO, TPP, NTPP],
    NTPPi: RCC8Relations,
    EQ: [NTPP]
  },
  TPPi: {
    DC: [DC, EC, PO, TPPi, NTPPi],
    EC: [EC, PO, TPPi, NTPPi],
    PO: [PO, TPPi, NTPPi],
    TPP: [PO, TPP, TPPi, EQ],
    NTPP: [PO, TPP, NTPP],
    TPPi: [TPPi, NTPPi],
    NTPPi: [NTPPi],
    EQ: [TPPi]
  },
  NTPPi: {
    DC: [DC, EC, PO, TPPi, NTPPi],
    EC: [PO, TPPi, NTPPi],
    PO: [PO, TPPi, NTPPi],
    TPP: [PO, TPPi, NTPPi],
    NTPP: [PO, TPP, NTPP, TPPi, NTPPi, EQ],
    TPPi: [NTPPi],
    NTPPi: [NTPPi],
    EQ: [NTPPi]
  },
  EQ: {
    DC: [DC],
    EC: [EC],
    PO: [PO],
    TPP: [TPP],
    NTPP: [NTPP],
    TPPi: [TPPi],
    NTPPi: [NTPPi],
    EQ: [EQ]
  }

};

export class RCC8Utility {


  spec;
  regions;
  relations;

  constructor(spec) {
    this.spec = spec;
    let { regions, relations } = this.parseSpec();
    this.regions = regions;
    this.relations = relations;
  }


  static getRelations() {
    return RCC8Relations;
  }

  static getCompositionTable() {
    return RCC8CompositionTable;
  }

  static getConverseRelation(relation) {
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


  parseSpec() {
    const regions = new Set();
    const relations = [];
    const lines = this.spec.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Region declaration: Region a,b,c
      const regionMatch = trimmed.match(/^Region\s+(.+)$/i);
      if (regionMatch) {
        regionMatch[1].split(",").map(s => s.trim()).forEach(r => {
          if (r) regions.add(r);
        });
        continue;
      }

      // Relation: {DC, PO, TPP}(a, b) or DC(a, b)
      const relMatch = trimmed.match(/^(\{[^}]+\}|\w+)\(([^,]+),\s*([^)]+)\)$/);
      if (relMatch) {
        let rels;
        if (relMatch[1].startsWith("{")) {
          rels = relMatch[1].slice(1, -1).split(",").map(r => r.trim()).filter(r => RCC8Relations.includes(r));
        } else {
          rels = [relMatch[1]];
        }
        const a = relMatch[2].trim();
        const b = relMatch[3].trim();
        relations.push({ a, b, rels });
        regions.add(a);
        regions.add(b);
      }
    }
    return { regions: Array.from(regions), relations };
  }



}






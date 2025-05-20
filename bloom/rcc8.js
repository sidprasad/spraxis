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

// 1. RCC8 conceptual neighborhood graph (adjacency list)
export const RCC8CNG = {
  DC: [EC],
  EC: [DC, PO],
  PO: [EC, TPP, NTPP, TPPi, NTPPi],
  TPP: [PO, EQ],
  NTPP: [PO, EQ],
  TPPi: [PO, EQ],
  NTPPi: [PO, EQ],
  EQ: [TPP, NTPP, TPPi, NTPPi]
};


//// Regions ///
// Singletons [DC], [EC], [PO], [TPP], [NTPP], [TPPi], [NTPPi], [EQ]
// Connected pairs
// [DC, EC]
// [EC, PO]
// [PO, TPP]
// [PO, NTPP]
// [PO, TPPi]
// [PO, NTPPi]
// [TPP, EQ]
// [NTPP, EQ]
// [TPPi, EQ]
// [NTPPi, EQ]


// Adjacent Triads
// [DC, EC, PO]
// [EC, PO, TPP]
// [EC, PO, NTPP]
// [EC, PO, TPPi]
// [EC, PO, NTPPi]
// [PO, TPP, EQ]
// [PO, NTPP, EQ]
// [PO, TPPi, EQ]
// [PO, NTPPi, EQ]
// [TPP, EQ, NTPP]
// [NTPPi, EQ, TPPi]

// Central Region
// [PO, TPP, NTPP, TPPi, NTPPi, EQ] 

// Univ
// DC, EC, PO, TPP, NTPP, TPPi, NTPPi, EQ]














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




  static getAllRCC8Relations() {
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
    const relations = {};
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
        if (!relations[a]) relations[a] = {};
        relations[a][b] = rels;
        regions.add(a);
        regions.add(b);
      }
    }
    return { regions: Array.from(regions), relations };
  }



  // Check if the relations are consistent
  isConsistent() {
    // 1. Initialize the constraint network (deep copy)
    const regions = this.regions;
    const input = this.relations;
    const allRels = RCC8Relations;
    // Build full matrix: constraints[a][b] = array of allowed relations
    const constraints = {};
    for (const a of regions) {
      constraints[a] = {};
      for (const b of regions) {
        if (a === b) {
          constraints[a][b] = ["EQ"];
        } else if (input[a] && input[a][b]) {
          constraints[a][b] = [...input[a][b]];
        } else {
          constraints[a][b] = [...allRels];
        }
      }
    }

    // 2. Path consistency
    let changed = true;
    while (changed) {
      changed = false;
      for (const i of regions) {
        for (const j of regions) {
          for (const k of regions) {
            if (i === j || j === k || i === k) continue;
            const rel_ij = constraints[i][j];
            const rel_jk = constraints[j][k];
            const rel_ik = constraints[i][k];

            // Compose rel_ij and rel_jk
            let possible = new Set();
            for (const r1 of rel_ij) {
              for (const r2 of rel_jk) {
                const comp = RCC8CompositionTable[r1][r2] || allRels;
                for (const r of comp) possible.add(r);
              }
            }
            // Intersect with current rel_ik
            const newRel_ik = rel_ik.filter(r => possible.has(r));
            if (newRel_ik.length === 0) {
              // Inconsistency found
              return {
                consistent: false,
                culprit: { i, j, k },
                message: `Inconsistency: (${i},${j}) ∈ {${rel_ij.join(',')}}; (${j},${k}) ∈ {${rel_jk.join(',')}}; (${i},${k}) became empty`
              };
            }
            if (newRel_ik.length < rel_ik.length) {
              constraints[i][k] = newRel_ik;
              changed = true;
            }
          }
        }
      }
    }

    // 3. Return refined constraints if consistent
    return {
      consistent: true,
      refined: constraints
    };
  }



  isContiguousRCC8Set(rels) {
    if (rels.length <= 1) return true;
    const relSet = new Set(rels);
    // BFS from first relation
    const queue = [rels[0]];
    const visited = new Set([rels[0]]);
    while (queue.length > 0) {
      const curr = queue.shift();
      for (const neighbor of RCC8CNG[curr] || []) {
        if (relSet.has(neighbor) && !visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    // If all rels are visited, the set is connected
    return rels.every(r => visited.has(r));
  }

  /**
   * I hope:
   * @returns This will always return the partition into maximal contiguous sets, with no subsumed sets.
   *  
   */
partitionIntoContiguousSets(rels) {
  if (rels.length <= 1) return [rels.slice()];
  const relSet = new Set(rels);
  const visited = new Set();
  const components = [];
  for (const rel of rels) {
    if (visited.has(rel)) continue;
    // BFS for this component
    const queue = [rel];
    const component = [];
    visited.add(rel);
    while (queue.length > 0) {
      const curr = queue.shift();
      component.push(curr);
      for (const neighbor of RCC8CNG[curr] || []) {
        if (relSet.has(neighbor) && !visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    components.push(component);
  }

  

  return components;
}

}






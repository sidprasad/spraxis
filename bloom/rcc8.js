// RCC6 base relations
export const DC = "DC";    // Disconnected
export const EC = "EC";    // Externally Connected
export const PO = "PO";    // Partial Overlap
export const TPP = "TPP";  // Tangential Proper Part
export const NTPP = "NTPP";// Non-Tangential Proper Part
export const EQ = "EQ";    // Equal

export const RCC6Relations = [DC, EC, PO, TPP, NTPP, EQ];

// RCC6 conceptual neighborhood graph (adjacency list)
export const RCC6CNG = {
  DC:   [EC],
  EC:   [DC, PO],
  PO:   [EC, TPP],
  TPP:  [PO, EQ],
  NTPP: [EQ],
  EQ:   [TPP, NTPP]
};

// RCC6 composition table (standard)
export const RCC6CompositionTable = {
  DC: {
    DC: RCC6Relations,
    EC: [DC, EC, PO, TPP, NTPP],
    PO: [DC, EC, PO, TPP, NTPP],
    TPP: [DC, EC, PO, TPP, NTPP],
    NTPP: [DC, EC, PO, TPP, NTPP],
    EQ: [DC]
  },
  EC: {
    DC: [DC, EC, PO],
    EC: [DC, EC, PO, TPP, EQ],
    PO: [DC, EC, PO, TPP, NTPP],
    TPP: [EC, PO, TPP, NTPP],
    NTPP: [PO, TPP, NTPP],
    EQ: [EC]
  },
  PO: {
    DC: [DC, EC, PO],
    EC: [DC, EC, PO],
    PO: RCC6Relations,
    TPP: [PO, TPP, NTPP],
    NTPP: [PO, TPP, NTPP],
    EQ: [PO]
  },
  TPP: {
    DC: [DC],
    EC: [DC, EC],
    PO: [DC, EC, PO, TPP, NTPP],
    TPP: [TPP, NTPP],
    NTPP: [NTPP],
    EQ: [TPP]
  },
  NTPP: {
    DC: [DC],
    EC: [DC],
    PO: [DC, EC, PO, TPP, NTPP],
    TPP: [NTPP],
    NTPP: [NTPP],
    EQ: [NTPP]
  },
  EQ: {
    DC: [DC],
    EC: [EC],
    PO: [PO],
    TPP: [TPP],
    NTPP: [NTPP],
    EQ: [EQ]
  }
};

function setKey(rels) {
  // rels: Array or Set of relation strings
  return Array.from(rels).sort().join(",");
}





function equalSets(setA, setB) {
    if (setA.size !== setB.size) return false;
    for (const item of setA) {
        if (!setB.has(item)) return false;
    }
    return true;
}


function getAreaName(rels) {


    let relsSet = new Set(rels);



    // If the relation set has length 1, return the name of that relation
    if (rels.length === 1) {
        return rels[0];
    }

    if (relse.size == 2) {
     
     
     
      new Set([DC, EC]) 
  [EC, PO]
  [PO, TPP]
  [PO, NTPP]
  [TPP, EQ]
  [NTPP, EQ],
    }




}






export class RCC6Utility {
  spec;
  regions;
  relations;

  constructor(spec) {
    this.spec = spec;
    let { regions, relations } = this.parseSpec();
    this.regions = regions;
    this.relations = relations;
  }

  static getAllRCC6Relations() {
    return RCC6Relations;
  }

  static getCompositionTable() {
    return RCC6CompositionTable;
  }

  static getConverseRelation(relation) {
    // In RCC6, TPP and NTPP are not distinguished by direction, so converse is itself
    switch (relation) {
      case DC: return DC;
      case EC: return EC;
      case PO: return PO;
      case EQ: return EQ;
      case TPP: return TPP;
      case NTPP: return NTPP;
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
          rels = relMatch[1].slice(1, -1).split(",").map(r => r.trim()).filter(r => RCC6Relations.includes(r));
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

  // Path consistency
  isConsistent() {
    const regions = this.regions;
    const input = this.relations;
    const allRels = RCC6Relations;
    const constraints = {};
    for (const a of regions) {
      constraints[a] = {};
      for (const b of regions) {
        if (a === b) {
          constraints[a][b] = [EQ];
        } else if (input[a] && input[a][b]) {
          constraints[a][b] = [...input[a][b]];
        } else {
          constraints[a][b] = [...allRels];
        }
      }
    }

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

            let possible = new Set();
            for (const r1 of rel_ij) {
              for (const r2 of rel_jk) {
                const comp = RCC6CompositionTable[r1][r2] || allRels;
                for (const r of comp) possible.add(r);
              }
            }
            const newRel_ik = rel_ik.filter(r => possible.has(r));
            if (newRel_ik.length === 0) {
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
    return {
      consistent: true,
      refined: constraints
    };
  }

  // Check if a set of relations is contiguous in the RCC6 CNG
  isContiguousRCC6Set(rels) {
    if (rels.length <= 1) return true;
    const relSet = new Set(rels);
    const queue = [rels[0]];
    const visited = new Set([rels[0]]);
    while (queue.length > 0) {
      const curr = queue.shift();
      for (const neighbor of RCC6CNG[curr] || []) {
        if (relSet.has(neighbor) && !visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return rels.every(r => visited.has(r));
  }

  // Partition a set of relations into maximal contiguous sets
  partitionIntoContiguousSets(rels) {
    if (rels.length <= 1) return [rels.slice()];
    const relSet = new Set(rels);
    const visited = new Set();
    const components = [];
    for (const rel of rels) {
      if (visited.has(rel)) continue;
      const queue = [rel];
      const component = [];
      visited.add(rel);
      while (queue.length > 0) {
        const curr = queue.shift();
        component.push(curr);
        for (const neighbor of RCC6CNG[curr] || []) {
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

  // Collapse a set of relations to a canonical area name if possible
  static canonicalAreaName(rels) {
    return canonicalRCC6Area(rels);
  }
}






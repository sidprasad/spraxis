import {checkPathConsistency} from "./reasoner.js";



// RCC6 base relations
export const DC = "DC";    // Disconnected
export const EC = "EC";    // Externally Connected
export const PO = "PO";    // Partial Overlap
export const TPP = "TPP";  // Tangential Proper Part
export const NTPP = "NTPP";// Non-Tangential Proper Part
export const EQ = "EQ";    // Equal
export const TPPi = "TPPi"; // Tangential Proper Part inverse
export const NTPPi = "NTPPi"; // Non-Tangential Proper Part inverse

export const RCC8Relations = [DC, EC, PO, TPP, NTPP, EQ, NTPPi, TPPi];


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






  /**
   * @param {string} spec - The RCC8 specification string. Disjunctions are separated by "|". Conjunctions are newline-separated.
   * 
   * Example: 
   * Region A, B, C
   * EC(A, B) | DC(B, C) | PO(A, C)
   * PO(A,B)
   * 
   * @returns  {Object} {regions - Array of region names (e.g., ["A", "B", "C"]), 
   *                relations - Object mapping region pairs to arrays of possible RCC8 relations.
   *                Example: { A: { B: ["DC"] }, B: { C: ["EC"] } }
   */
  parseSpec() {
    const regions = new Set();
    const relations = {};

    const lines = this.spec.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Region declaration: Region A, B, C
      const regionMatch = trimmed.match(/^Region\s+(.+)$/i);
      if (regionMatch) {
        regionMatch[1].split(",").map(s => s.trim()).forEach(r => {
          if (r) regions.add(r);
        });
        continue;
      }

      // Split line on '|', treat each as a disjunctive constraint
      const disjuncts = trimmed.split("|").map(s => s.trim());
      for (const disjunct of disjuncts) {
        // Relation: {DC, PO}(A, B) or DC(A, B)
        const relMatch = disjunct.match(/^(\{[^}]+\}|\w+)\(([^,]+),\s*([^)]+)\)$/);
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
          // If already present, take the union (disjunction) of possible relations
          if (relations[a][b]) {
            relations[a][b] = Array.from(new Set([...relations[a][b], ...rels]));
          } else {
            relations[a][b] = rels;
          }
          regions.add(a);
          regions.add(b);
        }
      }
    }
    return { regions: Array.from(regions), relations };
  }

  checkPathConsistency() {
    const result = checkPathConsistency(this.regions, this.relations);
    return result;
  }




  // TODO: We will get to contiguous regions later.
}






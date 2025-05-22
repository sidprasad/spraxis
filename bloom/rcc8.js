import {checkPathConsistency} from "./reasoner.js";



// RCC6 base relations
export const DC = "DC";    // Disconnected
export const EC = "EC";    // Externally Connected
export const PO = "PO";    // Partial Overlap
export const TPP = "TPP";  // Tangential Proper Part
export const NTPP = "NTPP";// Non-Tangential Proper Part
export const EQ = "EQ";    // Equal
export const TPPi = "TPPI"; // Tangential Proper Part inverse
export const NTPPi = "NTPPI"; // Non-Tangential Proper Part inverse

export const RCC8Relations = [DC, EC, PO, TPP, NTPP, EQ, NTPPi, TPPi];


export class RCC8Utility {
  spec;
  regions;
  relations;

  constructor(spec) {
    this.spec = spec;
    let { regions, relations } = this.parseSpec();


    // TODO: Is this correct? I'm worried things
    // are a little messed up in terms of | vs &.
    console.log("Parsed regions", regions);
    console.log("Parsed relations", relations);


    this.regions = regions;
    this.relations = relations;
  }






  /**
   * @param {string} spec - The RCC8 specification string. Each line is a disjunction for a pair.
   * Example: 
   * Region A, B, C
   * {EC, DC}(A, B)
   * {DC, PO}(B, C)
   * 
   * @returns  {Object} {regions - Array of region names (e.g., ["A", "B", "C"]), 
   *                relations - Object mapping region pairs to arrays of possible RCC8 relations.
   *                Example: { A: { B: ["EC", "DC"] }, B: { C: ["DC", "PO"] } }
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

      // Relation: {EC, DC}(A, B) or DC(A, B)
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

  checkPathConsistency() {
    const result = checkPathConsistency(this.regions, this.relations);
    return result;
  }




  // TODO: We will get to contiguous regions later.
}






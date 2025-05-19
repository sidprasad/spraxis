import { RCC8Relations, RCC8CompositionTable } from "./rcc8.js";

// This checker is WRONG and needs to be fixed.


// --- 1. Set of relations ---
class RelSet {
  constructor(rels) {
    this.rels = new Set(rels);
  }
  intersect(other) {
    return new RelSet([...this.rels].filter(x => other.rels.has(x)));
  }
  equals(other) {
    if (this.rels.size !== other.rels.size) return false;
    for (let r of this.rels) if (!other.rels.has(r)) return false;
    return true;
  }
  isEmpty() {
    return this.rels.size === 0;
  }
  clone() {
    return new RelSet(this.rels);
  }
  toArray() {
    return [...this.rels];
  }
}

// --- 2. EQ class computation ---
function computeEQClasses(regions, relations) {
  const parent = {};
  regions.forEach(r => parent[r] = r);
  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  function union(x, y) {
    parent[find(x)] = find(y);
  }
  for (const { relation, r1, r2 } of relations) {
    if (relation === "EQ") union(r1, r2);
  }
  const rep = {};
  regions.forEach(r => { rep[r] = find(r); });
  return rep;
}

// --- 3. Constraint network ---
class RCC8Network {
  constructor(regions, relations) {
    // Collapse EQ classes
    this.rep = computeEQClasses(regions, relations);
    this.regions = Array.from(new Set(regions.map(r => this.rep[r])));
    // Initialize all pairs to all RCC8 relations
    this.constraints = {};
    for (let a of this.regions) {
      this.constraints[a] = {};
      for (let b of this.regions) {
        this.constraints[a][b] = new RelSet(a === b ? ["EQ"] : RCC8Relations);
      }
    }
    // Set explicit constraints (excluding EQ)
    for (const { relation, r1, r2 } of relations) {
      if (relation === "EQ") continue;
      const a = this.rep[r1], b = this.rep[r2];
      if (a !== b) {
        this.constraints[a][b] = new RelSet([relation]);
        // Set converse for asymmetric relations
        if (relation === "TPP") this.constraints[b][a] = new RelSet(["TPPi"]);
        else if (relation === "TPPi") this.constraints[b][a] = new RelSet(["TPP"]);
        else if (relation === "NTPP") this.constraints[b][a] = new RelSet(["NTPPi"]);
        else if (relation === "NTPPi") this.constraints[b][a] = new RelSet(["NTPP"]);
        else this.constraints[b][a] = new RelSet([relation]);
      }
    }
  }

  // --- 4. Path consistency propagation ---
  propagate() {
    let changed = true;
    while (changed) {
      changed = false;
      for (let i of this.regions) {
        for (let j of this.regions) {
          for (let k of this.regions) {
            if (i === j || j === k || i === k) continue;
            let newSet = new Set();
            for (let r1 of this.constraints[i][j].rels) {
              for (let r2 of this.constraints[j][k].rels) {
                let comp = (RCC8CompositionTable[r1] && RCC8CompositionTable[r1][r2]) || RCC8Relations;
                for (let r of comp) newSet.add(r);
              }
            }
            const newRelSet = this.constraints[i][k].intersect(new RelSet(newSet));
            if (!newRelSet.equals(this.constraints[i][k])) {
              this.constraints[i][k] = newRelSet;
              changed = true;
              if (newRelSet.isEmpty()) {
                return {
                  consistent: false,
                  culprit: { i, j, k },
                  message: `Inconsistency detected:
  - While composing (${i},${j}) = {${[...this.constraints[i][j].rels].join(',')}} and (${j},${k}) = {${[...this.constraints[j][k].rels].join(',')}}
  - The possible relations for (${i},${k}) became empty (was {${[...this.constraints[i][k].rels].join(',')}})
  - This means no RCC8 relation is possible between ${i} and ${k} given the current constraints.`
                };
              }
            }
          }
        }
      }
    }
    return { consistent: true };
  }
}

// --- 5. Parse and check from spec string ---
export function checkRCC8ConsistencyFromSpec(input) {
  const lines = input.split('\n').map(l => l.trim()).filter(Boolean);
  const regionsSet = new Set();
  const relations = [];
  for (const line of lines) {
    if (line.startsWith("Region")) {
      const names = line.replace("Region", "").split(",").map(s => s.trim()).filter(Boolean);
      names.forEach(n => regionsSet.add(n));
    } else {
      const m = line.match(/^(\w+)\(([^,]+),\s*([^)]+)\)$/);
      if (m) {
        relations.push({ relation: m[1], r1: m[2], r2: m[3] });
        regionsSet.add(m[2]);
        regionsSet.add(m[3]);
      }
    }
  }
  const regions = Array.from(regionsSet);
  const net = new RCC8Network(regions, relations);
  return net.propagate();
}
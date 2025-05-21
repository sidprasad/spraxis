import { RCC8_Algebra } from './rcc8Algebra.js';

/**
 * Compose two RCC8 base relations using the RCC8 composition table.
 * @param {string} r1 - First RCC8 base relation (e.g., "DC").
 * @param {string} r2 - Second RCC8 base relation (e.g., "EC").
 * @returns {string[]} Array of possible RCC8 relations resulting from the composition.
 */
function composeRCC8(r1, r2) {
  return RCC8_Algebra.TransTable[r1][r2].split('|');
}

/**
 * Compose two sets of RCC8 relations.
 * @param {string[]} set1 - First set of RCC8 relations.
 * @param {string[]} set2 - Second set of RCC8 relations.
 * @returns {string[]} Array of possible RCC8 relations resulting from all pairwise compositions.
 */
function composeSets(set1, set2) {
  const result = new Set();
  for (const r1 of set1) {
    for (const r2 of set2) {
      for (const r of composeRCC8(r1, r2)) {
        result.add(r);
      }
    }
  }
  return Array.from(result);
}

/**
 * Path consistency reasoner for RCC8 constraint networks.
 * 
 * Given a set of regions and initial binary relations (constraints) between them,
 * this function enforces path consistency using the RCC8 composition table.
 * 
 * @param {string[]} regions - Array of region names (e.g., ["A", "B", "C"]).
 * @param {Object} inputRelations - Object mapping region pairs to arrays of possible RCC8 relations.
 *   Example: { A: { B: ["DC"] }, B: { C: ["EC"] } }
 * @returns {Object} If consistent, returns { consistent: true, refined: constraints }
 *                   If inconsistent, returns { consistent: false, culprit, message }
 */
export function checkPathConsistency(regions, inputRelations) {
  // Initialize constraints for all region pairs
  const allRels = Object.keys(RCC8_Algebra.Relations);
  const constraints = {};
  for (const a of regions) {
    constraints[a] = {};
    for (const b of regions) {
      if (a === b) {
        constraints[a][b] = ['EQ']; // A region is always equal to itself
      } else if (inputRelations[a] && inputRelations[a][b]) {
        constraints[a][b] = [...inputRelations[a][b]]; // Use provided constraints
      } else {
        constraints[a][b] = [...allRels]; // Unconstrained: all relations possible
      }
    }
  }

  // Enforce path consistency
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

          // Compose rel_ij and rel_jk to get possible relations for (i, k)
          const possible = new Set(composeSets(rel_ij, rel_jk));
          // Intersect with current constraints
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
  // If we reach here, the network is path-consistent
  return {
    consistent: true,
    refined: constraints
  };
}

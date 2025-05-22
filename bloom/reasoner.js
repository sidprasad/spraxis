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
 * Get the converses of a set of RCC8 relations using the algebra.
 * @param {string[]} rels - Array of RCC8 relations.
 * @param {Object} algebra - The RCC8 algebra object.
 * @returns {string[]} Array of converse relations.
 */
function getConverses(rels, algebra) {
  return Array.from(new Set(rels.map(r => algebra.Relations[r].Converse)));
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
  const allRels = Object.keys(RCC8_Algebra.Relations);
  const constraints = {};

  // Initialize constraints for all region pairs, ensuring symmetry/converse
  for (const a of regions) {
    constraints[a] = {};
    for (const b of regions) {
      if (a === b) {
        constraints[a][b] = ['EQ'];
      } else if (inputRelations[a] && inputRelations[a][b]) {
        constraints[a][b] = [...inputRelations[a][b]];
      } else {
        constraints[a][b] = [...allRels];
      }
    }
  }
  // Enforce symmetry/converse for all pairs
  for (const a of regions) {
    for (const b of regions) {
      if (a !== b) {
        constraints[b][a] = constraints[b][a] ?
          constraints[b][a].filter(r => getConverses(constraints[a][b], RCC8_Algebra).includes(r)) :
          getConverses(constraints[a][b], RCC8_Algebra);
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

          const possible = new Set(composeSets(rel_ij, rel_jk));
          const newRel_ik = rel_ik.filter(r => possible.has(r));
          if (newRel_ik.length === 0) {
            return {
              consistent: false,
              culprit: { i, j, k },
              message: `Inconsistency: (${i},${j}) ∈ {${rel_ij.join(',')}}; (${j},${k}) ∈ {${rel_jk.join(',')}}; (${i},${k}) became empty`
            };
          }
          // Only update if strictly refined
          if (newRel_ik.length < rel_ik.length) {
            constraints[i][k] = newRel_ik;
            // Now update the converse, but intersect with current to avoid overwriting
            const converseSet = getConverses(newRel_ik, RCC8_Algebra);
            const oldConverse = constraints[k][i];
            const newConverse = oldConverse.filter(r => converseSet.includes(r));
            if (newConverse.length === 0) {
              return {
                consistent: false,
                culprit: { i: k, j: j, k: i },
                message: `Inconsistency: converse of (${i},${k}) became empty`
              };
            }
            if (newConverse.length < oldConverse.length) {
              constraints[k][i] = newConverse;
              changed = true;
            }
            changed = true;
          }
        }
      }
    }
  }
  // If any of the relations are empty, we have an inconsistency
  for (const a of regions) {
    for (const b of regions) {
      if (a !== b && constraints[a][b].length === 0) {
        return {
          consistent: false,
          culprit: { i: a, j: b },
          message: `Inconsistency: (${a},${b}) became empty`
        };
      }
    }
  }



  return {
    consistent: true,
    refined: constraints
  };
}

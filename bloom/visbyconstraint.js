import * as bloom from "https://penrose.cs.cmu.edu/bloom.min.js";
import {DC, EC, PO, EQ, TPP, NTPP, TPPi, NTPPi} from "./rcc8.js";
const minOverlap = 5; // This could be a percentage




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

/** I think this is the viz insight -- deformation can only happen in some scenarios... */

// And I think it's crucial to mention that these are 
// specifically for R^2. There are more abstract ways to do this in other spaces / in the  abstract.
const RCC6Regions = {};

RCC6Regions[setKey([NTTP, TPP])] = "PP"; // Proper Subset
RCC6Regions[setKey([DC, EC])] = "NOINT"; // No intersection
RCC6Regions[setKey([EC, PO])] = "EC_PO"; // TouchingEdge Not Subset
RCC6Regions[setKey([PO, TPP])] = "PO_TPP"; // Touching Edge, Proper Subset
RCC6Regions[setKey([TPP, EQ])] = "TPP_EQ"; // TOuching Edge, Subset


RCC6Regions[setKey([DC, EC, PO])] = "NOTSUBSET";
RCC6Regions[setKey([EC, PO, TPP])] = "TOUCHING_NEQ";
RCC6Regions[setKey([PO, TPP, EQ])] = "SOME_INTERSECTION_TOUCHING";

RCC6Regions[setKey([DC, EC, PO, TPP])] = "NOT_EQUAL_NOT_NTTP";
RCC6Regions[setKey([EC, PO, TPP, EQ])] = "TOUCHING_OVERLAP";
RCC6Regions[setKey([PO, TPP, EQ, NTPP])] = "SOME_INTERSECTION"; 


RCC6Regions[setKey([DC, EC, PO, TPP, EQ])] = "TOUCHING_EDGE_OR_DC";
RCC6Regions[setKey([DC, EC, PO, NTPP, EQ])] = "NOT_TPP";
RCC6Regions[setKey([DC, EC, PO, TPP, NTPP])] = "NOT_EQ";
RCC6Regions[setKey([EC, PO, TPP, NTPP, EQ])] = "NOT_DC";

RCC6Regions[setKey(RCC6Relations)] = "U";


/**
 * 
 * @param {*} regions : Array of region names
 * @param {*} relations : Object with permitted relations between regions
    "A": {
        "A": [
            "EQ"
        ],
        "B": [
            "EQ"
        ],
        "C": [
            "TPP"
        ]
    },
    "B": {
        "A": [
            "DC",
            "EC",
            "PO",
            "EQ",
            "TPP",
            "NTPP",
            "TPPi",
            "NTPPi"
        ],
        "B": [
            "EQ"
        ],
        "C": [
            "TPP"
        ]
    },
    "C": {
        "A": [
            "DC",
            "EC",
            "PO",
            "EQ",
            "TPP",
            "NTPP",
            "TPPi",
            "NTPPi"
        ],
        "B": [
            "DC",
            "EC",
            "PO",
            "EQ",
            "TPP",
            "NTPP",
            "TPPi",
            "NTPPi"
        ],
        "C": [
            "EQ"
        ]
    }
}
 */
// TODO: Need to rewrite this to use the new regions and relations :)
export async function buildDiagram(rcc8util) {
  // Clear container
  const container = document.getElementById("diagram-container");
  container.innerHTML = "";

  // Check for consistency
  let res = rcc8util.isConsistent();

    if (!res.consistent) {
        console.log(res.culprit);
        alert(res.message);

        // If not consistent, show a message, and perhaps some kind of 
        // counter-factual diagram.
        return;
    }

  let relations = res.refined;
  let regions = rcc8util.regions;



  // New diagram builder each time
  const db = new bloom.DiagramBuilder(bloom.canvas(400, 400), "rcc8", 1);
  const { type, predicate, forall, forallWhere, ensure, circle, text, encourage, layer } = db;
  const { disjoint, overlapping, touching, equal, contains, greaterThan, lessThan } = bloom.constraints;


  const Region = type();

  // Complete space Region

  const U = predicate();

  // Singleton regions
  const DC = predicate();
  const EC = predicate();
  const PO = predicate();
  const EQ = predicate();
  const TPP = predicate();
  const TPPi = predicate();
  const NTPP = predicate();
  const NTPPi = predicate();

  // Connected Pairs //


  /// SOme other regions ///


  let regionMap = {};

  console.log("Regions: ", regions);

  regions.forEach(name => {
    const r = Region();
    r.name = name;
    regionMap[name] = r;
  });

  // Style: create icons and labels
  forall({ x: Region }, ({ x }) => {
    x.icon = circle({ drag: true });
    ensure(greaterThan(x.icon.r, 10));
    let t = text({ string: x.name });
    x.text = t;
    ensure(contains(x.icon, t));
    encourage(bloom.objectives.near(t, x.icon));
    layer(t, x.icon);
  });

  forall({ a: Region, b: Region }, ({ a, b }) => {
    ensure(disjoint(a.text, b.text));
  });

  console.log("Relations: ", relations);


  for (const a of Object.keys(relations)) {
    for (const b of Object.keys(relations[a])) {
        const rels = relations[a][b]; // array of allowed relations

        if(a === b) {
            continue;
        }


        // The thing is, rels could be **anything**.

        let contiguousSets = rcc8util.partitionIntoContiguousSets(rels);

        // HACK, DOES NOT WORK. For now,
        // no support for disjunction.
        // Check if rels is a contiguous RCC8 set.

        for (const rel of rels) {

            const A = regionMap[a], B = regionMap[b];
            if (!A || !B) continue;
            if (rel === "EQ") EQ(A, B);
            if (rel === "DC") DC(A, B);
            if (rel === "EC") EC(A, B);
            if (rel === "PO") PO(A, B);
            if (rel === "TPP") TPP(A, B);
            if (rel === "TPPi") TPPi(A, B);
            if (rel === "NTPP") NTPP(A, B);
            if (rel === "NTPPi") NTPPi(A, B);
        }
        
        

    }
}


  // RCC8 constraints

  // DC: Disconnected
  forallWhere({ a: Region, b: Region }, ({ a, b }) => DC.test(a, b), ({ a, b }) => {
    ensure(disjoint(a.icon, b.icon, minOverlap));
  });

  // EC: Externally Connected
  forallWhere({ a: Region, b: Region }, ({ a, b }) => EC.test(a, b), ({ a, b }) => {
    ensure(touching(a.icon, b.icon));
    ensure(disjoint(a.icon, b.icon));
  });


  // PO: Partial Overlap
  forallWhere({ a: Region, b: Region }, ({ a, b }) => PO.test(a, b), ({ a, b }) => {
    ensure(overlapping(a.icon, b.icon, minOverlap));
    ensure(
      greaterThan(
        bloom.ops.vdist(a.icon.center, b.icon.center),
        bloom.abs(bloom.sub(a.icon.r ,b.icon.r))
      )
    );
    ensure(
      lessThan(
        bloom.ops.vdist(a.icon.center, b.icon.center),
        bloom.add(a.icon.r , b.icon.r)
      )
    );
    // Optionally, limit maximum overlap (e.g., at most 95%)
    ensure(
      greaterThan(
        bloom.ops.vdist(a.icon.center, b.icon.center),
        bloom.mul(0.05, Math.min(a.icon.r, b.icon.r))
      )
    );
  });

  // EQ: Equal
  forallWhere({ a: Region, b: Region }, ({ a, b }) => EQ.test(a, b), ({ a, b }) => {
    ensure(equal(a.icon.r, b.icon.r));
    ensure(contains(a.icon, b.icon));
    ensure(contains(b.icon, a.icon));
  });

  // TPP: Tangential Proper Part
  forallWhere({ a: Region, b: Region }, ({ a, b }) => TPP.test(a, b), ({ a, b }) => {
    ensure(contains(b.icon, a.icon));
    ensure(
      equal(
        bloom.ops.vdist(a.icon.center, b.icon.center),
        bloom.abs(bloom.sub(b.icon.r , a.icon.r))
      )
    );
    ensure(greaterThan(b.icon.r, a.icon.r));
    layer(a.icon, b.icon);
  });

  // NTPP: Non-Tangential Proper Part
  forallWhere({ a: Region, b: Region }, ({ a, b }) => NTPP.test(a, b), ({ a, b }) => {
    ensure(contains(b.icon, a.icon, 5));
    ensure(greaterThan(b.icon.r, a.icon.r));
    layer(a.icon, b.icon);
  });

  // And composite regions


  // Contains, but not equal
  forallWhere({ a: Region, b: Region }, ({ a, b }) => PP.test(b, a), ({ a, b }) => {
    ensure(contains(b.icon, a.icon));

    ensure(greaterThan(b.icon.r, a.icon.r));
  });




  // Build and render
  const diagram = await db.build();
  container.appendChild(diagram.getInteractiveElement());
}

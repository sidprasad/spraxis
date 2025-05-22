import * as bloom from "https://penrose.cs.cmu.edu/bloom.min.js";


const epsilon = 0.01;


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
            "TPPI",
            "NTPPI"
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
            "TPPI",
            "NTPPI"
        ],
        "B": [
            "DC",
            "EC",
            "PO",
            "EQ",
            "TPP",
            "NTPP",
            "TPPI",
            "NTPPI"
        ],
        "C": [
            "EQ"
        ]
    }
}
 */
// TODO: Need to rewrite this to use the new regions and relations :)
export async function buildDiagram(relations, regions) {
  // Clear container
  const container = document.getElementById("diagram-container");
  container.innerHTML = "";




  // TODO: REBUILD THIS TO USE DISJUNCTIONS, ETC.

  // New diagram builder each time
  const db = new bloom.DiagramBuilder(bloom.canvas(400, 400), "rcc8", 1);
  const { type, predicate, forall, forallWhere, ensure, circle, text, encourage, layer } = db;
  const { disjoint, overlapping, touching, equal, contains, greaterThan, lessThan } = bloom.constraints;


  const Region = type();

  // Complete space Region


  const notDC = predicate();
  const notEC = predicate();
  const notPO = predicate();
  const notEQ = predicate();
  const notTPP = predicate();
  const notNTPP = predicate();


  // And potential helper
  const PP = predicate();

  let regionMap = {};

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




  let bloomSpec = "";


  for (const a of Object.keys(relations)) {
    for (const b of Object.keys(relations[a])) {
      const rels = relations[a][b]; // array of allowed relations

      if (a === b) {
        continue;
      }

      if(rels.length === 0) {
        alert("Inconsistent: No relations between " + a + " and " + b);
        return;
      }

      let aRegion = regionMap[a];
      let bRegion = regionMap[b];

      // Disallow relations not in the rel set.
      let relsSet = new Set(rels);

      // SPecial case (1)
      if (relsSet.has("TPP") && relsSet.has("NTPP") && relsSet.size === 2) {
        // This is a special case where we really know the exact relation
        PP(aRegion, bRegion);
        bloomSpec += `PP(${a}, ${b})\n`;
        continue;
      }
      else if (relsSet.has("TPPI") && relsSet.has("NTPPI") && relsSet.size === 2) {
        // This is a special case where we really know the exact relation
        PP(bRegion, aRegion);
        bloomSpec += `PP(${b}, ${a})\n`;
        continue;
      }
      else {
        console.log("Not a special case", relsSet);
      }


      if (!relsSet.has("DC")) {
        notDC(aRegion, bRegion);
        bloomSpec += `notDC(${a}, ${b})\n`;
      }

      if (!relsSet.has("EC")) {
        notEC(aRegion, bRegion);
        bloomSpec += `notEC(${a}, ${b})\n`;
      }

      if (!relsSet.has("PO")) {
        notPO(aRegion, bRegion);
        bloomSpec += `notPO(${a}, ${b})\n`;
      }

      if (!relsSet.has("EQ")){
        notEQ(aRegion, bRegion);
        bloomSpec += `notEQ(${a}, ${b})\n`;
      }
      if (!relsSet.has("TPP")) {
        notTPP(aRegion, bRegion);
        bloomSpec += `notTPP(${a}, ${b})\n`;
      }
      if (!relsSet.has("NTPP"))  {
        notNTPP(aRegion, bRegion);
        bloomSpec += `notNTPP(${a}, ${b})\n`;
      }

      // I don't think we need to do NOT TPPI or NTPPI, since the
      // converse is already handled by the other relations
    }
  }

  console.log("BloomSpec", bloomSpec);


  // NOT DC
  forallWhere({ a: Region, b: Region }, ({ a, b }) => notDC.test(a, b), ({ a, b }) => {
    ensure(
      lessThan(
        bloom.ops.vdist(a.icon.center, b.icon.center),
        bloom.add(bloom.add(a.icon.r, b.icon.r) , epsilon) // add epsilon for numerical stability
      )
    );
  });


  // We should work on nonEC, since perhaps we want some boundary, etc.
  forallWhere({ a: Region, b: Region }, ({ a, b }) => notEC.test(a, b), ({ a, b }) => {
    ensure(
      greaterThan(
        bloom.abs(
          bloom.sub(
            bloom.ops.vdist(a.icon.center, b.icon.center),
            bloom.add(a.icon.r, b.icon.r)
          )
        ),
        epsilon
      )
    );
  });


  // // Less than ideal, have to *encourage* for disjunction.
forallWhere({ a: Region, b: Region }, ({ a, b }) => notPO.test(a, b), ({ a, b }) => {
  // Encourage being outside the PO interval:
  encourage(disjoint(a.icon, b.icon));
  encourage(contains(a.icon, b.icon));
  encourage(contains(b.icon, a.icon));
});



  // They ~must~ have the same center to be equal.
  // This is less than perfectly correct, since they could have the same center
  // and different radii, but maybe thats ok.
  forallWhere({ a: Region, b: Region }, ({ a, b }) => notEQ.test(a, b), ({ a, b }) => {
    ensure(
      greaterThan(
        bloom.ops.vdist(a.icon.center, b.icon.center),
        epsilon
      )
    );
  });



  forallWhere({ a: Region, b: Region }, ({ a, b }) => notTPP.test(a, b), ({ a, b }) => {
    ensure(
      greaterThan(
        bloom.ops.vdist(a.icon.center, b.icon.center),
        bloom.add(bloom.abs(bloom.sub(a.icon.r, b.icon.r)), epsilon)
      )
    );
  });



  forallWhere({ a: Region, b: Region }, ({ a, b }) => notNTPP.test(a, b), ({ a, b }) => {
    ensure(
      greaterThan(
        bloom.ops.vdist(a.icon.center, b.icon.center),
        bloom.sub(bloom.abs(b.icon.r, a.icon.r), epsilon)
      )
    );
  });





  // Contains, but not equal
  forallWhere({ a: Region, b: Region }, ({ a, b }) => PP.test(a, b), ({ a, b }) => {
    ensure(contains(b.icon, a.icon));

    ensure(greaterThan(b.icon.r, a.icon.r));

    layer(a.icon, b.icon);
  });






  // Build and render
  const diagram = await db.build();
  container.appendChild(diagram.getInteractiveElement());
}

import * as bloom from "https://penrose.cs.cmu.edu/bloom.min.js";
const minOverlap = 5; // This could be a percentage


const epsilon = 1e-2;


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
export async function buildDiagram(rcc6util) {
  // Clear container
  const container = document.getElementById("diagram-container");
  container.innerHTML = "";

  // Check for consistency
  let res = rcc6util.isConsistent();

    if (!res.consistent) {
        console.log(res.culprit);
        alert(res.message);

        // If not consistent, show a message, and perhaps some kind of 
        // counter-factual diagram.
        return;
    }

  let relations = res.refined;
  let regions = rcc6util.regions;



  // New diagram builder each time
  const db = new bloom.DiagramBuilder(bloom.canvas(400, 400), "rcc8", 1);
  const { type, predicate, forall, forallWhere, ensure, circle, text, encourage, layer } = db;
  const { disjoint, overlapping, touching, equal, contains, greaterThan, lessThan } = bloom.constraints;


  const Region = type();

  // Complete space Region

  // Singleton regions
  const DC = predicate();
  const EC = predicate();
  const PO = predicate();
  const EQ = predicate();
  const TPP = predicate();
  const NTPP = predicate();


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

  console.log("Relations: ", relations);


  

  for (const a of Object.keys(relations)) {
    for (const b of Object.keys(relations[a])) {
        const rels = relations[a][b]; // array of allowed relations


        // TODO: Here, we have to deal with contiguous subsets?



        if(a === b) {
            continue;
        }

          let aRegion = regionMap[a];
          let bRegion = regionMap[b];

        // If rels has only one relation, use that
        

        // Otherwise, if there are multiple relations, exclude the ones that
        // are not in the list

        if (rels.length === 1) {
          let rel = rels[0];
          if (rel === "DC") DC(aRegion, bRegion);
          else if (rel === "EC") EC(aRegion, bRegion);
          else if (rel === "PO") PO(aRegion, bRegion);
          else if (rel === "EQ") EQ(aRegion, bRegion);
          else if (rel === "TPP") TPP(aRegion, bRegion);
          else if (rel === "NTPP") NTPP(aRegion, bRegion);
        
        }
        else if (rels.length > 1) {
          // Exclude the relations that are not in the list
          let relsSet = new Set(rels);
          if (!relsSet.has("DC")) notDC(aRegion, bRegion);

          if (!relsSet.has("EC")) notEC(aRegion, bRegion);

          if (!relsSet.has("PO")) notPO(aRegion, bRegion);

          if (!relsSet.has("EQ")) notEQ(aRegion, bRegion);
          if (!relsSet.has("TPP")) notTPP(aRegion, bRegion);
          if (!relsSet.has("NTPP")) notNTPP(aRegion, bRegion);
        }

    }
}


  //// TODO: Probably need to write these in a more consistent way :)


  // DC: Disconnected
  forallWhere({ a: Region, b: Region }, ({ a, b }) => DC.test(a, b), ({ a, b }) => {
    ensure(disjoint(a.icon, b.icon, minOverlap));
  });


  // NOT DC
  forallWhere({ a: Region, b: Region }, ({ a, b }) => notDC.test(a, b), ({ a, b }) => {
    overlapping(a.icon, b.icon); // should do this with radii and centers
  });



  // EC: Externally Connected
  forallWhere({ a: Region, b: Region }, ({ a, b }) => EC.test(a, b), ({ a, b }) => {
    ensure(touching(a.icon, b.icon));
    ensure(disjoint(a.icon, b.icon));
  });


// NOT EC
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


  
forallWhere({ a: Region, b: Region }, ({ a, b }) => notPO.test(a, b), ({ a, b }) => {
  // Enforce: d ≤ |r1 - r2| + ε  OR  d ≥ r1 + r2 - ε
  // (This will "push" the solution out of the PO interval)
  ensure(
    bloom.or(
      lessThan(
        bloom.ops.vdist(a.icon.center, b.icon.center),
        bloom.add(bloom.abs(bloom.sub(a.icon.r, b.icon.r)), epsilon)
      ),
      greaterThan(
        bloom.ops.vdist(a.icon.center, b.icon.center),
        bloom.sub(bloom.add(a.icon.r, b.icon.r), epsilon)
      )
    )
  );
});


  // EQ: Equal
  forallWhere({ a: Region, b: Region }, ({ a, b }) => EQ.test(a, b), ({ a, b }) => {
    ensure(equal(a.icon.r, b.icon.r));
    ensure(contains(a.icon, b.icon));
    ensure(contains(b.icon, a.icon));
  });

  // Sort of works I think?
  forallWhere({ a: Region, b: Region }, ({ a, b }) => notEQ.test(a, b), ({ a, b }) => {
  ensure(
    greaterThan(
      bloom.ops.vdist(a.icon.center, b.icon.center),
      epsilon
    )
  );});



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


  // NTPP: Non-Tangential Proper Part
  forallWhere({ a: Region, b: Region }, ({ a, b }) => NTPP.test(a, b), ({ a, b }) => {
    ensure(contains(b.icon, a.icon, 5));
    ensure(greaterThan(b.icon.r, a.icon.r));
    layer(a.icon, b.icon);
  });



  // Contains, but not equal
  forallWhere({ a: Region, b: Region }, ({ a, b }) => PP.test(b, a), ({ a, b }) => {
    ensure(contains(b.icon, a.icon));

    ensure(greaterThan(b.icon.r, a.icon.r));
  });




  // Build and render
  const diagram = await db.build();
  container.appendChild(diagram.getInteractiveElement());
}

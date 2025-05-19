import * as bloom from "https://penrose.cs.cmu.edu/bloom.min.js";

const db = new bloom.DiagramBuilder(bloom.canvas(400, 400), "rcc8", 1);

// Diagramming goes here!
const { type, predicate, forall, forallWhere, ensure, circle, text, encourage, layer } = db;
const { disjoint, overlapping, touching, equal, contains, greaterThan, lessThan } = bloom.constraints;



/* This corresponds to the Penrose DOMAIN */

const Region = type();

const DC = predicate();
const EC= predicate();
const PO = predicate();
const EQ = predicate();
const TPP= predicate();
const TPPi= predicate();
const NTPP= predicate();
const NTPPi= predicate();
/*********** */


/***
 Now this is the Penrose Substance. We should (somehow read this in?)
 */

const A = Region();
A.name = "A";
const B = Region();
B.name = "B";

const C = Region();
C.name = "C";

const D = Region();
D.name = "D";

const E = Region();
E.name = "E";

NTPP(A, B);
TPP(B, C);
PO(D, E);

DC(C, E);

/************* */


const minOverlap = 5; // This should be a percentage?

/*** Now this is like the Style file */

forall({ x: Region }, ({ x }) => {
  x.icon = circle({
    drag: true,
  });

  ensure(greaterThan(x.icon.r, 10));

  let t = text ({
    string: x.name,
  });

  x.text = t;

    ensure(contains(x.icon, t));


    encourage(bloom.objectives.near(t, x.icon));

    layer(t,  x.icon);

 // Encourage the size to not change much.

});


forall( {a : Region, b : Region}, ({a, b}) => {
  ensure(disjoint(a.text, b.text));
});



// RCC8 relations

// DC: Disconnected
forallWhere({ a: Region, b: Region }, ({ a, b }) => DC.test(a, b), ({ a, b }) => {
  ensure(disjoint(a.icon, b.icon, minOverlap));
    // ? 
  // TODO: encourage separation instead of hardcoding margin
});

// EC: Externally Connected
forallWhere({ a: Region, b: Region }, ({ a, b }) => EC.test(a, b), ({ a, b }) => {
  ensure(touching(a.icon, b.icon));
  ensure(disjoint(a.icon, b.icon));
});

// PO: Partial Overlap
forallWhere({ a: Region, b: Region }, ({ a, b }) => PO.test(a, b), ({ a, b }) => {
    // So this ensures the MIN overlap, but NOT the max overlap
    ensure(overlapping(a.icon, b.icon, minOverlap));


// Not quite correct, but close. This needs some 
// *distance* constraints (like max subsumption)
  ensure(
    greaterThan(
      bloom.ops.vdist(a.icon.center, b.icon.center),
      bloom.abs(bloom.sub(a.icon.r ,b.icon.r))
    )
  );
  ensure(
    lessThan(
      bloom.ops.vdist(a.icon.center, b.icon.center),
      bloom.add(a.icon.r , b.icon.r),
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
    console.log("NTPP", a, b);
    ensure(contains(b.icon, a.icon, 5));

   ensure(greaterThan(b.icon.r, a.icon.r));
   layer(a.icon, b.icon);
});


/////// We can correct these LATER.

// TPPi: Tangential Proper Part Inverse (same as TPP but reversed roles)
forallWhere({ a: Region, b: Region }, ({ a, b }) => TPPi.test(b, a), ({ a, b }) => {
  ensure(contains(b.icon, a.icon));
  ensure(
    equal(
      bloom.ops.vdist(a.icon.center, b.icon.center),
      Math.abs(b.icon.r - a.icon.r)
    )
  );
  ensure(greaterThan(b.icon.r, a.icon.r));
  //layer(a.icon, "above", b.icon);
});

// NTPPi: Non-Tangential Proper Part Inverse
forallWhere({ a: Region, b: Region }, ({ a, b }) => NTPPi.test(b, a), ({ a, b }) => {
  ensure(contains(b.icon, a.icon));
  ensure(
    lessThan(
      bloom.ops.vadd(bloom.ops.vdist(a.icon.center, b.icon.center), a.icon.r),
      b.icon.r
    )
  );
  encourage(
    lessThan(
      bloom.ops.vadd(bloom.ops.vdist(a.icon.center, b.icon.center), a.icon.r),
      b.icon.r - 0.2 * a.icon.r
    )
  );
  ensure(greaterThan(b.icon.r, a.icon.r));
  //layer(a.icon, "above", b.icon);
});
/********* */





// main.js

const diagram = await db.build();

const interactiveElement = diagram.getInteractiveElement();
document.getElementById("diagram-container").appendChild(interactiveElement);

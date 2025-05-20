import * as bloom from "https://penrose.cs.cmu.edu/bloom.min.js";
import { checkConsistency } from "./rcc8.js";

const minOverlap = 5; // This could be a percentage

function parseSpec(spec) {


  const regions = [];
  const relations = [];
  const lines = spec.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (line.startsWith("Region ")) {
      const decls = line.split(" ")[1];
      const rnames = names.split(",").map(n => n.trim());
      regions.push(...rnames);

    } else {
      // e.g. EQ(A, B)
      const m = line.match(/^(\w+)\(([^,]+),\s*([^)]+)\)$/);
      if (m) {

        const a = m[2].trim();
        const b = m[3].trim();
        const rel = m[1].trim();

        relations.push({ rel, a, b });
      }
    }
  }
  return { regions, relations };
}



async function buildDiagram(regions, relations) {
  // Clear container
  const container = document.getElementById("diagram-container");
  container.innerHTML = "";

  // New diagram builder each time
  const db = new bloom.DiagramBuilder(bloom.canvas(400, 400), "rcc8", 1);
  const { type, predicate, forall, forallWhere, ensure, circle, text, encourage, layer } = db;
  const { disjoint, overlapping, touching, equal, contains, greaterThan, lessThan } = bloom.constraints;

  // RCC8 predicates
  const Region = type();
  const DC = predicate();
  const EC = predicate();
  const PO = predicate();
  const EQ = predicate();
  const TPP = predicate();
  const TPPi = predicate();
  const NTPP = predicate();
  const NTPPi = predicate();

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

  // Relations
  for (const { rel, a, b } of relations) {
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

  // TPPi: Tangential Proper Part Inverse
  forallWhere({ a: Region, b: Region }, ({ a, b }) => TPPi.test(b, a), ({ a, b }) => {
    ensure(contains(b.icon, a.icon));
    ensure(
      equal(
        bloom.ops.vdist(a.icon.center, b.icon.center),
        Math.abs(b.icon.r - a.icon.r)
      )
    );
    ensure(greaterThan(b.icon.r, a.icon.r));
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
  });

  // Build and render
  const diagram = await db.build();
  container.appendChild(diagram.getInteractiveElement());
}

// Initial render and button handler
document.getElementById("render-btn").onclick = () => {
  const spec = document.getElementById("spec-input").value;

  let {regions, relations} = parseSpec(spec);

  // Now, check consistency.

  // If not consistent, show a message, and perhaps some kind of counter-factual diagram.
  // Else show the diagram, and hope its realizable in R^2.

  if (!result.consistent) {
    alert(result.message);
    //return;

    // WHAT I ~~ WOULD ~~ Like to do is show some kind of counter-factual here.
  }

  buildDiagram(regions, relations);
};
// Optionally, render on page load
buildDiagram(document.getElementById("spec-input").value);

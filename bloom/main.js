import { RCC8Utility } from "./rcc8.js";
import { buildDiagram } from "./visbyconstraint.js";

const minOverlap = 5; // This could be a percentage



// Initial render and button handler
document.getElementById("render-btn").onclick = () => {
  const spec = document.getElementById("spec-input").value;

  let rcc8 = new RCC8Utility(spec);
  // NOW, the refined relations need to be converted to the correct format for Bloom. TODOTODO

  // TODO: Should this be robust to handle disjunctions?
  buildDiagram(rcc8);
};
// Optionally, render on page load
//buildDiagram(document.getElementById("spec-input").value);

import { RCC8Utility } from "./rcc6.js";
import { buildDiagram } from "./visbyconstraint.js";



// Initial render and button handler
document.getElementById("render-btn").onclick = () => {
  const spec = document.getElementById("spec-input").value;

  let rcc6 = new RCC8Utility(spec);
  // NOW, the refined relations need to be converted to the correct format for Bloom. TODOTODO

  // TODO: Should this be robust to handle disjunctions?
  buildDiagram(rcc6);
};
// Optionally, render on page load
//buildDiagram(document.getElementById("spec-input").value);

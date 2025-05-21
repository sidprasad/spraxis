import { RCC8Utility } from "./rcc8.js";
import { buildDiagram } from "./visbyconstraint.js";








// Initial render and button handler
document.getElementById("render-btn").onclick = () => {
  const spec = document.getElementById("spec-input").value;

  let rcc8util = new RCC8Utility(spec);
  // NOW, the refined relations need to be converted to the correct format for Bloom. TODOTODO


  let result = rcc8util.checkPathConsistency();
  if (!result.consistent) {
    alert("Inconsistent: " + result.message);
    return;
  }

  let regions = rcc8util.regions;
  let relations = result.refined;

  // TODO: Should this be robust to handle disjunctions?
  buildDiagram(regions, refined);
};
// Optionally, render on page load
//buildDiagram(document.getElementById("spec-input").value);

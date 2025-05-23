

- There is a mismatch between the reasoner and the parser.


## Constrainted Drawing

Related work,: https://people.irisa.fr/Francois.Schwarzentruber/constrainteddrawing/
  - Issue: Doesn't know what to do if a RCC8 spec is inconsistent.
    -   "The software continues to use search in background so that the constraints are satisfied (or the most satisfied as possible)."
    -   IMO, defeats the purpose of the thing?
    -   We should show something else instead. Counterfactual.
  - Issue: What about disjunctions? AFAIK, it doesn't deal with them well. Something like:
```
circle("A");
circle("B");

or (DC("A", "B"), EC("A", "B"));
```
causes an unstable, constantly evolving diagram.

The real question is:
- What is important here? A system that is fast, or a system that
  allows for easy explanation?

## Alternative 2:

We could rebuild this ConstraintDrawing in a small Bloom-Only language.
It's nice, but there are some issues here -- largely around (What if the spec is internally inconsistent?)

## What we really need IMO
- Lets you know if inconsistent. If inconsistent, helps you understand what is going on via "counter-factual"
- If consistent, and with disjunctions, helps you understand the disjunctions.
  - There may be non-contiguous "forks" in the disjunction zone. Perhaps indentify these, and allow exploration by allowing users to choose which non-contiguous fork they mean.
  - This helps them refine their understanding.
  - IF they don't care, we just pick one and proceed!


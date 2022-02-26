# Lernkartei v2

## Architecture overview

```mermaid

flowchart LR
  subgraph Fauna["Fauna DB"]
  LearningLog
  Dictionary
  end

  LearningLog --->|aggregation| LearningProgress ---> Weights
  w["Wiktionary (external source)"] --->|scraping| Dictionary
  Dictionary ---> Weights
  r["Random number"] ---> Question
  Weights ---> Question
  Dictionary ---> Question
  Question --->|user interaction| Response
  Response ---> LearningLog
```
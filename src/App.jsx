import { useState, useCallback, useRef } from "react";
import Header from "./components/Header";
import CellCapacities from "./components/CellCapacities";
import Configuration from "./components/Configuration";
import Results from "./components/Results";
import Footer from "./components/Footer";
import {
  optimizeCellConfiguration,
  calculateOptimizationBenefit,
  validateConfiguration,
} from "./utils/algorithm";

export default function App() {
  const [cellCount, setCellCount] = useState(2);
  const [capacities, setCapacities] = useState(() => Array(2).fill(""));
  const [series, setSeries] = useState(1);
  const [parallel, setParallel] = useState(2);
  const [result, setResult] = useState(null);
  const [benefit, setBenefit] = useState(null);
  const resultsRef = useRef(null);

  const handleCellCountChange = useCallback((count) => {
    const clamped = Math.max(2, Math.min(100, count));
    setCellCount(clamped);
    setCapacities((prev) => {
      const next = Array(clamped).fill("");
      for (let i = 0; i < Math.min(prev.length, clamped); i++) {
        next[i] = prev[i];
      }
      return next;
    });
    setResult(null);
    setBenefit(null);
  }, []);

  const handleCapacityChange = useCallback((index, value) => {
    setCapacities((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleBulkApply = useCallback((values) => {
    const clamped = Math.max(2, Math.min(100, values.length));
    setCellCount(clamped);
    setCapacities(values.slice(0, clamped).map(String));
    setResult(null);
    setBenefit(null);
  }, []);

  const handleConfigChange = useCallback((s, p) => {
    setSeries(s);
    setParallel(p);
    setResult(null);
    setBenefit(null);
  }, []);

  const handleOptimize = useCallback(() => {
    const parsed = capacities.map((c) => parseInt(c, 10)).filter((c) => !isNaN(c) && c > 0);

    if (parsed.length !== cellCount) {
      alert(`Please enter capacity values for all ${cellCount} cells.`);
      return;
    }

    const validation = validateConfiguration(cellCount, series, parallel);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    try {
      const r = optimizeCellConfiguration(parsed, series, parallel);
      const b = calculateOptimizationBenefit(parsed, series, parallel);
      setResult(r);
      setBenefit(b);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      alert("Error during optimization: " + error.message);
    }
  }, [capacities, cellCount, series, parallel]);

  return (
    <div className="app-container">
      <Header />
      <main>
        <CellCapacities
          cellCount={cellCount}
          capacities={capacities}
          onCellCountChange={handleCellCountChange}
          onCapacityChange={handleCapacityChange}
          onBulkApply={handleBulkApply}
        />
        <Configuration
          cellCount={cellCount}
          series={series}
          parallel={parallel}
          onConfigChange={handleConfigChange}
          onOptimize={handleOptimize}
        />
        {result && (
          <div ref={resultsRef}>
            <Results result={result} benefit={benefit} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

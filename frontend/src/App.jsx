import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Plot from "./components/Plot.jsx";

import { useState } from "react";


export default function App() {
  const [sideOpen, setSideOpen] = useState(true);
  const [portfolio, setPortfolio] = useState(["AAPL", "MSFT"]);
  const addTicker = (t) => setPortfolio((p) => [...new Set([...p, t])]);
  const removeTicker = (t) => setPortfolio((p) => p.filter((x) => x !== t));


  return (
    <BrowserRouter>
      <div className="flex flex-col h-full z-0">
        <header className='flex items-center gap-2 p-3 bg-gray-300 text-gray-700' >
          <h1 className='text-2xl'>Time Traveller</h1>
        </header>
        <div className='sticky top-0 w-64 z-20'>
          <button onClick={() => setSideOpen((o) => !o)}
            className="px-2 py-1 cursor-pointer hover:bg-gray-200"
          >
            ☰
          </button>
          <Sidebar
            portfolio={portfolio}
            onAdd={addTicker}
            onRemove={removeTicker}
            isOpen={sideOpen}
          />
        </div>
        <main className='h-full z-10 ml-5 lg:ml-56'>
          {portfolio.map((ticker, i) => (
            <Plot ticker={ticker} />
          ))}
        </main>
      </div>
    </BrowserRouter>
  );
}

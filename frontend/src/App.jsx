import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import { useState } from "react";


export default function App() {
  const [sideOpen, setSideOpen] = useState(true);
  const [portfolio, setPortfolio] = useState(["AAPL", "MSFT"]);
  const addTicker = (t) => setPortfolio((p) => [...new Set([...p, t])]);
  const removeTicker = (t) => setPortfolio((p) => p.filter((x) => x !== t));


  return (
    <BrowserRouter className="flex flex-col h-full">
      <header className='flex items-center gap-2 p-3 bg-gray-300 text-gray-700' >
        <h1 className='text-2xl'>Time Traveller</h1>
      </header>
      <div className='w-64'>
        <button onClick={() => setSideOpen((o) => !o)}
          className="px-2 py-1 cursor-pointer rounded hover:bg-gray-200"
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
      <main>

      </main>

      <footer>
        <small>Time Traveller — Not financial advice</small>
      </footer>
    </BrowserRouter>
  );
}

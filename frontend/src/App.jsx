import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Plot from "./components/Plot.jsx";
import AuthModal from "./components/AuthModal.jsx";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




export default function App() {
  const side = localStorage.getItem("sideOpen");
  const [sideOpen, setSideOpen] = useState(side ? JSON.parse(side) : true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const [portfolio, setPortfolio] = useState(["AAPL", "MSFT"]);
  const addTicker = (t) => setPortfolio((p) => [...new Set([...p, t])]);
  const removeTicker = (t) => setPortfolio((p) => p.filter((x) => x !== t));

  useEffect(() => {
    localStorage.setItem("sideOpen", JSON.stringify(sideOpen));
  }, [sideOpen]);

  function handleTickerError() {
    toast.error("Ticker Not Found");
  }

  return (
    <BrowserRouter>
    <ToastContainer
    position="bottom-left"
    />
      <div className="flex flex-col h-full z-0">
        <header className='flex items-center justify-between gap-2 p-3 bg-gray-300 text-gray-700' >
          <h1 className='text-2xl'>Time Traveller</h1>
          <button className='cursor-pointer text-xl' onClick={() => setMenuOpen((o) => !o)}>
            ☰
          </button>
          {menuOpen ? (
            <ul className='absolute z-20 right-8 top-10 bg-gray-200 text-gray-700 p-4 rounded-lg'>
              <li className='cursor-pointer mb-2'
                onClick={() => {
                  setLoginOpen((o) => !o);
                  setMenuOpen(false);
                }}
              >Login</li>
              <li className='cursor-pointer'
                onClick={() => {
                  setSignupOpen((o) => !o);
                  setMenuOpen(false);
                }}
              >Signup</li>
            </ul>
          ) : (
            <></>
          )}
          <AuthModal openLogin={loginOpen}
            openSignup={signupOpen}
            onClose={() => {
              setLoginOpen(false);
              setSignupOpen(false);
            }}
            onSwap={() => {
              setLoginOpen(!loginOpen);
              setSignupOpen(!signupOpen);
            }}
          />
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
        <main className='h-full z-10 overflow-y-auto border pb-5 rounded-lg xs:ml-5 lg:ml-56'>
          {portfolio.map((ticker, i) => (
            <Plot key={i} ticker={ticker} onRemove={removeTicker} tickerError={handleTickerError} />
          ))}
        </main>
      </div>
    </BrowserRouter>
  );
}

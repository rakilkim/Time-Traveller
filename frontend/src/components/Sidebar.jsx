import { useState } from "react";

export default function Sidebar({ portfolio, onAdd, onRemove, isOpen }) {
  const [query, setQuery] = useState("");
  console.log(isOpen);


  return (
    <aside className={
        `relative w-64 max-w-[80vw] bg-gray-800 text-gray-100 p-4 overflow-y-auto transition-transform duration-300 transform ${isOpen ? '-translate-x-11/12' : ''} `
      } aria-hidden={!isOpen}>
        
      <h2>Portfolio</h2>

      {/* search box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) {
            onAdd(query.trim().toUpperCase());
            setQuery("");
          }
        }}
      >
        <label className='sr'>
          <input
            type="text"
            placeholder="Add ticker…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            required
            className='w-full px-2 py-1 rounded bg-gray-700 placeholder-gray-400'
          />
        </label>
      </form>

      <ul>
        {portfolio.map((tkr) => (
          <li key={tkr}>
            <button 
            onClick={() => onRemove(tkr)} 
            aria-label={`Remove ${tkr}`}
            className='mr-2'
            >
              ✕
            </button>
            <span>{tkr}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

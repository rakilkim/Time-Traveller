import { useState } from "react";

export default function Sidebar({ portfolio, onAdd, onRemove, isOpen }) {
  const [query, setQuery] = useState("");

  return (
    <aside className={
        `absolute w-56 max-w-[80vw] bg-gray-200 text-gray-700 p-4 rounded-lg overflow-y-auto transition-transform duration-300 transform ${!isOpen ? '-translate-x-11/12' : ''} opacity-95`
      } aria-hidden={!isOpen}>
        
      <h2 className='text-xl'>Your Portfolio</h2>

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
            className='w-fit px-2 py-1 rounded bg-gray-400 placeholder-gray-500'
          />
        </label>
      </form>

      <ul>
        {portfolio.map((tkr) => (
          <li key={tkr}>
            <button 
            onClick={() => onRemove(tkr)} 
            aria-label={`Remove ${tkr}`}
            className='mr-2 px-1 py-0 cursor-pointer rounded-4xl hover:bg-gray-300'
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

import Sidebar from "./components/Sidebar.jsx";
import Plot from "./components/Plot.jsx";
import AuthModal from "./components/AuthModal.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
////////////TODO: change the menu icon when logged in, make sign out option inside it, also check that password is same as confirm password 
export default function App() {
  const { user, addTickerAPI, removeTickerAPI, logout } = useAuth();

  const side = localStorage.getItem("sideOpen");
  const [sideOpen, setSideOpen] = useState(side ? JSON.parse(side) : true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const [portfolio, setPortfolio] = useState(["AAPL", "MSFT"]);
  const addTicker = async (t) => {
    setPortfolio((p) => [...new Set([...p, t])]);
    if (user) {
      try {
        addTickerAPI(t);
      } catch (err) {
        setPortfolio((p) => p.filter((x) => x !== t));
        console.log(err);
      }
    }
  }
  const removeTicker = async (t) => {
    setPortfolio((p) => p.filter((x) => x !== t));
    if (user) {
      try {
        removeTickerAPI(t);
      } catch (err) {
        setPortfolio((p) => [...new Set([...p, t])]);
        console.log(err);
      }
    }
  }

  useEffect(() => {
    if (user) setPortfolio(user.tickers);
    else setPortfolio(["AAPL", "MSFT"]);
  }, [user])

  useEffect(() => {
    localStorage.setItem("sideOpen", JSON.stringify(sideOpen));
  }, [sideOpen]);

  function handleToast(status, message) {
    if (status === "error") {
      toast.error(message);
    }
    else {
      toast.success(message);
    }
  }

  return (
    <>
      <ToastContainer
        position="bottom-left"
      />
      <div className="flex flex-col h-full z-0">
        <header className="flex items-center justify-between gap-2 p-3 bg-gray-300 text-gray-700 z-30" >
          <h1 className="text-2xl">Time Traveller</h1>
          <button className="cursor-pointer text-xl z-10" onClick={() => setMenuOpen((o) => !o)}>
            ☰
          </button>
          {menuOpen ? (
            <>
              {user ? (
                <ul
                  className="absolute right-8 top-10 bg-gray-200 text-gray-700 p-4 rounded-lg shadow"
                  role="menu"
                >
                  <li>
                    <button
                      className="cursor-pointer mb-2"
                      onClick={() => {
                        logout();
                        setMenuOpen((o) => !o);
                        toast.success("Signed out");
                      }}
                    >Sign out</button>
                  </li>
                </ul>
              ) : (
                <ul
                  className="absolute right-8 top-10 bg-gray-200 text-gray-700 p-4 rounded-lg shadow"
                  role="menu"
                >
                  <li>
                    <button
                      className="cursor-pointer mb-2"
                      onClick={() => {
                        setLoginOpen((o) => !o);
                        setMenuOpen(false);
                      }}
                    >Login</button>
                  </li>
                  <li>
                    <button
                      className="cursor-pointer"
                      onClick={() => {
                        setSignupOpen((o) => !o);
                        setMenuOpen(false);
                      }}
                    >Signup</button>
                  </li>
                </ul>
              )}
            </>
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
            onToast={handleToast}
          />
        </header>
        <div className="sticky top-0 w-64 z-20">
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
        <main className="h-full z-10 overflow-y-auto border pb-5 rounded-lg xs:ml-5 lg:ml-56">
          {portfolio.map((ticker, i) => (
            <Plot key={i} ticker={ticker} onRemove={removeTicker} tickerError={() => handleToast("error", "Ticker Not Found")} />
          ))}
        </main>
      </div>
    </>
  );
}

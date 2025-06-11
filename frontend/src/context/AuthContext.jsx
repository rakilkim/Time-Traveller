// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, register as apiRegister, getUser, addTicker, removeTicker } from "../api/auth";

const Auth = createContext(null);
export const useAuth = () => useContext(Auth);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // try auto-login on first mount
        getUser()
            .then(setUser)
            .catch((err) => console.log(err));
    }, []);

    const login = async (email, password) => {
        await apiLogin({ email, password });
        const u = await getUser();
        setUser(u);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    const register = async (username, email, password) => {
        await apiRegister({ username, email, password });
        // auto-login after register
        await login(email, password);
    };

    const addTickerAPI = async (ticker) => {
        await addTicker(ticker);
    };

    const removeTickerAPI = async (ticker) => {
        await removeTicker(ticker);
    };

    return (
        <Auth.Provider value={{ user, login, logout, register, addTickerAPI, removeTickerAPI, }}>
            {children}
        </Auth.Provider>
    );
}

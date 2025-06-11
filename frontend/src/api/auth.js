const BASE = "http://localhost:3000";

export async function register({ username, email, password }) {
    const r = await fetch(`${BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });

    if (!r.ok) throw new Error((await r.json()).error);
}

export async function login({ email, password }) {
    const r = await fetch(`${BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!r.ok) throw new Error((await r.json()).error);
    const { token } = await r.json();
    localStorage.setItem("token", token);
    return token;
}

export async function getUser() {
    const token = localStorage.getItem("token");
    const r = await fetch(`${BASE}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!r.ok) throw new Error("Not logged in");
    return r.json();
}

export async function addTicker(ticker) {
    const token = localStorage.getItem("token");
    const email = (await getUser()).email;
    await fetch(`${BASE}/api/addticker`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, ticker }),
    });
}

export async function removeTicker(ticker) {
    const token = localStorage.getItem("token");
    const email = (await getUser()).email;
    await fetch(`${BASE}/api/removeticker`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, ticker }),
    });
}

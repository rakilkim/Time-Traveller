import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner.jsx";

export default function LoginModal({ openLogin, openSignup, onClose, onSwap, onToast }) {
    const { login, register } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setLoading(true);
            if (openSignup) {
                if (password != confirmPassword) {
                    onToast("error", "Confirm password again");
                    setLoading(false);
                    return;
                }
                await register(username, email, password);
            }
            else if (openLogin) {
                await login(email, password);
            }
            setLoading(false);
            onClose();
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setUsername("");
            onToast("success", "Login Successful");
        } catch (err) {
            setLoading(false);
            if (err == "Error: 401")
                onToast("error", String(err));
            else
                onToast("error", String(err));
            console.log(err);
        }
    }

    if (!openLogin && !openSignup) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 flex justify-center items-center bg-black/20 z-30"
            onClick={() => {
                onClose();
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setUsername("");
            }}
            aria-label="Authentication modal background"
            >
            <form
                className="flex flex-col py-5 w-11/12 xs:w-3/4 md:w-1/2 lg:w-5/12 xl:w-1/3 p-3 gap-4 bg-white rounded-lg"
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-heading"
            >
                {openLogin ? (
                <h2 id="auth-heading" className="text-xl text-center">Login</h2>
                ) : (
                <h2 id="auth-heading" className="text-xl text-center">Signup</h2>
                )}

                <label className='flex flex-col'>
                Email:
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border ml-1 border-gray-400 rounded-md"
                    aria-label="Email address"
                />
                </label>

                <label className='flex flex-col'>
                Password:
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border ml-1 border-gray-400 rounded-md"
                    aria-label="Password"
                />
                </label>

                {openSignup ? (
                <>
                    <label className='flex flex-col'>
                    Confirm Password:
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="border ml-1 border-gray-400 rounded-md"
                        aria-label="Confirm password"
                    />
                    </label>

                    <label className='flex flex-col'>
                    Username:
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="border ml-1 border-gray-400 rounded-md"
                        aria-label="Username"
                    />
                    </label>

                    <small>
                    Already have an account?
                    <button
                        onClick={onSwap}
                        className="ml-1 font-bold cursor-pointer"
                        aria-label="Switch to login"
                    >
                        Log in
                    </button>
                    </small>
                </>
                ) : (
                <small>
                    Don't have an account?
                    <button
                    type="button"
                    onClick={onSwap}
                    className="ml-1 font-bold cursor-pointer"
                    aria-label="Switch to signup"
                    >
                    Sign up
                    </button>
                </small>
                )}

                <button
                type="submit"
                className="border font-bold rounded-md cursor-pointer my-5"
                aria-label="Submit login or signup form"
                >
                Continue
                </button>
            </form>

            {loading ? (
                <div className="fixed left-[48%] top-5" aria-label="Loading spinner">
                <Spinner message={"Authenticating..."} />
                </div>
            ) : (
                <></>
            )}
            </div>

    )
}
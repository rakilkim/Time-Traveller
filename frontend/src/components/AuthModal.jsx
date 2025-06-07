import { useState } from "react";

export default function LoginModal({ openLogin, openSignup, onClose, onSwap }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    async function handleSubmit(e) {
        e.preventDefault();
    }

    if (!openLogin && !openSignup) {
        return null;
    }

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black/20 z-30"
            onClick={onClose}
        >
            <form className="flex flex-col w-11/12 xs:w-3/4 md:w-1/2 lg:w-5/12 xl:w-1/3 p-3 gap-10 bg-white rounded-lg"
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
            >
                {openLogin ? (
                    <h2 className="text-xl text-center">Login</h2>

                ) : (
                    <h2 className="text-xl text-center">Signup</h2>

                )}
                <label>
                    Email:
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border ml-1 border-gray-400 rounded-md"
                    />
                </label>
                <label>
                    Password:
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border ml-1 border-gray-400 rounded-md"

                    />
                </label>
                {openSignup ? (
                    <>
                        <label>
                            Confirm Password:
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="border ml-1 border-gray-400 rounded-md"
                            />
                        </label>
                        <small>Already have an account?
                            <button
                                onClick={onSwap}
                                className="ml-1 font-bold cursor-pointer"
                            >Log in
                            </button>
                        </small>
                    </>
                ) : (
                    <small>Don"t have an account?
                        <button
                            onClick={onSwap}
                            className="ml-1 font-bold cursor-pointer"
                        >Sign up
                        </button>
                    </small>
                )}
                <button type="submit" className="border font-bold rounded-md">
                    Continue
                </button>
            </form>
        </div>
    )
}
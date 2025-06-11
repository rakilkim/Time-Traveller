export default function Spinner({ message }) {
    return (
        <div
            role="status"
            aria-live="polite"
            className="absolute top-1/4 md:top-1/3 left-1/2 flex flex-col items-center justify-center"
        >
            <svg
                className="animate-spin h-8 w-8 text-blue-600"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
            </svg>
            <small className="absolute w-max top-10">{message}</small>
        </div>
    )
}
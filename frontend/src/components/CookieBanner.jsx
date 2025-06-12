import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [open, setOpen] = useState(false);

  // show banner only if user hasn't accepted before
  useEffect(() => {
    if (!localStorage.getItem("cookie-consent")) setOpen(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "true");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="
        fixed bottom-4 left-1 right-1 md:left-auto md:max-w-md
        bg-gray-800 text-gray-50 px-4 py-3 rounded-lg shadow-lg
        flex flex-col sm:flex-row items-center gap-x-2 z-50
      "
    >
      <span className="flex-1 text-sm">
        This website uses cookies to improve your experience. By continuing,
        you accept our <a href="/" className="underline">cookie policy</a>.
      </span>

      <button
        onClick={accept}
        className="
          mt-2 sm:mt-0
          bg-blue-600 text-white text-sm
          px-3 py-1 rounded cursor-pointer
        "
      >
        Got it
      </button>
    </div>
  );
}

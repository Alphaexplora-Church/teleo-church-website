import { Suspense, useEffect } from "react";
import { useLocation, useRoutes } from "react-router-dom";
import { routes } from "./routes.config";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const adminMain = document.getElementById("admin-main-viewport");
    if (adminMain) {
      adminMain.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname, hash]);

  return null;
}

function RouteElements() {
  return useRoutes(routes);
}

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="grid min-h-screen place-items-center bg-[#002E38]">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[#EC662C]" />
          </div>
        }
      >
        <RouteElements />
      </Suspense>
    </>
  );
}

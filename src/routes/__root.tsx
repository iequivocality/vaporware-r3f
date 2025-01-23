import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
	component: () => (
		<main className="w-screen h-screen bg-gray-900 text-white text-2xl">
			<nav className="w-full p-2 flex justify-between items-center px-8 py-4">
        <h1>vaporware-r3f</h1>
        <div className="flex gap-4">
          <Link to="/" className="grid place-items-center [&.active]:underline w-24">
            Vaporware
          </Link>{" "}
          <Link to="/shaderfun" className="grid place-items-center [&.active]:underline w-24">
            ShaderFun
          </Link>
        </div>
			</nav>
			<Outlet />
			<TanStackRouterDevtools />
		</main>
	),
});

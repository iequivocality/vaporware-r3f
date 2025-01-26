import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
	component: () => (
		<main className="grid grid-cols-12 w-screen h-screen bg-gray-900 text-white text-2xl">
			<nav className="w-full p-2 flex-col justify-between items-center px-8 py-4 col-span-2">
				<h1 className="font-bold h-32 grid place-items-center">
					vaporware-r3f
				</h1>
				<div className="flex flex-col gap-4">
					<Link
						to="/"
						className="grid place-items-center [&.active]:underline w-24"
					>
						Vaporware
					</Link>{" "}
					<Link
						to="/shaderfun"
						className="grid place-items-center [&.active]:underline w-24"
					>
						ShaderFun
					</Link>
				</div>
			</nav>
			<div className="col-span-10">
				<Outlet />
			</div>
			<TanStackRouterDevtools />
		</main>
	),
});

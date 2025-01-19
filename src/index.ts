import path from "path";
import fg from "fast-glob";

export interface Route {
    path: string;
    filePath: string;
}

export async function generateRoutes(directory: string): Promise<Route[]> {
    const files = await fg("**/*.html", { cwd: directory });
    return files.map((file: string) => {
        const routePath = file
            .replace(/index\.html$/, "") // Remove `index.html`
            .replace(/\.html$/, "") // Remove `.html`
            .replace(/\[([^\]]+)\]/g, ":$1"); // Convert `[id]` to `:id`

        return {
            path: `/${routePath}`.replace(/\/+/g, "/"), // Ensure single slash
            filePath: path.join(directory, file),
        };
    });
}

generateRoutes("./routes").then((routes) => {
    console.log(routes);
});

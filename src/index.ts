import express from "express";
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

const app = express();
const PORT = 6999;

generateRoutes("./routes").then((routes) => {
    routes.forEach((route) => {
        app.get(route.path, (req, res) => {
            res.sendFile(path.resolve(route.filePath)); // Serve the HTML file
        });
    });

    // Start the server
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log("Available routes:");
        routes.forEach((route) =>
            console.log(`Path: ${route.path} -> File: ${route.filePath}`)
        );
    });
});

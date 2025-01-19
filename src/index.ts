import express from "express";
import path from "path";
import fg from "fast-glob";

export interface Route {
    path: string;
    filePath: string;
}

export async function generateRoutes(directory: string): Promise<Route[]> {
    const files = await fg("**/*.html", { cwd: directory }); // get all html files
    return files.map((file: string) => {
        const routePath = file
            .replace(/index\.html$/, "") // index.html -> path : "/"
            .replace(/\.html$/, "") // `{dir}/{file}.html` -> path : "/{dir}/{file}"
            .replace(/\[([^\]]+)\]/g, ":$1"); // [id] -> path : ":id"

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
            // Check for dynamic route parameters (e.g., :id)
            if (req.params) {
                console.log(`Dynamic route accessed: ${route.path}`);
                console.log("Route Parameters:", req.params); // Log dynamic parameters
            }
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

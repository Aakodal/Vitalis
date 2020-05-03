import { promises as fs } from "fs";
import * as path from "path";

export async function getPackageJsonPath() {
	for (const modulePath of module.paths) {
		const folderPath = path.join(modulePath, "../");
		const files = await fs.readdir(folderPath);
		const filesMatching = files.filter((file) => file === "package.json");

		if (!filesMatching[0]) continue;

		return path.join(folderPath, filesMatching[0]);
	}
}

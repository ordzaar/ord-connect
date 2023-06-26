const { readdirSync, readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

function setPackageVersions(rootDir, version) {
  const packageDirs = readdirSync(rootDir);
  for (const packageDir of packageDirs) {
    const packagePath = join(rootDir, packageDir, "package.json");
    const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));

    packageJson.version = version;
    packageJson.main = "./dist/index.js";

    if (packageJson.dependencies !== undefined) {
      for (const key in packageJson.dependencies) {
        if (packageJson.dependencies[key].includes("workspace:*")) {
          packageJson.dependencies[key] = version;
        }
      }
    }

    if (packageJson.devDependencies !== undefined) {
      for (const key in packageJson.devDependencies) {
        if (packageJson.devDependencies[key].includes("workspace:*")) {
          packageJson.devDependencies[key] = version;
        }
      }
    }

    if (packageJson.peerDependencies !== undefined) {
      for (const key in packageJson.peerDependencies) {
        if (packageJson.peerDependencies[key].includes("workspace:*")) {
          packageJson.peerDependencies[key] = version;
        }
      }
    }

    writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  }
}

module.exports = {
  setPackageVersions
};

const { resolve } = require("node:path");

const { setPackageVersions } = require("./utils/setPackageVersions");

const ROOT_DIR = resolve(__dirname, "..");
const PKGS_DIR = resolve(ROOT_DIR, "packages");
// const CONF_DIR = resolve(ROOT_DIR, "configs");

const VERSION = process.argv[process.argv.indexOf("--version") + 1];

setPackageVersions(PKGS_DIR, VERSION);
// setPackageVersions(CONF_DIR, VERSION);

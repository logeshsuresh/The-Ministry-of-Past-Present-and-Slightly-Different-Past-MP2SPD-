import path from "path";
import fs from "fs/promises";

class MP2SPD {

    constructor(repoPath = ".") {
        this.repoPath = path.join(repoPath, ".mp2spd");
        this.objectsPath = path.join(this.repoPath, "objects"); // .mp2spd/objects
        this.headPath = path.join(this.repoPath, "HEAD"); // .mp2spd/HEAD
        this.indexPath = path.join(this.repoPath, "index"); // .mp2spd/index
        this.init();
    }

    async init() {
        await fs.mkdir(this.objectsPath, { recursive: true });
        try {
            await fs.writeFile(this.headPath, "", { flag: "wx" }); // wx: open for writing, fail if the file exists
            await fs.writeFile(this.indexPath, JSON.stringify([]), { flag: "wx" });
        } catch (error) {
            console.log("Already initialized the .mp2spd folder");
        }
    }

}

const mp2spd = new MP2SPD();
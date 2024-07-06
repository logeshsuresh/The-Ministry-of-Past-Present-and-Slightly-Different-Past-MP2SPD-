import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

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

    hashObject(content) {
        return crypto
                .createHash("sha1")
                .update(content, "utf-8")
                .digest("hex");
    } 

    async add(fileToBeAdded) {
        // fileToBeAdded : path/to/file
        const fileData = await fs.readFile(fileToBeAdded, { encoding: "utf-8" });
        const fileHash = this.hashObject(fileData); // hash the file
        console.log(`File Hash : ${fileHash}`);
        const newFileHashedObjectPath = path.join(this.objectsPath, fileHash);
        await fs.writeFile(newFileHashedObjectPath, fileData);
        // add file to staging area
        await this.updateStagingArea(fileToBeAdded, fileHash);
        console.log(`Added ${fileToBeAdded}`);
    }

    async updateStagingArea(filePath, fileHash) {
        const index = JSON.parse(
                await fs.readFile(
                        this.indexPath, 
                        { encoding: "utf-8" }
                    )
                );
        index.push({ path: filePath, hash: fileHash });
        await fs.writeFile(this.indexPath, JSON.stringify(index));
    }

}

const mp2spd = new MP2SPD();
mp2spd.add("test.txt");
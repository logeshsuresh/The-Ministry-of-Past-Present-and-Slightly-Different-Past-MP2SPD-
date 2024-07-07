#!/usr/bin/env node

import chalk from "chalk";
import crypto from "crypto";
import { diffLines } from "diff";
import fs from "fs/promises";
import { Command } from "commander";
import path from "path";


const program = new Command();

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

    async commit(message) {
        const index = JSON.parse(await fs.readFile(this.indexPath, { encoding: "utf-8"}));
        const parentCommit = await this.getCurrentHead();
        
        const commitData = {
            timestamp: new Date().toISOString(),
            message,
            files: index,
            parent: parentCommit
        }

        const commitHash = this.hashObject(JSON.stringify(commitData));
        const commitPath = path.join(this.objectsPath, commitHash);
        await fs.writeFile(commitPath, JSON.stringify(commitData));
        // update HEAD to point to the new commit
        await fs.writeFile(this.headPath, commitHash); 
        // clear the staging area
        await fs.writeFile(this.indexPath, JSON.stringify([])); 
        console.log(`Commit successfully created : ${commitHash}`);
    }

    async getCurrentHead() {
        try {
            return await fs.readFile(this.headPath, { encoding : "utf-8"});
        } catch (error) {
            return null;
        }  
    }

    async log() {
        let currentCommitHash = await this.getCurrentHead();
        while (currentCommitHash) {
            const commitData = JSON.parse(
                await fs.readFile(
                    path.join(this.objectsPath, currentCommitHash), 
                    { encoding: "utf-8"}
                )
            );
            console.log("++++++++++++++++++++++++++++++++++++++++++++\n");
            console.log(`Commit: ${currentCommitHash}\nDate: ${commitData.timestamp}\n\n${commitData.message}\n`);
            console.log("++++++++++++++++++++++++++++++++++++++++++++");
            currentCommitHash = commitData.parent;
        }
    }

    async showCommitDiff(commitHash) {
        const commitData = JSON.parse(await this.getCommitData(commitHash));
        if (!commitData) {
            console.log("Commit not found");
            return;
        }
        console.log("Changes in the last commit are: ");
        
        for (const file of commitData.files) {
            console.log(`File: ${file.path}`);
            const fileContent = await this.getFileContent(file.hash);
            console.log(fileContent);

            if (commitData.parent) {
                // get the parent commit data
                const parentCommitData = JSON.parse(await this.getCommitData(commitData.parent));
                const parentFileContent = await this.getParentFileContent(parentCommitData, file.path);
                if (parentFileContent !== undefined) {
                    console.log("\nDiff:");
                    const diff = diffLines(parentFileContent, fileContent);

                    console.log(diff);
                    console.log("\n");
                    diff.forEach(part => {
                        if (part.added) {
                            process.stdout.write("++ " + chalk.green(part.value));
                        } else if (part.removed) {
                            process.stdout.write("-- " + chalk.red(part.value));
                        } else {
                            process.stdout.write(chalk.grey(part.value));
                        }
                        console.log("\n");
                    });
                    console.log("\n");
                } else {
                    console.log("New file commit");
                }
            } else {
                console.log("First commit");
            }
        }
    }

    async getCommitData(commitHash) {
        const commitPath = path.join(this.objectsPath, commitHash);
        try {
            return await fs.readFile(commitPath, { encoding: "utf-8"});
        } catch (error) {
            console.log("Failed to read commit data (X)", error);
            return null;
        }
    }

    async getFileContent(fileHash) {
        const objectPath = path.join(this.objectsPath, fileHash);
        return fs.readFile(objectPath, { encoding: "utf-8" });
    }

    async getParentFileContent(parentCommitData, filePath) {
        const parentFile = parentCommitData.files.find(file => file.path === filePath);
        if (parentFile) {
            return await this.getFileContent(parentFile.hash);
        }
    }

}

program.command("init").action(async () => {
    const mp2spd = new MP2SPD();
});

program.command("add <file>").action(async (file) => {
    const mp2spd = new MP2SPD();
    await mp2spd.add(file);
});

program.command("commit <message>").action(async (message) => {
    const mp2spd = new MP2SPD();
    await mp2spd.commit(message);
});

program.command("log").action(async () => {
    const mp2spd = new MP2SPD();
    await mp2spd.log();
});

program.command("show <commitHash>").action(async (commitHash) => {
    const mp2spd = new MP2SPD();
    await mp2spd.showCommitDiff(commitHash);
});

program.parse(process.argv);

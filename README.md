# The Ministry of Past, Present and Slightly Different Past (MP2SPD)

Welcome to **The Ministry of Past, Present and Slightly Different Past (MP2SPD)**, a simple version control system inspired by Git. This project provides basic version control functionalities such as initializing a repository, adding files, committing changes, and viewing commit logs and differences.

## Features

- **Initialize Repository:** Create a new repository with a `.mp2spd` directory.
- **Add Files:** Stage files for the next commit.
- **Commit Changes:** Save changes to the repository with a commit message.
- **View Logs:** Display the commit history.
- **Show Differences:** Display the differences between the current commit and its parent.

## Installation

Make sure you have [Node.js](https://nodejs.org/) installed on your system.

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/mp2spd.git
    ```
2. Navigate to the project directory:
    ```sh
    cd mp2spd
    ```
3. Make the script executable:
    ```sh
    chmod +x mp2spd.js
    ```

## Usage

### Initialize a Repository

To initialize a new MP2SPD repository, run:
```sh
./mp2spd.js init

Add Files
To add a file to the staging area, run:

./mp2spd.js add <file>
Replace <file> with the path to the file you want to add.

Commit Changes
To commit the staged changes with a commit message, run:

./mp2spd.js commit "<message>"
Replace <message> with your commit message.

View Logs
To view the commit history, run:

./mp2spd.js log
Show Differences
To show the differences between a commit and its parent, run:

./mp2spd.js show <commitHash>
Replace <commitHash> with the hash of the commit you want to view.

Example
Here is an example workflow:

./mp2spd.js init

echo "Hello World" > hello.txt
./mp2spd.js add hello.txt

./mp2spd.js commit "Initial commit"

./mp2spd.js log

./mp2spd.js show <commitHash>
Note: Replace <commitHash> with the actual hash obtained from the ./mp2spd.js log command.
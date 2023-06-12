async function clearConsole() {
    process.stdout.write("\x1Bc");
}

async function main() {
    console.log("Hello World");
}

clearConsole().then(main).then();

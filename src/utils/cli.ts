import chalk from "chalk";
import _ from "lodash";

const ASCII_TITLE = `
              __    _            __ 
  _________ _/ /_  (_)___  ___  / /_
 / ___/ __ \`/ __ \\/ / __ \\/ _ \\/ __/
/ /__/ /_/ / /_/ / / / / /  __/ /_  
\\___/\\__,_/_.___/_/_/ /_/\\___/\\__/`
    .split("\n")
    .slice(1)
    .join("\n");

export const TITLE_WIDTH = _.chain(ASCII_TITLE).split("\n").map("length").max().value();

export function printTitle(version?: string) {
    console.log(chalk.cyan(ASCII_TITLE + (version ? ` v${version}` : "")));
}

export function drawLine(length = 25, ch = "_") {
    console.log(chalk.green(ch.repeat(length)));
}

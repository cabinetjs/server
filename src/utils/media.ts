import path from "path";
import fs from "fs-extra";
import tmp from "tmp";

import ffmpeg, { ScreenshotsConfig } from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";

import { createTempFile } from "@utils/fs";

ffmpeg.setFfmpegPath(ffmpegPath);

export async function screenshotVideo(file: string | Buffer, config: Omit<ScreenshotsConfig, "folder" | "filename">) {
    let video: tmp.FileResult | null = null;
    let filePath: string;
    if (Buffer.isBuffer(file)) {
        video = await createTempFile();
        await fs.writeFile(video.fd, file);

        filePath = video.name;
    } else {
        filePath = file;
    }

    const screenshot = await createTempFile({
        postfix: ".jpg",
    });

    await new Promise<void>((resolve, reject) => {
        ffmpeg(filePath)
            .on("end", () => {
                resolve();
            })
            .on("error", err => {
                reject(err);
            })
            .screenshots({
                ...config,
                folder: path.dirname(screenshot.name),
                filename: path.basename(screenshot.name),
            });
    });

    const screenshotBuffer = await fs.readFile(screenshot.name);
    screenshot.removeCallback();

    if (video) {
        video.removeCallback();
    }

    return screenshotBuffer;
}

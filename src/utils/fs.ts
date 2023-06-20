import tmp, { TmpNameOptions } from "tmp";

export function createTempFile(options?: TmpNameOptions) {
    return new Promise<tmp.FileResult>((resolve, reject) => {
        tmp.file(options || {}, (err, path, fd, cleanupCallback) => {
            if (err) {
                reject(err);
            } else {
                resolve({
                    name: path,
                    fd,
                    removeCallback: cleanupCallback,
                });
            }
        });
    });
}

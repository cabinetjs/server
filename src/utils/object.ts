import { Fn } from "@utils/types";

export function pickByDeep<T extends Record<string, unknown>>(object: T, fn: Fn<[string, any], boolean>): T {
    if (object === null || typeof object !== "object") {
        return object;
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(object)) {
        if (fn(key, value)) {
            result[key] = value;
        } else {
            continue;
        }

        if (Array.isArray(value)) {
            result[key] = value.map(item => pickByDeep(item, fn));
            continue;
        }

        if (typeof value === "object" && value !== null) {
            result[key] = pickByDeep(value as Record<string, unknown>, fn);
        }
    }

    return result as T;
}

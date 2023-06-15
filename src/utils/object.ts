import { Fn, Nullable } from "@utils/types";
import _ from "lodash";

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

export function isPrimitive(value: unknown): value is string | number | boolean | null | undefined | Date {
    return (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        value === null ||
        value === undefined ||
        value instanceof Date
    );
}

export function isEqual<T extends Record<string, any>>(left: Nullable<T>, right: Nullable<T>) {
    if (!left && !right) {
        return true;
    }

    if (!left || !right) {
        return false;
    }

    const leftKeys = Object.keys(left).filter(k => isPrimitive(left[k]));
    const rightKeys = Object.keys(right).filter(k => isPrimitive(right[k]));

    if (leftKeys.length !== rightKeys.length || _.difference(leftKeys, rightKeys).length > 0) {
        return false;
    }

    for (const key of leftKeys) {
        const leftValue = left[key];
        const rightValue = right[key];

        const isLeftNullish = leftValue === null || leftValue === undefined;
        const isRightNullish = rightValue === null || rightValue === undefined;
        if (isLeftNullish && isRightNullish) {
            continue;
        } else if (isLeftNullish || isRightNullish) {
            return false;
        }

        if (leftValue instanceof Date && rightValue instanceof Date) {
            if (leftValue.getTime() !== rightValue.getTime()) {
                return false;
            }
        }

        if (leftValue !== rightValue) {
            return false;
        }
    }

    return true;
}

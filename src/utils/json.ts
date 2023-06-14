import { JSONSchemaType } from "ajv";
import { IJsonApplication } from "typia";

import $RefParser from "@apidevtools/json-schema-ref-parser";

import { pickByDeep } from "@utils/object";

export async function composeJsonSchema<T>(item: IJsonApplication): Promise<JSONSchemaType<T>> {
    const data = await $RefParser.dereference(item);
    const schema: JSONSchemaType<T> = data["schemas"][0];

    return pickByDeep(schema, key => !key.startsWith("x-typia") && key !== "$id");
}

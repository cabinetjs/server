import fetch, { Response } from "node-fetch";

import { StringKeyOf } from "@utils/types";
import { buildSearchParams } from "@utils/url";

export interface FetchOptions {
    method: "GET" | "POST";
    headers?: Record<string, string>;
    params?: Record<string, string | number>;
}

export class Fetcher<TEndpointMap extends Record<string, any>> {
    private readonly baseUrl: string;

    public constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public async fetch<Endpoint extends StringKeyOf<TEndpointMap>>(
        endpoint: Endpoint,
        options?: FetchOptions,
    ): Promise<Response> {
        const { method, headers = {}, params } = options || { method: "GET" };
        const url = `${this.baseUrl}${endpoint}`;
        let urlWithParams = url;
        if (params) {
            const newParams = { ...params };
            for (const [key, value] of Object.entries(newParams)) {
                if (!urlWithParams.includes(`{${key}}`)) {
                    continue;
                }

                urlWithParams = urlWithParams.replace(new RegExp(`\{${key}\}`, "g"), value.toString());
                delete newParams[key];
            }

            urlWithParams += `?${buildSearchParams(params)}`;
        }

        const response = await fetch(urlWithParams, {
            method,
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${url}. (${response.status} ${response.statusText})`);
        }

        return response;
    }
    public async fetchJson<Endpoint extends StringKeyOf<TEndpointMap>>(
        endpoint: Endpoint,
        options?: FetchOptions,
    ): Promise<TEndpointMap[Endpoint]> {
        const response = await this.fetch(endpoint, options);

        return response.json();
    }
}

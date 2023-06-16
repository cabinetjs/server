import fetch, { Response } from "node-fetch";

import { StringKeyOf } from "@utils/types";
import { buildSearchParams } from "@utils/url";
import { Logger } from "@utils/logger";

export interface FetchOptions {
    method?: "GET" | "POST";
    headers?: Record<string, string>;
    params?: Record<string, string | number>;
    retryCount?: number;
}

export class Fetcher<TEndpointMap extends Record<string, any> = never> {
    private readonly baseUrl: string;
    private readonly logger = new Logger(Fetcher.name);

    public constructor(baseUrl?: string) {
        this.baseUrl = baseUrl ?? "";
    }

    public async fetch<Endpoint extends StringKeyOf<TEndpointMap>>(
        endpoint: Endpoint,
        options?: FetchOptions,
    ): Promise<Response> {
        const { method = "GET", headers = {}, params, retryCount = 5 } = options ?? {};

        try {
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
        } catch (error) {
            let errorMessage: string;
            let stack: string | undefined;
            if (error instanceof Error) {
                errorMessage = error.message;
                stack = error.stack;
            } else {
                errorMessage = `${error}`;
            }

            if (retryCount > 0) {
                this.logger.warn(`Failed to fetch data from {cyan}: {red}`, undefined, `'${endpoint}'`, errorMessage);
                this.logger.warn("Remaining retry count: {cyan}", undefined, retryCount);

                return this.fetch(endpoint, {
                    ...options,
                    method,
                    headers,
                    params,
                    retryCount: retryCount - 1,
                });
            }

            this.logger.error("Failed to fetch data from {cyan}.", undefined, undefined, `'${endpoint}'`);
            this.logger.error("Error: {red}", stack, undefined, errorMessage);

            throw error;
        }
    }
    public async fetchJson<Endpoint extends StringKeyOf<TEndpointMap>>(
        endpoint: Endpoint,
        options?: FetchOptions,
    ): Promise<TEndpointMap[Endpoint]> {
        const response = await this.fetch(endpoint, options);

        return response.json();
    }

    public async download(endpoint: string, options?: FetchOptions): Promise<Buffer> {
        const response = await this.fetch(endpoint as StringKeyOf<TEndpointMap>, options);

        return response.buffer();
    }
}

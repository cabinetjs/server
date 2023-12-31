import { Provider } from "@nestjs/common";

import { Config, CONFIG_DATA } from "@config/config.module";

export const configMockFactory: () => Config = jest.fn(() => ({
    dataSources: [],
    crawlInterval: 1,
    storage: {
        type: "local",
        path: "",
    },
}));

export const configMock: Provider = {
    provide: CONFIG_DATA,
    useFactory: configMockFactory,
};

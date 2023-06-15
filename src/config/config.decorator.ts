import { Inject } from "@nestjs/common";

import { CONFIG_DATA } from "@config/config.module";

export function InjectConfig() {
    return Inject(CONFIG_DATA);
}

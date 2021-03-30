/***************************************************************************************************
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

import * as core from "@actions/core";
import * as io from "@actions/io";
import * as os from "os";
import { getInputs } from "./context";
import { execute } from "./utils";
import * as stateHelper from './state-helper';

let podmanPath: string | undefined;

async function getPodmanPath(): Promise<string> {
    if (podmanPath == null) {
        podmanPath = await io.which("podman", true);
        await execute(podmanPath, [ "version" ]);
    }

    return podmanPath;
}

async function run(): Promise<void> {
    if (os.platform() !== "linux") {
        throw new Error("Only supported on linux platform");
    }

    const {
        registry, username, password, logout,
    } = getInputs();

    stateHelper.setLogout(logout);

    const args = [
        "login",
        registry,
        "-u",
        username,
        "-p",
        password,
    ];

    await execute(await getPodmanPath(), args);
    core.info(`✅ Successfully logged in to ${registry}`);

    // if (logout) {
    //     await execute(await getPodmanPath(), [ "logout", registry ]);
    // }
}

async function logout(): Promise<void> {
    if (!stateHelper.logout) {
        return;
      }
    await execute(await getPodmanPath(), [ "logout", "quay.io" ]);
}

if (!stateHelper.IsPost) {
    run().catch(core.setFailed);;
}
else {
    logout().catch(core.setFailed);;
}

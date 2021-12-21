// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

"use strict";

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..')
const PACKAGES_DIR = path.join(ROOT, 'packages');
const CALLING_STATEFUL_CLIENT = path.join(PACKAGES_DIR, 'calling-stateful-client');

function _writeEnvFile(pkg) {
    fs.writeFileSync(
        path.join(pkg, '.env'),
        'FLAVOR=stable'
    )
}

function findAllPackages(root){
    return fs.readdirSync(root).map(
        (pkg) => {
            const packageJSON = path.join(root, pkg, 'package.json');
            const stat = fs.lstatSync(packageJSON);
            if (!stat.isFile()) {
                throw new Error(packageJSON + ' does not exist!');
            }
            return path.join(root, pkg);
        }
    )
}


function main() {
    const packages = findAllPackages(PACKAGES_DIR);
    packages.forEach((pkg) => _writeEnvFile(pkg));

    // TODO execSync is not reliable.
    execSync('rush purge', { stdio: 'inherit'});
}

main();
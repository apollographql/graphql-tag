#!/usr/bin/env bash
set -euo pipefail
TS_VERSION=$(node -e "console.log(require('typescript').version)" | cut -d. -f1)
PATH="./node_modules/.bin:$PATH"
if [ "$TS_VERSION" -ge 4 ]; then
	# Only Typescript 4.9+ supports the `--ignoreDeprecations` flag.
	exec tsc --ignoreDeprecations 6.0
else
	exec tsc
fi

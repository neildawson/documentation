#!/usr/bin/env bash

set -e

grpc_doc_owner=vegaprotocol
grpc_doc_repo=sdk-docs
grpc_doc_branch="v0.47.0"

gh_token="${GITHUB_API_TOKEN:?}"

create_venv() {
	venv="$PWD/.venv"
	# Find python binary in a way which works on Netlify and elsewhere
	python="$(command -v python3.7 || command -v python3)"
	if test -z "$python" ; then
		echo "Failed to find Python"
		exit 1
	fi
	test -d "$venv" || virtualenv --quiet -p "$python" "$venv" 1>/dev/null
	# shellcheck disable=SC1091
	source "$venv/bin/activate"
	gh="$(grep ^PyGithub== requirements.txt)"
	pip freeze | grep -q '^'"$gh"'$' || pip install --quiet -r requirements.txt 1>/dev/null
}

create_venv

python3 scripts/github_get_file.py \
	--outdir . \
	--token "$gh_token" \
	--owner "${grpc_doc_owner:?}" \
	--repo "${grpc_doc_repo:?}" \
	--branch "${grpc_doc_branch:?}" \
	--file generated/doc.json
mv ./generated/doc.json ./proto.json
rm -rf ./generated

deactivate

# This var is used in docusaurus.config.js.
export VEGA_VERSION="$grpc_doc_branch"

yarn install
yarn run generate-graphql
yarn run generate-grpc
yarn run build
yarn run prettier

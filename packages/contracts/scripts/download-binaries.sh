#!/bin/bash

# depending on the os/platform - download eth-rpc and revive-dev-node into .bin folder

# Download function with error handling
download_file() {
  local url="$1"
  local output_path="$2"
  local description="$3"
  local curl_flags="$4"

  if ! curl $curl_flags --fail "$url" -o "$output_path"; then
    echo "Error: Failed to download $description from $url"
    exit 1
  fi
}

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m | tr '[:upper:]' '[:lower:]')

# Map architecture names to match binary naming convention
if [ "$ARCH" = "x86_64" ]; then
  ARCH="x64"
elif [ "$ARCH" = "aarch64" ]; then
  ARCH="arm64"
fi

REVIVE_NODE=revive-dev-node-${OS}-${ARCH}
ANVIL_NODE=anvil-polkadot-${OS}-${ARCH}
ETH_RPC=eth-rpc-${OS}-${ARCH}
RESOLC_BIN=""
BIN_DIR=bin

NODES_VERSION=19907546951 # for now setting fixed version as 'latest' currently resolves to 18137608118 with which 1 test fails
NODES_VERSION=${NODES_VERSION:-'latest'}
ANVIL_VERSION=19739036611
RESOLC_VERSION=${RESOLC_VERSION:-'v0.6.0'}

echo "downloading nodes version: $NODES_VERSION"
echo "resolc version: $RESOLC_VERSION"

checksums_url="https://github.com/paritytech/hardhat-polkadot/releases/download/nodes-${NODES_VERSION}/checksums.txt"
anvil_checksums_url="https://github.com/paritytech/hardhat-polkadot/releases/download/anvil-polkadot-nodes-${ANVIL_VERSION}/checksums.txt"
resolc_checksums_url="https://github.com/paritytech/revive/releases/download/${RESOLC_VERSION}/checksums.txt"
echo "checksums_url: $checksums_url"
echo "anvil_checksums_url: $anvil_checksums_url"
echo "resolc_checksums_url: $resolc_checksums_url"

# Download checksums with error handling
download_file "${checksums_url}" "/tmp/node-${NODES_VERSION}-checksums.txt" "node checksums" "-sL"
download_file "${anvil_checksums_url}" "/tmp/anvil-${ANVIL_VERSION}-checksums.txt" "anvil checksums" "-sL"
download_file "${resolc_checksums_url}" "/tmp/resolc-${RESOLC_VERSION}-checksums.txt" "resolc checksums" "-sL"
CURRENT_NODES_CHECKSUM=$(cat ${BIN_DIR}/checksums.txt 2>/dev/null | tr -s ' ' ) || echo ""
NEW_NODES_CHECKSUM=$(cat /tmp/node-${NODES_VERSION}-checksums.txt | tr -s ' ')
CURRENT_ANVIL_CHECKSUM=$(cat ${BIN_DIR}/anvil-checksums.txt 2>/dev/null | tr -s ' ' ) || echo ""
NEW_ANVIL_CHECKSUM=$(cat /tmp/anvil-${ANVIL_VERSION}-checksums.txt | tr -s ' ')
CURRENT_RESOLC_CHECKSUM=$(cat ${BIN_DIR}/resolc-checksums.txt 2>/dev/null | tr -s ' ' ) || echo ""
NEW_RESOLC_CHECKSUM=$(cat /tmp/resolc-${RESOLC_VERSION}-checksums.txt | tr -s ' ')

mkdir -p ${BIN_DIR}

if [ "$CURRENT_NODES_CHECKSUM" != "$NEW_NODES_CHECKSUM" ]; then
  dev_node_url="https://github.com/paritytech/hardhat-polkadot/releases/download/nodes-${NODES_VERSION}/${REVIVE_NODE}"
  eth_rpc_url="https://github.com/paritytech/hardhat-polkadot/releases/download/nodes-${NODES_VERSION}/${ETH_RPC}"
  echo "dev_node_url: $dev_node_url"
  echo "eth_rpc_url: $eth_rpc_url"

  download_file "${dev_node_url}" "${BIN_DIR}/revive-dev-node" "revive-dev-node" "-L"
  download_file "${eth_rpc_url}" "${BIN_DIR}/eth-rpc" "eth-rpc" "-L"
  cp /tmp/node-${NODES_VERSION}-checksums.txt ${BIN_DIR}/checksums.txt
else
  echo "Checksums match, skipping download"
fi

if [ "$CURRENT_ANVIL_CHECKSUM" != "$NEW_ANVIL_CHECKSUM" ]; then
  anvil_url="https://github.com/paritytech/hardhat-polkadot/releases/download/anvil-polkadot-nodes-${ANVIL_VERSION}/${ANVIL_NODE}"
  echo "anvil_url: $anvil_url"

  download_file "${anvil_url}" "${BIN_DIR}/anvil-polkadot" "anvil-polkadot" "-L"
  cp /tmp/anvil-${ANVIL_VERSION}-checksums.txt ${BIN_DIR}/checksums.txt
else
  echo "Checksums match, skipping download"
fi

if [ "$CURRENT_RESOLC_CHECKSUM" != "$NEW_RESOLC_CHECKSUM" ]; then
  if [ "$OS" = "darwin" ]; then
    RESOLC_BIN="universal-apple-darwin"
  elif [ "$OS" = "linux" ]; then
    RESOLC_BIN="x86_64-unknown-linux-musl"
  else
    echo "Unsupported OS: $OS"
    exit 1
  fi

  if [ "$OS" = "linux" ] && [ "$ARCH" != "x64" ]; then
    echo "Unsupported architecture: $ARCH for linux"
    exit 1
  fi

  download_file "https://github.com/paritytech/revive/releases/download/${RESOLC_VERSION}/resolc-${RESOLC_BIN}" "${BIN_DIR}/resolc" "resolc" "-L"
  cp /tmp/resolc-${RESOLC_VERSION}-checksums.txt ${BIN_DIR}/resolc-checksums.txt
else
  echo "Resolc checksums match, skipping download"
fi

rm /tmp/node-${NODES_VERSION}-checksums.txt
rm /tmp/resolc-${RESOLC_VERSION}-checksums.txt

chmod -R 755 ${BIN_DIR}

ls -lsa ${BIN_DIR}

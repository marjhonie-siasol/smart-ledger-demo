import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();

  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();

  console.log("Deploying contract with account:", deployer.account.address);

  const demoToken = await viem.deployContract("DemoToken");

  console.log("DemoToken deployed to:", demoToken.address);

  const blockNumber = await publicClient.getBlockNumber();
  console.log("Current block number:", blockNumber.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
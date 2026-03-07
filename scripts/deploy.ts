import { ethers } from "hardhat";

async function main() {
  const staker = await ethers.deployContract("Staker");
  await staker.waitForDeployment();

  console.log("Staker deployed to:",
    await staker.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
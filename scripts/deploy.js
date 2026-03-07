import hre from "hardhat";

async function main() {
    console.log("🚀 Starting deployment...\n");


    // Deploy Staker contract
    console.log("📦 Deploying Staker...");
    const Staker = await hre.ethers.getContractFactory("Staker");
    const staker = await Staker.deploy(externalAddress);
    await staker.waitForDeployment();
    const stakerAddress = await staker.getAddress();
    console.log(`✅ Staker deployed to: ${stakerAddress}\n`);

    // Display summary
    console.log("═══════════════════════════════════════════");
    console.log("           DEPLOYMENT COMPLETE!            ");
    console.log("═══════════════════════════════════════════");
    console.log(`ExampleExternalContract: ${externalAddress}`);
    console.log(`Staker:                  ${stakerAddress}`);
    console.log("═══════════════════════════════════════════\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
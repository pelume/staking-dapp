import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  Staker,
  ExampleExternalContract,
} from "../typechain-types";

describe("Staker Contract", function () {
  async function deployFixture() {
  const [owner, user1] = await ethers.getSigners();

    const ExampleExternalContractFactory =
      await ethers.getContractFactory("ExampleExternalContract");
    const exampleExternalContract =
      (await ExampleExternalContractFactory.deploy()) as unknown as ExampleExternalContract;
    await exampleExternalContract.waitForDeployment();

    const StakerFactory = await ethers.getContractFactory("Staker");
    const staker = (await StakerFactory.deploy(
      await exampleExternalContract.getAddress()
    )) as unknown as Staker;
    await staker.waitForDeployment();
  return { owner, user1, staker, exampleExternalContract };
}

  it("Should deploy contracts", async function () {
    const { staker } = await loadFixture(deployFixture);

    const threshold = await staker.threshold();
    expect(threshold).to.equal(ethers.parseEther("1"));
  });

  it("Should allow users to stake ETH", async function () {
    const { user1, staker } = await loadFixture(deployFixture);

    await staker.connect(user1).stake({
      value: ethers.parseEther("0.5"),
    });

    const balance = await staker.balances(user1.address);
    expect(balance).to.equal(ethers.parseEther("0.5"));
  });

  it("Should reject stake of 0 ETH", async function () {
    const { user1, staker } = await loadFixture(deployFixture);

    await expect(
      staker.connect(user1).stake({ value: 0 })
    ).to.be.revertedWith("Must stake more than 0 ETH!");
  });

  it("Should track time left", async function () {
    const { staker } = await loadFixture(deployFixture);

    const timeLeft = await staker.timeLeft();
    expect(timeLeft).to.be.greaterThan(0n);
  });

  it("Should execute and send to external contract when threshold met", async function () {
    const { user1, staker, exampleExternalContract } =
      await loadFixture(deployFixture);

    await staker.connect(user1).stake({
      value: ethers.parseEther("1"),
    });

    await ethers.provider.send("evm_increaseTime", [31]);
    await ethers.provider.send("evm_mine", []);

    await staker.execute();

    const completed = await exampleExternalContract.completed();
    expect(completed).to.be.true;
  });

  it("Should open withdrawals when threshold not met", async function () {
    const { user1, staker } = await loadFixture(deployFixture);

    await staker.connect(user1).stake({
      value: ethers.parseEther("0.5"),
    });

    await ethers.provider.send("evm_increaseTime", [31]);
    await ethers.provider.send("evm_mine", []);

    await staker.execute();

    expect(await staker.openForWithdraw()).to.be.true;
  });

  it("Should allow withdraw when threshold not met", async function () {
    const { user1, staker } = await loadFixture(deployFixture);

    await staker.connect(user1).stake({
      value: ethers.parseEther("0.5"),
    });

    await ethers.provider.send("evm_increaseTime", [31]);
    await ethers.provider.send("evm_mine", []);

    await staker.execute();
    await staker.connect(user1).withdraw();

    const balance = await staker.balances(user1.address);
    expect(balance).to.equal(0n);
  });
});
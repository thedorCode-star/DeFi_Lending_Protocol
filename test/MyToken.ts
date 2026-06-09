import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

const INITIAL_SUPPLY = 1000n;

// loadFixture runs this once, snapshots the chain, and restores the snapshot
// before every test — much faster than redeploying in beforeEach.
async function deployMyTokenFixture() {
  const [owner, alice, solange, ida, tresor] = await ethers.getSigners();
  const myToken = await ethers.deployContract("MyToken", [INITIAL_SUPPLY]);
  return { myToken, owner, alice, solange, ida, tresor };
}

describe("MyToken", function () {
  describe("Deployment", function () {
    it("assigns the initial supply to the deployer", async function () {
      const { myToken, owner } = await networkHelpers.loadFixture(deployMyTokenFixture);

      expect(await myToken.totalSupply()).to.equal(INITIAL_SUPPLY);
      expect(await myToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("sets the deployer as owner", async function () {
      const { myToken, owner } = await networkHelpers.loadFixture(deployMyTokenFixture);

      expect(await myToken.owner()).to.equal(owner.address);
    });

    it("exposes name, symbol and decimals", async function () {
      const { myToken } = await networkHelpers.loadFixture(deployMyTokenFixture);

      expect(await myToken.name()).to.equal("MyToken");
      expect(await myToken.symbol()).to.equal("MTK");
      expect(await myToken.decimals()).to.equal(18n);
    });
  });

  describe("transfer", function () {
    it("moves tokens between accounts and emits Transfer", async function () {
      const { myToken, owner, solange } = await networkHelpers.loadFixture(deployMyTokenFixture);
      const amount = 100n;

      await expect(myToken.transfer(solange.address, amount))
        .to.emit(myToken, "Transfer")
        .withArgs(owner.address, solange.address, amount);

      expect(await myToken.balanceOf(solange.address)).to.equal(amount);
      expect(await myToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - amount);
    });

    it("reverts when the sender's balance is insufficient", async function () {
      const { myToken, alice, solange } = await networkHelpers.loadFixture(deployMyTokenFixture);

      await expect(
        myToken.connect(alice).transfer(solange.address, 1n),
      ).to.be.revertedWith("Insufficient balance");
    });

    it("reverts when transferring to the zero address", async function () {
      const { myToken } = await networkHelpers.loadFixture(deployMyTokenFixture);

      await expect(myToken.transfer(ethers.ZeroAddress, 100n)).to.be.revertedWith(
        "Cannot transfer to zero address",
      );
    });
  });

  describe("mint", function () {
    it("creates tokens for the recipient and grows the supply", async function () {
      const { myToken, ida } = await networkHelpers.loadFixture(deployMyTokenFixture);
      const amount = 100n;

      await expect(myToken.mint(ida.address, amount))
        .to.emit(myToken, "Transfer")
        .withArgs(ethers.ZeroAddress, ida.address, amount);

      expect(await myToken.balanceOf(ida.address)).to.equal(amount);
      expect(await myToken.totalSupply()).to.equal(INITIAL_SUPPLY + amount);
    });

    it("reverts when a non-owner mints", async function () {
      const { myToken, alice, ida } = await networkHelpers.loadFixture(deployMyTokenFixture);

      await expect(
        myToken.connect(alice).mint(ida.address, 100n),
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("reverts when minting to the zero address", async function () {
      const { myToken } = await networkHelpers.loadFixture(deployMyTokenFixture);

      await expect(myToken.mint(ethers.ZeroAddress, 100n)).to.be.revertedWith(
        "Cannot mint to zero address",
      );
    });
  });

  describe("burn", function () {
    it("destroys the caller's tokens and shrinks the supply", async function () {
      const { myToken, owner, tresor } = await networkHelpers.loadFixture(deployMyTokenFixture);
      const amount = 100n;
      await myToken.transfer(tresor.address, amount);

      await expect(myToken.connect(tresor).burn(amount))
        .to.emit(myToken, "Transfer")
        .withArgs(tresor.address, ethers.ZeroAddress, amount);

      expect(await myToken.balanceOf(tresor.address)).to.equal(0n);
      expect(await myToken.totalSupply()).to.equal(INITIAL_SUPPLY - amount);
      // Owner's remaining balance is untouched by the burn
      expect(await myToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - amount);
    });

    it("reverts when burning more than the balance", async function () {
      const { myToken, alice } = await networkHelpers.loadFixture(deployMyTokenFixture);

      await expect(myToken.connect(alice).burn(1n)).to.be.revertedWith(
        "Insufficient balance",
      );
    });
  });

  describe("allowances", function () {
    it("approve records the allowance and emits Approval", async function () {
      const { myToken, owner, alice } = await networkHelpers.loadFixture(deployMyTokenFixture);
      const amount = 200n;

      await expect(myToken.approve(alice.address, amount))
        .to.emit(myToken, "Approval")
        .withArgs(owner.address, alice.address, amount);

      expect(await myToken.allowance(owner.address, alice.address)).to.equal(amount);
    });

    it("transferFrom moves approved tokens and consumes the allowance", async function () {
      const { myToken, owner, alice, solange } = await networkHelpers.loadFixture(deployMyTokenFixture);
      const amount = 200n;
      await myToken.approve(alice.address, amount);

      await expect(myToken.connect(alice).transferFrom(owner.address, solange.address, amount))
        .to.emit(myToken, "Transfer")
        .withArgs(owner.address, solange.address, amount);

      expect(await myToken.balanceOf(solange.address)).to.equal(amount);
      expect(await myToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - amount);
      expect(await myToken.allowance(owner.address, alice.address)).to.equal(0n);
    });

    it("reverts transferFrom when the allowance is too small", async function () {
      const { myToken, owner, alice, solange } = await networkHelpers.loadFixture(deployMyTokenFixture);
      await myToken.approve(alice.address, 50n);

      await expect(
        myToken.connect(alice).transferFrom(owner.address, solange.address, 100n),
      ).to.be.revertedWith("Allowance exceeded");
    });

    it("reverts transferFrom when the token owner has no balance", async function () {
      const { myToken, alice, ida, solange } = await networkHelpers.loadFixture(deployMyTokenFixture);
      // ida approves alice, but ida holds no tokens
      await myToken.connect(ida).approve(alice.address, 100n);

      await expect(
        myToken.connect(alice).transferFrom(ida.address, solange.address, 100n),
      ).to.be.revertedWith("Insufficient balance");
    });
  });
});

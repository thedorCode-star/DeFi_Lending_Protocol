import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

const DEPOSIT = ethers.parseEther("10");
const BORROW = ethers.parseEther("5"); // exactly 50% of DEPOSIT

// Fresh protocol, nobody has deposited yet
async function deployLendingFixture() {
  const [owner, lender, borrower] = await ethers.getSigners();
  const lending = await ethers.deployContract("Lending");
  return { lending, owner, lender, borrower };
}

// Borrower has 10 ETH of collateral, no debt
async function withCollateralFixture() {
  const [owner, lender, borrower] = await ethers.getSigners();
  const lending = await ethers.deployContract("Lending");
  await lending.connect(borrower).deposit({ value: DEPOSIT });
  return { lending, owner, lender, borrower };
}

// Borrower has 10 ETH of collateral and 5 ETH of debt
async function withDebtFixture() {
  const [owner, lender, borrower] = await ethers.getSigners();
  const lending = await ethers.deployContract("Lending");
  await lending.connect(borrower).deposit({ value: DEPOSIT });
  await lending.connect(borrower).borrow(BORROW);
  return { lending, owner, lender, borrower };
}

describe("Lending Protocol", function () {
  describe("deposit", function () {
    it("records ETH as collateral and emits Deposited", async function () {
      const { lending, lender } = await networkHelpers.loadFixture(deployLendingFixture);

      await expect(lending.connect(lender).deposit({ value: DEPOSIT }))
        .to.emit(lending, "Deposited")
        .withArgs(lender.address, DEPOSIT);

      expect(await lending.collateral(lender.address)).to.equal(DEPOSIT);
    });

    it("accumulates across multiple deposits", async function () {
      const { lending, lender } = await networkHelpers.loadFixture(deployLendingFixture);

      await lending.connect(lender).deposit({ value: ethers.parseEther("3") });
      await lending.connect(lender).deposit({ value: ethers.parseEther("7") });

      expect(await lending.collateral(lender.address)).to.equal(DEPOSIT);
    });

    it("reverts when depositing zero ETH", async function () {
      const { lending, lender } = await networkHelpers.loadFixture(deployLendingFixture);

      await expect(lending.connect(lender).deposit({ value: 0n })).to.be.revertedWith(
        "Must deposit something",
      );
    });
  });

  describe("borrow", function () {
    it("allows borrowing up to 50% of collateral and emits Borrowed", async function () {
      const { lending, borrower } = await networkHelpers.loadFixture(withCollateralFixture);

      await expect(lending.connect(borrower).borrow(BORROW))
        .to.emit(lending, "Borrowed")
        .withArgs(borrower.address, BORROW);

      expect(await lending.borrowAmount(borrower.address)).to.equal(BORROW);
    });

    it("reverts when borrowing more than 50% of collateral", async function () {
      const { lending, borrower } = await networkHelpers.loadFixture(withCollateralFixture);

      await expect(
        lending.connect(borrower).borrow(ethers.parseEther("6")),
      ).to.be.revertedWith("Cannot borrow more than 50% of collateral");
    });

    it("reverts when borrowing with no collateral at all", async function () {
      const { lending, lender } = await networkHelpers.loadFixture(deployLendingFixture);

      await expect(lending.connect(lender).borrow(1n)).to.be.revertedWith(
        "Cannot borrow more than 50% of collateral",
      );
    });
  });

  describe("getHealthFactor", function () {
    it("returns max uint256 when the user has no debt", async function () {
      const { lending, borrower } = await networkHelpers.loadFixture(withCollateralFixture);

      expect(await lending.getHealthFactor(borrower.address)).to.equal(ethers.MaxUint256);
    });

    it("calculates the health factor from collateral and debt", async function () {
      const { lending, borrower } = await networkHelpers.loadFixture(withDebtFixture);

      // (collateral * 100) / (borrow * 2) = (10 * 100) / (5 * 2) = 100
      expect(await lending.getHealthFactor(borrower.address)).to.equal(100n);
    });
  });

  describe("repay", function () {
    it("reduces the debt and emits Repaid", async function () {
      const { lending, borrower } = await networkHelpers.loadFixture(withDebtFixture);
      const amount = ethers.parseEther("3");

      await expect(lending.connect(borrower).repay(amount, { value: amount }))
        .to.emit(lending, "Repaid")
        .withArgs(borrower.address, amount);

      // 5 - 3 = 2 ETH still owed
      expect(await lending.borrowAmount(borrower.address)).to.equal(ethers.parseEther("2"));
    });

    it("reverts when repaying more than owed", async function () {
      const { lending, borrower } = await networkHelpers.loadFixture(withDebtFixture);
      const amount = ethers.parseEther("6");

      await expect(
        lending.connect(borrower).repay(amount, { value: amount }),
      ).to.be.revertedWith("Repaying more than owed");
    });

    it("reverts when not enough ETH is sent", async function () {
      const { lending, borrower } = await networkHelpers.loadFixture(withDebtFixture);

      await expect(
        lending.connect(borrower).repay(ethers.parseEther("3"), {
          value: ethers.parseEther("1"),
        }),
      ).to.be.revertedWith("Need to send enough ETH");
    });
  });

  describe("withdraw", function () {
    it("returns collateral to the user when there is no debt", async function () {
      const { lending, borrower } = await networkHelpers.loadFixture(withCollateralFixture);
      const amount = ethers.parseEther("5");

      await expect(lending.connect(borrower).withdraw(amount)).to.changeEtherBalance(
        ethers,
        borrower,
        amount,
      );

      expect(await lending.collateral(borrower.address)).to.equal(DEPOSIT - amount);
    });

    it("emits Withdrawn", async function () {
      const { lending, borrower } = await networkHelpers.loadFixture(withCollateralFixture);
      const amount = ethers.parseEther("5");

      await expect(lending.connect(borrower).withdraw(amount))
        .to.emit(lending, "Withdrawn")
        .withArgs(borrower.address, amount);
    });

    it("reverts while the user still has debt", async function () {
      const { lending, borrower } = await networkHelpers.loadFixture(withDebtFixture);

      await expect(
        lending.connect(borrower).withdraw(ethers.parseEther("1")),
      ).to.be.revertedWith("Must repay all borrows first");
    });

    it("reverts when withdrawing more than the collateral", async function () {
      const { lending, borrower } = await networkHelpers.loadFixture(withCollateralFixture);

      await expect(
        lending.connect(borrower).withdraw(ethers.parseEther("11")),
      ).to.be.revertedWith("Not enough collateral");
    });
  });
});

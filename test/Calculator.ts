import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

async function deployCalculatorFixture() {
  const calculator = await ethers.deployContract("Calculator");
  return { calculator };
}

describe("Calculator Contract", function () {
  describe("Addition", function () {
    it("Should add 5 + 3 and get 8", async function () {
      const { calculator } = await networkHelpers.loadFixture(deployCalculatorFixture);
      await calculator.add(5, 3);
      expect(await calculator.getResult()).to.equal(8n);
    });

    it("Should add 10 + 20 and get 30", async function () {
      const { calculator } = await networkHelpers.loadFixture(deployCalculatorFixture);
      await calculator.add(10, 20);
      expect(await calculator.getResult()).to.equal(30n);
    });
  });

  describe("Subtraction", function () {
    it("Should subtract 10 - 4 and get 6", async function () {
      const { calculator } = await networkHelpers.loadFixture(deployCalculatorFixture);
      await calculator.subtract(10, 4);
      expect(await calculator.getResult()).to.equal(6n);
    });
  });

  describe("Multiplication", function () {
    it("Should multiply 4 × 5 and get 20", async function () {
      const { calculator } = await networkHelpers.loadFixture(deployCalculatorFixture);
      await calculator.multiply(4, 5);
      expect(await calculator.getResult()).to.equal(20n);
    });
  });

  describe("Division", function () {
    it("Should divide 100 / 10 and get 10", async function () {
      const { calculator } = await networkHelpers.loadFixture(deployCalculatorFixture);
      await calculator.divide(100, 10);
      expect(await calculator.getResult()).to.equal(10n);
    });

    it("Should revert when dividing by zero", async function () {
      const { calculator } = await networkHelpers.loadFixture(deployCalculatorFixture);
      await expect(calculator.divide(100, 0)).to.be.revertedWith("Cannot divide by zero");
    });
  });

  describe("Square", function () {
    it("Should square 5 and get 25", async function () {
      const { calculator } = await networkHelpers.loadFixture(deployCalculatorFixture);
      await calculator.square(5);
      expect(await calculator.getResult()).to.equal(25n);
    });
  });

  describe("Power", function () {
    it("Should power 20 by 3 and get 8000", async function () {
      const { calculator } = await networkHelpers.loadFixture(deployCalculatorFixture);
      await calculator.power(20, 3);
      expect(await calculator.getResult()).to.equal(8000n);
    });
  });
});

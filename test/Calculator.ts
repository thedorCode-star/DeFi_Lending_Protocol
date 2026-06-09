import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Calculator Contract", function () {
  let calculator;

  beforeEach(async function () {
    calculator = await ethers.deployContract("Calculator");
  });

  describe("Addition", function () {
    it("Should add 5 + 3 and get 8", async function () {
      await calculator.add(5, 3);
      const result = await calculator.getResult();
      expect(result).to.equal(8n);
    });

    it("Should add 10 + 20 and get 30", async function () {
      await calculator.add(10, 20);
      const result = await calculator.getResult();
      expect(result).to.equal(30n);
    });
  });

  describe("Subtraction", function () {
    it("Should subtract 10 - 4 and get 6", async function () {
      await calculator.subtract(10, 4);
      const result = await calculator.getResult();
      expect(result).to.equal(6n);
    });
  });

  describe("Multiplication", function () {
    it("Should multiply 4 × 5 and get 20", async function () {
      await calculator.multiply(4, 5);
      const result = await calculator.getResult();
      expect(result).to.equal(20n);
    });
  });

  describe("Division", function () {
    it("Should divide 100 / 10 and get 10", async function () {
      await calculator.divide(100, 10);
      const result = await calculator.getResult();
      expect(result).to.equal(10n);
    });
  });

  describe("Division by zero", function () {
    it("Should revert when dividing by zero", async function () {
      await expect(calculator.divide(100, 0)).to.be.revertedWith("Cannot divide by zero");
    });
  });

  describe("Square", function () {
    it("Should square 5 and get 25", async function () {
      await calculator.square(5);
      const result = await calculator.getResult();
      expect(result).to.equal(25n);
    });
  });

  describe("Power", function () {
    it("Should power 2 by 3 and get 8", async function () {
      await calculator.power(20, 3);
      const result = await calculator.getResult();
      expect(result).to.equal(8000n);
    });
  });
});

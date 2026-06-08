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
});

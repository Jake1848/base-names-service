const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BasePriceOracle", function () {
  let priceOracle;

  beforeEach(async function () {
    const BasePriceOracle = await ethers.getContractFactory("BasePriceOracle");
    priceOracle = await BasePriceOracle.deploy();
    await priceOracle.waitForDeployment();
  });

  describe("Annual pricing", function () {
    it("Should return correct 1-year prices", async function () {
      // 3 character names
      expect(await priceOracle.price1Year("abc")).to.equal(ethers.parseEther("0.5"));
      expect(await priceOracle.price1Year("xyz")).to.equal(ethers.parseEther("0.5"));

      // 4 character names
      expect(await priceOracle.price1Year("test")).to.equal(ethers.parseEther("0.05"));
      expect(await priceOracle.price1Year("name")).to.equal(ethers.parseEther("0.05"));

      // 5+ character names
      expect(await priceOracle.price1Year("hello")).to.equal(ethers.parseEther("0.005"));
      expect(await priceOracle.price1Year("verylongname")).to.equal(ethers.parseEther("0.005"));
    });

    it("Should make very short names extremely expensive", async function () {
      expect(await priceOracle.price1Year("a")).to.equal(ethers.MaxUint256);
      expect(await priceOracle.price1Year("ab")).to.equal(ethers.MaxUint256);
    });
  });

  describe("Duration-based pricing", function () {
    it("Should calculate pricing correctly for different durations", async function () {
      const oneYear = 365 * 24 * 60 * 60;
      const sixMonths = oneYear / 2;
      const twoYears = oneYear * 2;

      // 4 character name pricing
      const oneYearPrice = await priceOracle.price("test", 0, oneYear);
      const sixMonthPrice = await priceOracle.price("test", 0, sixMonths);
      const twoYearPrice = await priceOracle.price("test", 0, twoYears);

      expect(oneYearPrice.base).to.equal(ethers.parseEther("0.05"));
      expect(sixMonthPrice.base).to.equal(ethers.parseEther("0.025")); // Half price
      expect(twoYearPrice.base).to.equal(ethers.parseEther("0.1")); // Double price

      // All should have zero premium
      expect(oneYearPrice.premium).to.equal(0);
      expect(sixMonthPrice.premium).to.equal(0);
      expect(twoYearPrice.premium).to.equal(0);
    });

    it("Should handle edge case durations", async function () {
      const oneDay = 24 * 60 * 60;
      const tenYears = 10 * 365 * 24 * 60 * 60;

      const oneDayPrice = await priceOracle.price("test", 0, oneDay);
      const tenYearPrice = await priceOracle.price("test", 0, tenYears);

      // One day should be very cheap
      expect(oneDayPrice.base).to.be.lt(ethers.parseEther("0.001"));

      // Ten years should be 10x annual price
      expect(tenYearPrice.base).to.equal(ethers.parseEther("0.5")); // 0.05 * 10
    });
  });

  describe("Price consistency", function () {
    it("Should maintain consistent pricing across different name lengths", async function () {
      const duration = 365 * 24 * 60 * 60; // 1 year

      const names3char = ["abc", "def", "ghi"];
      const names4char = ["abcd", "test", "name"];
      const names5char = ["hello", "world", "ethereum"];

      // All 3-char names should have same price
      for (let name of names3char) {
        const price = await priceOracle.price(name, 0, duration);
        expect(price.base).to.equal(ethers.parseEther("0.5"));
      }

      // All 4-char names should have same price
      for (let name of names4char) {
        const price = await priceOracle.price(name, 0, duration);
        expect(price.base).to.equal(ethers.parseEther("0.05"));
      }

      // All 5+ char names should have same price
      for (let name of names5char) {
        const price = await priceOracle.price(name, 0, duration);
        expect(price.base).to.equal(ethers.parseEther("0.005"));
      }
    });

    it("Should handle unicode and special characters correctly", async function () {
      const duration = 365 * 24 * 60 * 60;

      // Test various character combinations
      const testNames = [
        "test", // 4 chars ASCII
        "🚀🌟", // 4 chars emoji (may be counted differently)
        "café", // 4 chars with accent
        "тест", // 4 chars Cyrillic
      ];

      for (let name of testNames) {
        const price = await priceOracle.price(name, 0, duration);
        expect(price.base).to.be.gt(0);
        expect(price.premium).to.equal(0);
      }
    });
  });

  describe("Interface compliance", function () {
    it("Should support IPriceOracle interface", async function () {
      // Check if the contract supports the IPriceOracle interface
      const interfaceId = "0x50e9a715"; // IPriceOracle interface ID (computed from price function selector)
      expect(await priceOracle.supportsInterface(interfaceId)).to.be.true;
    });
  });

  describe("Price validation", function () {
    it("Should never return negative prices", async function () {
      const duration = 365 * 24 * 60 * 60;
      const testNames = ["a", "ab", "abc", "test", "verylongdomainname"];

      for (let name of testNames) {
        const price = await priceOracle.price(name, 0, duration);
        expect(price.base).to.be.gte(0);
        expect(price.premium).to.be.gte(0);
      }
    });

    it("Should handle zero duration gracefully", async function () {
      const price = await priceOracle.price("test", 0, 0);
      expect(price.base).to.equal(0);
      expect(price.premium).to.equal(0);
    });

    it("Should handle very large durations", async function () {
      const centuryDuration = 100 * 365 * 24 * 60 * 60; // 100 years
      const price = await priceOracle.price("test", 0, centuryDuration);

      // Should be 100x the annual price
      expect(price.base).to.equal(ethers.parseEther("5")); // 0.05 * 100
      expect(price.premium).to.equal(0);
    });
  });

  describe("Business logic validation", function () {
    it("Should implement correct price tiers for business model", async function () {
      const duration = 365 * 24 * 60 * 60;

      // Premium tier (3 chars) - $1000/year @ $2000 ETH
      const premium = await priceOracle.price("abc", 0, duration);
      expect(premium.base).to.equal(ethers.parseEther("0.5"));

      // Standard tier (4 chars) - $100/year @ $2000 ETH
      const standard = await priceOracle.price("test", 0, duration);
      expect(standard.base).to.equal(ethers.parseEther("0.05"));

      // Basic tier (5+ chars) - $10/year @ $2000 ETH
      const basic = await priceOracle.price("hello", 0, duration);
      expect(basic.base).to.equal(ethers.parseEther("0.005"));

      // Verify the 10x price differences between tiers
      expect(premium.base / standard.base).to.equal(10n);
      expect(standard.base / basic.base).to.equal(10n);
    });
  });
});
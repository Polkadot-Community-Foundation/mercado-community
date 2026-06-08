import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

import type { Mercado, MockMobRule } from '../typechain-types';

describe('Mercado', function () {
  async function deployFixture() {
    const [owner, restaurant1, customer1, customer2] =
      await ethers.getSigners();

    // Deploy Mercado as proxy
    const Mercado = await ethers.getContractFactory('Mercado');
    const mercado = (await upgrades.deployProxy(Mercado, [owner.address], {
      initializer: 'initialize',
      kind: 'uups',
    })) as unknown as Mercado;
    await mercado.waitForDeployment();

    // Deploy MockMobRule
    const MockMobRule = await ethers.getContractFactory('MockMobRule');
    const mockMobRule = (await MockMobRule.deploy(
      owner.address,
      await mercado.getAddress(),
    )) as unknown as MockMobRule;
    await mockMobRule.waitForDeployment();

    // Set MockMobRule in Mercado
    await mercado.setMockMobRule(await mockMobRule.getAddress());

    // Set dispute stake amount (1 ETH for testing)
    const stakeAmount = ethers.parseEther('1');
    await mercado.setDisputeStakeAmount(stakeAmount);

    return {
      mercado,
      mockMobRule,
      owner,
      restaurant1,
      customer1,
      customer2,
      stakeAmount,
    };
  }

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      const { mercado, owner } = await loadFixture(deployFixture);
      expect(await mercado.owner()).to.equal(owner.address);
    });

    it('Should have native asset allowed by default', async function () {
      const { mercado } = await loadFixture(deployFixture);
      expect(await mercado.allowedAssets(ethers.ZeroAddress)).to.equal(true);
    });

    it('Should have correct version', async function () {
      const { mercado } = await loadFixture(deployFixture);
      expect(await mercado.VERSION()).to.equal('1.0.0');
    });
  });

  describe('Restaurant Registration', function () {
    it('Should register a restaurant', async function () {
      const { mercado, restaurant1 } = await loadFixture(deployFixture);

      await expect(
        mercado
          .connect(restaurant1)
          .registerRestaurant('Test Restaurant', 'New York', 'QmTestCID'),
      )
        .to.emit(mercado, 'RestaurantRegistered')
        .withArgs(
          1,
          restaurant1.address,
          'Test Restaurant',
          'New York',
          'QmTestCID',
        );

      const restaurant = await mercado.getRestaurant(1);
      expect(restaurant.name).to.equal('Test Restaurant');
      expect(restaurant.location).to.equal('New York');
      expect(restaurant.owner).to.equal(restaurant1.address);
      expect(restaurant.isOpen).to.equal(false);
    });

    it('Should not allow duplicate registration', async function () {
      const { mercado, restaurant1 } = await loadFixture(deployFixture);

      await mercado
        .connect(restaurant1)
        .registerRestaurant('Test Restaurant', 'New York', 'QmTestCID');

      await expect(
        mercado
          .connect(restaurant1)
          .registerRestaurant('Another Restaurant', 'LA', 'QmTestCID2'),
      ).to.be.revertedWith('Already registered');
    });

    it('Should toggle open status', async function () {
      const { mercado, restaurant1 } = await loadFixture(deployFixture);

      await mercado
        .connect(restaurant1)
        .registerRestaurant('Test Restaurant', 'New York', 'QmTestCID');

      await expect(mercado.connect(restaurant1).setRestaurantOpen(true))
        .to.emit(mercado, 'RestaurantOpenStatusChanged')
        .withArgs(1, true);

      const restaurant = await mercado.getRestaurant(1);
      expect(restaurant.isOpen).to.equal(true);
    });
  });

  describe('Order Placement', function () {
    async function setupRestaurant() {
      const fixture = await loadFixture(deployFixture);
      const { mercado, restaurant1 } = fixture;

      await mercado
        .connect(restaurant1)
        .registerRestaurant('Test Restaurant', 'New York', 'QmTestCID');
      await mercado.connect(restaurant1).setRestaurantOpen(true);

      return fixture;
    }

    it('Should place an order', async function () {
      const { mercado, customer1 } = await setupRestaurant();

      const orderPrice = ethers.parseEther('0.1');
      const itemsData = ethers.AbiCoder.defaultAbiCoder().encode(
        [
          'tuple(uint256 dishId, uint256 quantity, uint256[] selectedOptionIds)[]',
        ],
        [[[1, 2, []]]],
      );

      await expect(
        mercado
          .connect(customer1)
          .placeOrder(1, itemsData, orderPrice, ethers.ZeroAddress, 0, {
            value: orderPrice,
          }),
      )
        .to.emit(mercado, 'OrderPlaced')
        .withArgs(1, 1, customer1.address, orderPrice, ethers.ZeroAddress);

      const order = await mercado.getOrder(1);
      expect(order.customer).to.equal(customer1.address);
      expect(order.restaurantId).to.equal(1n);
      expect(order.totalPrice).to.equal(orderPrice);
      expect(order.status).to.equal(0); // PLACED
    });

    it('Should not allow ordering from closed restaurant', async function () {
      const { mercado, restaurant1, customer1 } =
        await loadFixture(deployFixture);

      await mercado
        .connect(restaurant1)
        .registerRestaurant('Test Restaurant', 'New York', 'QmTestCID');
      // Not opening the restaurant

      const orderPrice = ethers.parseEther('0.1');
      const itemsData = ethers.AbiCoder.defaultAbiCoder().encode(
        [
          'tuple(uint256 dishId, uint256 quantity, uint256[] selectedOptionIds)[]',
        ],
        [[[1, 2, []]]],
      );

      await expect(
        mercado
          .connect(customer1)
          .placeOrder(1, itemsData, orderPrice, ethers.ZeroAddress, 0, {
            value: orderPrice,
          }),
      ).to.be.revertedWith('Restaurant closed');
    });
  });

  describe('Order Lifecycle', function () {
    async function setupOrderedState() {
      const fixture = await loadFixture(deployFixture);
      const { mercado, restaurant1, customer1 } = fixture;

      await mercado
        .connect(restaurant1)
        .registerRestaurant('Test Restaurant', 'New York', 'QmTestCID');
      await mercado.connect(restaurant1).setRestaurantOpen(true);

      const orderPrice = ethers.parseEther('0.1');
      const itemsData = ethers.AbiCoder.defaultAbiCoder().encode(
        [
          'tuple(uint256 dishId, uint256 quantity, uint256[] selectedOptionIds)[]',
        ],
        [[[1, 2, []]]],
      );

      await mercado
        .connect(customer1)
        .placeOrder(1, itemsData, orderPrice, ethers.ZeroAddress, 0, {
          value: orderPrice,
        });

      return { ...fixture, orderPrice };
    }

    it('Should advance order status through lifecycle', async function () {
      const { mercado, restaurant1, customer1 } = await setupOrderedState();

      // PLACED -> CONFIRMED
      await expect(mercado.connect(restaurant1).advanceOrderStatus(1))
        .to.emit(mercado, 'OrderStatusChanged')
        .withArgs(1, 0, 1); // PLACED -> CONFIRMED

      // CONFIRMED -> PREPARING
      await expect(mercado.connect(restaurant1).advanceOrderStatus(1))
        .to.emit(mercado, 'OrderStatusChanged')
        .withArgs(1, 1, 2); // CONFIRMED -> PREPARING

      // PREPARING -> READY_FOR_PICKUP
      await expect(mercado.connect(restaurant1).advanceOrderStatus(1))
        .to.emit(mercado, 'OrderStatusChanged')
        .withArgs(1, 2, 3); // PREPARING -> READY_FOR_PICKUP

      // READY_FOR_PICKUP -> COMPLETED (by customer)
      await expect(mercado.connect(customer1).completeOrder(1))
        .to.emit(mercado, 'OrderStatusChanged')
        .withArgs(1, 3, 4); // READY_FOR_PICKUP -> COMPLETED
    });

    it('Should allow cancellation by customer', async function () {
      const { mercado, customer1 } = await setupOrderedState();

      await expect(mercado.connect(customer1).cancelOrder(1))
        .to.emit(mercado, 'OrderCanceled')
        .withArgs(1, true);

      const order = await mercado.getOrder(1);
      expect(order.status).to.equal(5); // CANCELED
      expect(order.canceledByCustomer).to.equal(true);
    });

    it('Should allow cancellation by restaurant', async function () {
      const { mercado, restaurant1 } = await setupOrderedState();

      await expect(mercado.connect(restaurant1).cancelOrder(1))
        .to.emit(mercado, 'OrderCanceled')
        .withArgs(1, false);

      const order = await mercado.getOrder(1);
      expect(order.status).to.equal(5); // CANCELED
      expect(order.canceledByCustomer).to.equal(false);
    });
  });

  describe('Rating', function () {
    async function setupCompletedOrder() {
      const fixture = await loadFixture(deployFixture);
      const { mercado, restaurant1, customer1 } = fixture;

      await mercado
        .connect(restaurant1)
        .registerRestaurant('Test Restaurant', 'New York', 'QmTestCID');
      await mercado.connect(restaurant1).setRestaurantOpen(true);

      const orderPrice = ethers.parseEther('0.1');
      const itemsData = ethers.AbiCoder.defaultAbiCoder().encode(
        [
          'tuple(uint256 dishId, uint256 quantity, uint256[] selectedOptionIds)[]',
        ],
        [[[1, 2, []]]],
      );

      await mercado
        .connect(customer1)
        .placeOrder(1, itemsData, orderPrice, ethers.ZeroAddress, 0, {
          value: orderPrice,
        });

      // Advance to completed
      await mercado.connect(restaurant1).advanceOrderStatus(1);
      await mercado.connect(restaurant1).advanceOrderStatus(1);
      await mercado.connect(restaurant1).advanceOrderStatus(1);
      await mercado.connect(customer1).completeOrder(1);

      return fixture;
    }

    it('Should allow customer to rate restaurant', async function () {
      const { mercado, customer1 } = await setupCompletedOrder();

      await expect(mercado.connect(customer1).rateRestaurant(1, 5))
        .to.emit(mercado, 'RestaurantRated')
        .withArgs(1, 1, customer1.address, 5);

      const restaurant = await mercado.getRestaurant(1);
      expect(restaurant.ratingCount).to.equal(1n);
      expect(restaurant.ratingSum).to.equal(5n);
    });

    it('Should not allow double rating', async function () {
      const { mercado, customer1 } = await setupCompletedOrder();

      await mercado.connect(customer1).rateRestaurant(1, 5);

      await expect(
        mercado.connect(customer1).rateRestaurant(1, 4),
      ).to.be.revertedWith('Already rated');
    });

    it('Should reject invalid ratings', async function () {
      const { mercado, customer1 } = await setupCompletedOrder();

      await expect(
        mercado.connect(customer1).rateRestaurant(1, 0),
      ).to.be.revertedWith('Invalid rating');
      await expect(
        mercado.connect(customer1).rateRestaurant(1, 6),
      ).to.be.revertedWith('Invalid rating');
    });
  });
});

describe('MockMobRule', function () {
  async function deployFixture() {
    const [owner, admin, customer, restaurant] = await ethers.getSigners();

    // Deploy mock Mercado address (using owner as placeholder)
    const Mercado = await ethers.getContractFactory('Mercado');
    const mercado = (await upgrades.deployProxy(Mercado, [owner.address], {
      initializer: 'initialize',
      kind: 'uups',
    })) as unknown as Mercado;
    await mercado.waitForDeployment();

    const MockMobRule = await ethers.getContractFactory('MockMobRule');
    const mockMobRule = (await MockMobRule.deploy(
      admin.address,
      await mercado.getAddress(),
    )) as unknown as MockMobRule;
    await mockMobRule.waitForDeployment();

    return { mockMobRule, mercado, owner, admin, customer, restaurant };
  }

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      const { mockMobRule, admin } = await loadFixture(deployFixture);
      expect(await mockMobRule.owner()).to.equal(admin.address);
    });

    it('Should set the Mercado address', async function () {
      const { mockMobRule, mercado } = await loadFixture(deployFixture);
      expect(await mockMobRule.MERCADO()).to.equal(await mercado.getAddress());
    });
  });

  describe('Case Creation', function () {
    it('Should create a dispute case', async function () {
      const { mockMobRule, customer, restaurant } =
        await loadFixture(deployFixture);

      await expect(
        mockMobRule.createDispute(
          1,
          customer.address,
          restaurant.address,
          customer.address,
          'QmTestCID',
        ),
      )
        .to.emit(mockMobRule, 'CaseCreated')
        .withArgs(
          1,
          1,
          customer.address,
          restaurant.address,
          customer.address,
          'QmTestCID',
        );

      const case_ = await mockMobRule.getCase(1);
      expect(case_.orderId).to.equal(1n);
      expect(case_.customer).to.equal(customer.address);
      expect(case_.restaurant).to.equal(restaurant.address);
      expect(case_.initiator).to.equal(customer.address);
      expect(case_.verdict).to.equal(0); // Pending
    });

    it('Should not allow duplicate disputes for same order', async function () {
      const { mockMobRule, customer, restaurant } =
        await loadFixture(deployFixture);

      await mockMobRule.createDispute(
        1,
        customer.address,
        restaurant.address,
        customer.address,
        'QmTestCID',
      );

      await expect(
        mockMobRule.createDispute(
          1,
          customer.address,
          restaurant.address,
          restaurant.address,
          'QmTestCID2',
        ),
      ).to.be.revertedWith('Dispute exists');
    });
  });

  describe('Case Resolution', function () {
    it('Should allow admin to resolve case', async function () {
      const { mockMobRule, admin, customer, restaurant } =
        await loadFixture(deployFixture);

      await mockMobRule.createDispute(
        1,
        customer.address,
        restaurant.address,
        customer.address,
        'QmTestCID',
      );

      await expect(mockMobRule.connect(admin).resolveCase(1, 1)) // InitiatorWins
        .to.emit(mockMobRule, 'CaseResolved')
        .withArgs(1, 1);

      expect(await mockMobRule.getVerdict(1)).to.equal(1);
    });

    it('Should not allow non-admin to resolve case', async function () {
      const { mockMobRule, customer, restaurant } =
        await loadFixture(deployFixture);

      await mockMobRule.createDispute(
        1,
        customer.address,
        restaurant.address,
        customer.address,
        'QmTestCID',
      );

      await expect(
        mockMobRule.connect(customer).resolveCase(1, 1),
      ).to.be.revertedWithCustomError(
        mockMobRule,
        'OwnableUnauthorizedAccount',
      );
    });
  });
});

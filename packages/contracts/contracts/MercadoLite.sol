// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MercadoLite
 * @notice Simplified food delivery marketplace - non-upgradeable for smaller bytecode
 * @dev Stripped down version to fit within PVM size limits
 */
contract MercadoLite is Ownable, ReentrancyGuard, Pausable {
    string public constant VERSION = "1.0.0-lite";

    uint256 public constant DISPUTE_WINDOW = 24 hours;
    address public constant NATIVE_ASSET = address(0);

    enum OrderStatus { PLACED, CONFIRMED, PREPARING, READY, COMPLETED, CANCELED }

    struct Restaurant {
        uint256 id;
        address owner;
        string name;
        string location;
        string metadataCID;
        bool isOpen;
        uint256 ratingCount;
        uint256 ratingSum;
    }

    struct Order {
        uint256 id;
        address customer;
        uint256 restaurantId;
        uint256 totalPrice;
        OrderStatus status;
        uint256 placedAt;
        uint256 completedAt;
        uint8 rating;
    }

    uint256 private _nextRestaurantId = 1;
    uint256 private _nextOrderId = 1;

    mapping(uint256 => Restaurant) public restaurants;
    mapping(address => uint256) public restaurantIdByOwner;
    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) private _customerOrderIds;

    event RestaurantRegistered(uint256 indexed id, address indexed owner, string name, string location);
    event RestaurantOpenChanged(uint256 indexed id, bool isOpen);
    event OrderPlaced(uint256 indexed orderId, uint256 indexed restaurantId, address indexed customer, uint256 price);
    event OrderStatusChanged(uint256 indexed orderId, OrderStatus status);
    event FundsReleased(uint256 indexed orderId, address indexed to, uint256 amount);
    event RestaurantRated(uint256 indexed restaurantId, uint256 indexed orderId, uint8 rating);

    constructor(address owner_) Ownable(owner_) {}

    function registerRestaurant(
        string calldata name_,
        string calldata location_,
        string calldata metadataCID_
    ) external whenNotPaused returns (uint256) {
        require(bytes(name_).length > 0 && bytes(name_).length <= 100, "Invalid name");
        require(bytes(location_).length > 0, "Location required");
        require(restaurantIdByOwner[msg.sender] == 0, "Already registered");

        uint256 id = _nextRestaurantId++;
        restaurants[id] = Restaurant(id, msg.sender, name_, location_, metadataCID_, false, 0, 0);
        restaurantIdByOwner[msg.sender] = id;

        emit RestaurantRegistered(id, msg.sender, name_, location_);
        return id;
    }

    function setRestaurantOpen(bool isOpen_) external whenNotPaused {
        uint256 id = restaurantIdByOwner[msg.sender];
        require(id != 0, "Not owner");
        restaurants[id].isOpen = isOpen_;
        emit RestaurantOpenChanged(id, isOpen_);
    }

    function placeOrder(
        uint256 restaurantId_,
        uint256 totalPrice_
    ) external payable whenNotPaused nonReentrant returns (uint256) {
        Restaurant storage r = restaurants[restaurantId_];
        require(r.id != 0 && r.isOpen, "Invalid restaurant");
        require(r.owner != msg.sender, "Own restaurant");
        require(msg.value == totalPrice_ && totalPrice_ > 0, "Invalid payment");

        uint256 orderId = _nextOrderId++;
        orders[orderId] = Order(orderId, msg.sender, restaurantId_, totalPrice_, OrderStatus.PLACED, block.timestamp, 0, 0);
        _customerOrderIds[msg.sender].push(orderId);

        emit OrderPlaced(orderId, restaurantId_, msg.sender, totalPrice_);
        return orderId;
    }

    function advanceOrder(uint256 orderId_) external whenNotPaused {
        Order storage o = orders[orderId_];
        require(o.id != 0, "Not found");
        require(restaurants[o.restaurantId].owner == msg.sender, "Not owner");

        if (o.status == OrderStatus.PLACED) o.status = OrderStatus.CONFIRMED;
        else if (o.status == OrderStatus.CONFIRMED) o.status = OrderStatus.PREPARING;
        else if (o.status == OrderStatus.PREPARING) o.status = OrderStatus.READY;
        else revert("Cannot advance");

        emit OrderStatusChanged(orderId_, o.status);
    }

    function completeOrder(uint256 orderId_) external whenNotPaused nonReentrant {
        Order storage o = orders[orderId_];
        require(o.id != 0 && o.customer == msg.sender, "Unauthorized");
        require(o.status == OrderStatus.READY, "Not ready");

        o.status = OrderStatus.COMPLETED;
        o.completedAt = block.timestamp;
        emit OrderStatusChanged(orderId_, OrderStatus.COMPLETED);
    }

    function cancelOrder(uint256 orderId_) external whenNotPaused nonReentrant {
        Order storage o = orders[orderId_];
        require(o.id != 0, "Not found");

        bool isCustomer = o.customer == msg.sender;
        bool isRestaurant = restaurants[o.restaurantId].owner == msg.sender;
        require(isCustomer || isRestaurant, "Unauthorized");
        require(o.status != OrderStatus.COMPLETED && o.status != OrderStatus.CANCELED, "Invalid status");

        o.status = OrderStatus.CANCELED;
        emit OrderStatusChanged(orderId_, OrderStatus.CANCELED);

        // Refund
        (bool ok, ) = payable(o.customer).call{value: o.totalPrice}("");
        require(ok, "Refund failed");
    }

    function claimFunds(uint256 orderId_) external whenNotPaused nonReentrant {
        Order storage o = orders[orderId_];
        require(o.id != 0 && o.status == OrderStatus.COMPLETED, "Not completed");

        Restaurant storage r = restaurants[o.restaurantId];
        require(r.owner == msg.sender, "Not owner");
        require(block.timestamp >= o.completedAt + DISPUTE_WINDOW, "Window open");

        uint256 amount = o.totalPrice;
        o.totalPrice = 0; // Prevent re-claim

        (bool ok, ) = payable(r.owner).call{value: amount}("");
        require(ok, "Transfer failed");

        emit FundsReleased(orderId_, r.owner, amount);
    }

    function rateRestaurant(uint256 orderId_, uint8 rating_) external whenNotPaused {
        require(rating_ >= 1 && rating_ <= 5, "Invalid rating");
        Order storage o = orders[orderId_];
        require(o.customer == msg.sender && o.status == OrderStatus.COMPLETED && o.rating == 0, "Cannot rate");

        o.rating = rating_;
        Restaurant storage r = restaurants[o.restaurantId];
        r.ratingCount++;
        r.ratingSum += rating_;

        emit RestaurantRated(o.restaurantId, orderId_, rating_);
    }

    function getCustomerOrders(address customer_) external view returns (uint256[] memory) {
        return _customerOrderIds[customer_];
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    receive() external payable {}
}

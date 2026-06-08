// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IMercadoMatchmakers {
    function getMatchMaker(uint256 id) external view returns (
        uint256 id_,
        address owner,
        string memory name,
        uint16 feePercentage,
        uint256 registeredAt,
        bool active
    );
    function recordOrderMatchMaker(uint256 orderId, uint256 mmId, uint256 feeAmount) external;
}

/**
 * @title MercadoCore
 * @notice Lean food delivery marketplace - core functionality only
 * @dev Disputes handled by MercadoDisputes extension, ratings by MercadoRatings
 */
contract MercadoCore is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    string public constant VERSION = "1.2.0-core";

    /// @notice Dispute window duration (24 hours after order completion)
    uint256 public constant DISPUTE_WINDOW = 24 hours;

    enum Status { PLACED, CONFIRMED, PREPARING, READY, DONE, CANCELED }

    struct Restaurant {
        uint256 id;
        address owner;
        string name;
        string location;
        string metadataCID;
        bool isOpen;
        uint256 registeredAt;
    }

    struct Order {
        uint256 id;
        address customer;
        uint256 restaurantId;
        uint256 price;
        Status status;
        uint256 placedAt;
        uint256 completedAt;
        bool canceledByCustomer;
        bool fundsReleased;
        // Payment asset: address(0) = native, otherwise ERC20
        address paymentAsset;
        // Matchmaker
        uint256 matchmakerId;
        uint256 matchmakerFeeBps;
        uint256 matchmakerFeeAmount;
        // Items stored as encoded bytes
        bytes itemsData;
    }

    uint256 public nextRestaurantId = 1;
    uint256 public nextOrderId = 1;

    mapping(uint256 => Restaurant) public restaurants;
    mapping(address => uint256) public ownerToRestaurant;
    mapping(uint256 => Order) public orders;

    // Order tracking
    mapping(address => uint256[]) private _customerOrders;
    mapping(uint256 => uint256[]) private _restaurantOrders;

    // Matchmakers contract
    IMercadoMatchmakers public matchmakers;

    // Allowed ERC20 payment assets
    mapping(address => bool) public allowedAssets;

    // Events
    event PaymentAssetAdded(address indexed asset);
    event PaymentAssetRemoved(address indexed asset);
    event RestaurantRegistered(uint256 indexed id, address indexed owner, string name, string location, string metadataCID);
    event RestaurantUpdated(uint256 indexed id, string name, string location, string metadataCID);
    event RestaurantOpenChanged(uint256 indexed id, bool isOpen);
    event OrderPlaced(uint256 indexed id, uint256 indexed restaurantId, address indexed customer, uint256 price, address paymentAsset);
    event OrderStatusChanged(uint256 indexed id, Status oldStatus, Status newStatus);
    event OrderCanceled(uint256 indexed id, bool byCustomer);
    event FundsReleased(uint256 indexed id, address indexed restaurant, uint256 amount);
    event RefundIssued(uint256 indexed id, address indexed customer, uint256 amount);
    event MatchmakersUpdated(address indexed newAddress);

    constructor(address owner_) Ownable(owner_) {}

    // ============ Restaurant Functions ============

    function registerRestaurant(
        string calldata name_,
        string calldata location_,
        string calldata metadataCID_
    ) external returns (uint256) {
        require(bytes(name_).length > 0 && bytes(name_).length <= 100, "bad name");
        require(bytes(location_).length > 0 && bytes(location_).length <= 100, "bad loc");
        require(ownerToRestaurant[msg.sender] == 0, "exists");

        uint256 id = nextRestaurantId++;
        restaurants[id] = Restaurant({
            id: id,
            owner: msg.sender,
            name: name_,
            location: location_,
            metadataCID: metadataCID_,
            isOpen: false,
            registeredAt: block.timestamp
        });
        ownerToRestaurant[msg.sender] = id;

        emit RestaurantRegistered(id, msg.sender, name_, location_, metadataCID_);
        return id;
    }

    function updateRestaurant(
        string calldata name_,
        string calldata location_,
        string calldata metadataCID_
    ) external {
        uint256 id = ownerToRestaurant[msg.sender];
        require(id != 0, "none");
        Restaurant storage r = restaurants[id];

        if (bytes(name_).length > 0) {
            require(bytes(name_).length <= 100, "bad name");
            r.name = name_;
        }
        if (bytes(location_).length > 0) {
            require(bytes(location_).length <= 100, "bad loc");
            r.location = location_;
        }
        if (bytes(metadataCID_).length > 0) {
            r.metadataCID = metadataCID_;
        }

        emit RestaurantUpdated(id, r.name, r.location, r.metadataCID);
    }

    function setRestaurantOpen(bool isOpen_) external {
        uint256 id = ownerToRestaurant[msg.sender];
        require(id != 0, "none");
        restaurants[id].isOpen = isOpen_;
        emit RestaurantOpenChanged(id, isOpen_);
    }

    // ============ Order Functions ============

    /**
     * @notice Place an order with native currency payment (backward compatible)
     * @param restaurantId_ Restaurant to order from
     * @param itemsData_ Encoded order items
     * @param matchmakerId_ Optional matchmaker ID (0 for none)
     */
    function placeOrder(
        uint256 restaurantId_,
        bytes calldata itemsData_,
        uint256 matchmakerId_
    ) external payable nonReentrant returns (uint256) {
        return _placeOrderInternal(restaurantId_, itemsData_, matchmakerId_, address(0), msg.value);
    }

    /**
     * @notice Place an order with ERC-20 token payment
     * @param restaurantId_ Restaurant to order from
     * @param itemsData_ Encoded order items
     * @param matchmakerId_ Optional matchmaker ID (0 for none)
     * @param paymentAsset_ ERC-20 token address (must be in allowedAssets)
     * @param totalPrice_ Total price in token units
     */
    function placeOrderWithToken(
        uint256 restaurantId_,
        bytes calldata itemsData_,
        uint256 matchmakerId_,
        address paymentAsset_,
        uint256 totalPrice_
    ) external nonReentrant returns (uint256) {
        require(paymentAsset_ != address(0), "use placeOrder for native");
        require(allowedAssets[paymentAsset_], "asset not allowed");
        // Note: non-payable function already rejects msg.value > 0
        require(totalPrice_ > 0, "no payment");

        // Transfer tokens from customer to contract
        IERC20(paymentAsset_).safeTransferFrom(msg.sender, address(this), totalPrice_);

        return _placeOrderInternal(restaurantId_, itemsData_, matchmakerId_, paymentAsset_, totalPrice_);
    }

    function _placeOrderInternal(
        uint256 restaurantId_,
        bytes calldata itemsData_,
        uint256 matchmakerId_,
        address paymentAsset_,
        uint256 price_
    ) internal returns (uint256) {
        Restaurant storage r = restaurants[restaurantId_];
        require(r.id != 0, "no restaurant");
        require(r.isOpen, "closed");
        require(r.owner != msg.sender, "own restaurant");
        require(price_ > 0, "no payment");
        require(itemsData_.length > 0, "no items");

        // Calculate matchmaker fee
        uint256 feeBps = 0;
        uint256 feeAmount = 0;
        if (matchmakerId_ != 0 && address(matchmakers) != address(0)) {
            (, , , uint16 bps, , bool active) = matchmakers.getMatchMaker(matchmakerId_);
            require(active, "mm inactive");
            require(bps <= 10000, "fee > 100%");
            feeBps = bps;
            feeAmount = (price_ * bps) / 10000;
        }

        uint256 id = nextOrderId++;
        orders[id] = Order({
            id: id,
            customer: msg.sender,
            restaurantId: restaurantId_,
            price: price_,
            status: Status.PLACED,
            placedAt: block.timestamp,
            completedAt: 0,
            canceledByCustomer: false,
            fundsReleased: false,
            paymentAsset: paymentAsset_,
            matchmakerId: matchmakerId_,
            matchmakerFeeBps: feeBps,
            matchmakerFeeAmount: feeAmount,
            itemsData: itemsData_
        });

        _customerOrders[msg.sender].push(id);
        _restaurantOrders[restaurantId_].push(id);

        emit OrderPlaced(id, restaurantId_, msg.sender, price_, paymentAsset_);
        return id;
    }

    function advanceOrderStatus(uint256 orderId_) external {
        Order storage o = orders[orderId_];
        require(o.id != 0, "no order");
        require(restaurants[o.restaurantId].owner == msg.sender, "auth");

        Status old = o.status;
        if (old == Status.PLACED) o.status = Status.CONFIRMED;
        else if (old == Status.CONFIRMED) o.status = Status.PREPARING;
        else if (old == Status.PREPARING) o.status = Status.READY;
        else revert("cannot advance");

        emit OrderStatusChanged(orderId_, old, o.status);
    }

    function completeOrder(uint256 orderId_) external nonReentrant {
        Order storage o = orders[orderId_];
        require(o.id != 0, "no order");
        require(o.customer == msg.sender, "auth");
        require(o.status == Status.READY, "not ready");

        o.status = Status.DONE;
        o.completedAt = block.timestamp;

        emit OrderStatusChanged(orderId_, Status.READY, Status.DONE);
    }

    function cancelOrder(uint256 orderId_) external nonReentrant {
        Order storage o = orders[orderId_];
        require(o.id != 0, "no order");

        bool isCustomer = o.customer == msg.sender;
        bool isRestaurant = restaurants[o.restaurantId].owner == msg.sender;
        require(isCustomer || isRestaurant, "auth");
        require(o.status != Status.DONE && o.status != Status.CANCELED, "cannot cancel");

        Status old = o.status;
        o.status = Status.CANCELED;
        o.canceledByCustomer = isCustomer;

        // Refund customer (native or ERC20)
        if (o.paymentAsset == address(0)) {
            (bool ok,) = payable(o.customer).call{value: o.price}("");
            require(ok, "refund failed");
        } else {
            IERC20(o.paymentAsset).safeTransfer(o.customer, o.price);
        }

        emit OrderStatusChanged(orderId_, old, Status.CANCELED);
        emit OrderCanceled(orderId_, isCustomer);
        emit RefundIssued(orderId_, o.customer, o.price);
    }

    function claimFunds(uint256 orderId_) external nonReentrant {
        Order storage o = orders[orderId_];
        require(o.id != 0, "no order");
        require(o.status == Status.DONE, "not done");
        require(!o.fundsReleased, "already claimed");

        Restaurant storage r = restaurants[o.restaurantId];
        require(r.owner == msg.sender, "auth");
        require(block.timestamp >= o.completedAt + DISPUTE_WINDOW, "dispute window");

        o.fundsReleased = true;

        // Calculate restaurant payout (minus matchmaker fee)
        uint256 fee = o.matchmakerFeeAmount;
        uint256 payout = o.price - fee;

        // Pay restaurant (native or ERC20)
        if (o.paymentAsset == address(0)) {
            (bool ok,) = payable(r.owner).call{value: payout}("");
            require(ok, "transfer failed");

            // Transfer matchmaker fee
            if (o.matchmakerId != 0 && fee > 0 && address(matchmakers) != address(0)) {
                (bool feeOk,) = payable(address(matchmakers)).call{value: fee}("");
                require(feeOk, "fee transfer failed");
                matchmakers.recordOrderMatchMaker(orderId_, o.matchmakerId, fee);
            }
        } else {
            IERC20(o.paymentAsset).safeTransfer(r.owner, payout);

            // Transfer matchmaker fee
            if (o.matchmakerId != 0 && fee > 0 && address(matchmakers) != address(0)) {
                IERC20(o.paymentAsset).safeTransfer(address(matchmakers), fee);
                matchmakers.recordOrderMatchMaker(orderId_, o.matchmakerId, fee);
            }
        }

        emit FundsReleased(orderId_, r.owner, payout);
    }

    // ============ Admin Functions ============

    function setMatchmakers(address matchmakers_) external onlyOwner {
        matchmakers = IMercadoMatchmakers(matchmakers_);
        emit MatchmakersUpdated(matchmakers_);
    }

    function addPaymentAsset(address asset_) external onlyOwner {
        require(asset_ != address(0), "zero address");
        require(!allowedAssets[asset_], "already allowed");
        allowedAssets[asset_] = true;
        emit PaymentAssetAdded(asset_);
    }

    function removePaymentAsset(address asset_) external onlyOwner {
        require(allowedAssets[asset_], "not allowed");
        allowedAssets[asset_] = false;
        emit PaymentAssetRemoved(asset_);
    }

    // ============ View Functions ============

    function getRestaurant(uint256 id_) external view returns (Restaurant memory) {
        return restaurants[id_];
    }

    function getOrder(uint256 id_) external view returns (Order memory) {
        return orders[id_];
    }

    function getCustomerOrderIds(address customer_) external view returns (uint256[] memory) {
        return _customerOrders[customer_];
    }

    function getRestaurantOrderIds(uint256 restaurantId_) external view returns (uint256[] memory) {
        return _restaurantOrders[restaurantId_];
    }

    function getTotalRestaurants() external view returns (uint256) {
        return nextRestaurantId - 1;
    }

    function getTotalOrders() external view returns (uint256) {
        return nextOrderId - 1;
    }

    function isDisputeWindowOpen(uint256 orderId_) external view returns (bool) {
        Order storage o = orders[orderId_];
        if (o.status != Status.DONE) return false;
        if (o.fundsReleased) return false;
        return block.timestamp <= o.completedAt + DISPUTE_WINDOW;
    }

    receive() external payable {}
}

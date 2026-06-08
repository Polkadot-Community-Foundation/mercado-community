// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IMockMobRule} from "./interfaces/IMockMobRule.sol";
import {IMercadoMatchmakers} from "./interfaces/IMercadoMatchmakers.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Ownable2StepUpgradeable} from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title Mercado
 * @notice Decentralized food delivery marketplace on Asset Hub EVM
 * @dev Upgradeable contract with escrow, restaurant registration, and dispute resolution
 */
contract Mercado is
    Initializable,
    Ownable2StepUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    /// @notice Version of the contract
    string public constant VERSION = "1.0.0";

    /// @notice Dispute window duration (24 hours after order completion)
    uint256 public constant DISPUTE_WINDOW = 24 hours;

    /// @notice Response window for disputes (24 hours)
    uint256 public constant DISPUTE_RESPONSE_WINDOW = 24 hours;

    /// @notice Native asset address (0x0)
    address public constant NATIVE_ASSET = address(0);

    /**
     * Note: enums here have corresponding types in packages/types
     * keep them in sync
     */

    enum OrderStatus {
        PLACED,
        CONFIRMED,
        PREPARING,
        READY_FOR_PICKUP,
        COMPLETED,
        CANCELED,
        DISPUTED
    }

    enum DisputeReason {
        WRONG_ITEMS,
        INCOMPLETE_ORDER,
        FOOD_QUALITY,
        NOT_READY,
        OTHER
    }

    struct Restaurant {
        uint256 id;
        address owner;
        string name;
        string location;
        string metadataCID; // IPFS CID for restaurant metadata (menu, description, avatar)
        bool isOpen;
        uint256 registeredAt;
        // Rating stored as sum/count for efficient average calculation
        uint256 ratingCount;
        uint256 ratingSum;
    }

    struct OrderItem {
        uint256 dishId;
        uint256 quantity;
        uint256[] selectedOptionIds;
    }

    struct Order {
        uint256 id;
        address customer;
        uint256 restaurantId;
        uint256 totalPrice;
        address paymentAsset; // address(0) for native token
        OrderStatus status;
        uint256 placedAt;
        uint256 completedAt;
        // Cancellation info
        bool canceledByCustomer;
        // Dispute fields
        uint256 disputeCaseId;
        string disputeMetadataCID;
        string counterEvidenceCID;
        address disputeInitiator;
        uint256 initiatorStake;
        uint256 challengerStake;
        bool faultAccepted;
        // Matchmaker fields
        uint256 matchmakerId;           // ID of referring matchmaker (0 = none)
        uint256 matchmakerFeeBps;       // Fee snapshot in basis points
        uint256 matchmakerFeeAmount;    // Calculated fee amount
        // Funds release tracking
        bool fundsReleased;             // True after funds claimed by restaurant
        // Rating
        uint8 rating; // 1-5, 0 = not rated
        // Items (stored as encoded bytes for gas efficiency)
        bytes itemsData;
    }

    /// @notice Counter for restaurant IDs
    uint256 private _nextRestaurantId;

    /// @notice Counter for order IDs
    uint256 private _nextOrderId;

    /// @notice Mapping of restaurant ID to Restaurant
    mapping(uint256 => Restaurant) public restaurants;

    /// @notice Mapping of owner address to restaurant ID
    mapping(address => uint256) public restaurantIdByOwner;

    /// @notice Mapping of order ID to Order
    mapping(uint256 => Order) public orders;

    /// @notice Mapping of allowed payment assets
    mapping(address => bool) public allowedAssets;

    /// @notice Address of MockMobRule contract for dispute resolution
    IMockMobRule public mockMobRule;

    /// @notice Address of MercadoMatchmakers contract
    IMercadoMatchmakers public mercadoMatchmakers;

    /// @notice Dispute stake amount (configurable)
    uint256 public disputeStakeAmount;

    /// @notice Mapping of customer address to their order IDs
    mapping(address => uint256[]) private _customerOrderIds;

    /// @notice Mapping of restaurant ID to their order IDs
    mapping(uint256 => uint256[]) private _restaurantOrderIds;

    // Events
    event RestaurantRegistered(
        uint256 indexed restaurantId,
        address indexed owner,
        string name,
        string location,
        string metadataCID
    );

    event RestaurantUpdated(uint256 indexed restaurantId, string name, string location, string metadataCID);

    event RestaurantOpenStatusChanged(uint256 indexed restaurantId, bool isOpen);

    event OrderPlaced(
        uint256 indexed orderId,
        uint256 indexed restaurantId,
        address indexed customer,
        uint256 totalPrice,
        address paymentAsset
    );

    event OrderStatusChanged(uint256 indexed orderId, OrderStatus oldStatus, OrderStatus newStatus);

    event OrderCanceled(uint256 indexed orderId, bool byCustomer);

    event OrderCompleted(uint256 indexed orderId, uint256 completedAt);

    event FundsReleased(uint256 indexed orderId, address indexed restaurant, uint256 amount);

    event RefundIssued(uint256 indexed orderId, address indexed customer, uint256 amount);

    event DisputeRaised(
        uint256 indexed orderId,
        uint256 indexed caseId,
        address indexed initiator,
        DisputeReason reason,
        string disputeMetadataCID
    );

    event DisputeEvidenceAdded(uint256 indexed orderId, address indexed submitter, string counterEvidenceCID);

    event DisputeStaked(uint256 indexed orderId, address indexed staker, uint256 amount);

    event FaultAccepted(uint256 indexed orderId, address indexed accepter);

    event RestaurantRated(uint256 indexed restaurantId, uint256 indexed orderId, address indexed customer, uint8 rating);

    event PaymentAssetAdded(address indexed asset);

    event PaymentAssetRemoved(address indexed asset);

    event MockMobRuleUpdated(address indexed newAddress, address indexed oldAddress);

    event DisputeStakeAmountUpdated(uint256 oldAmount, uint256 newAmount);

    event MercadoMatchmakersUpdated(address indexed newAddress, address indexed oldAddress);

    event OrderMatchmakerSet(uint256 indexed orderId, uint256 indexed matchmakerId, uint256 feeBps, uint256 feeAmount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the contract
     * @param owner_ Initial owner address
     */
    function initialize(address owner_) public initializer {
        __Ownable_init(owner_);
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        // Native asset is always allowed
        allowedAssets[NATIVE_ASSET] = true;

        // Dispute stake amount should be set via setDisputeStakeAmount() after deployment
        disputeStakeAmount = 0;

        _nextRestaurantId = 1;
        _nextOrderId = 1;
    }

    // ============ Restaurant Functions ============

    /**
     * @notice Register a new restaurant
     * @param name_ Restaurant name
     * @param location_ Restaurant location (city)
     * @param metadataCID_ IPFS CID for restaurant metadata
     * @return restaurantId The ID of the registered restaurant
     */
    function registerRestaurant(
        string memory name_,
        string memory location_,
        string memory metadataCID_
    ) external whenNotPaused returns (uint256) {
        require(bytes(name_).length > 0, "Name required");
        require(bytes(name_).length <= 100, "Name too long");
        require(bytes(location_).length > 0, "Location required");
        require(bytes(location_).length <= 100, "Location too long");
        require(restaurantIdByOwner[msg.sender] == 0, "Already registered");

        uint256 restaurantId = _nextRestaurantId;
        ++_nextRestaurantId;

        restaurants[restaurantId] = Restaurant({
            id: restaurantId,
            owner: msg.sender,
            name: name_,
            location: location_,
            metadataCID: metadataCID_,
            isOpen: false,
            registeredAt: block.timestamp,
            ratingCount: 0,
            ratingSum: 0
        });

        restaurantIdByOwner[msg.sender] = restaurantId;

        emit RestaurantRegistered(restaurantId, msg.sender, name_, location_, metadataCID_);

        return restaurantId;
    }

    /**
     * @notice Update restaurant information
     * @param name_ New name (empty to keep current)
     * @param location_ New location (empty to keep current)
     * @param metadataCID_ New metadata CID (empty to keep current)
     */
    function updateRestaurant(
        string memory name_,
        string memory location_,
        string memory metadataCID_
    ) external whenNotPaused {
        uint256 restaurantId = restaurantIdByOwner[msg.sender];
        require(restaurantId != 0, "Not a restaurant owner");

        Restaurant storage restaurant = restaurants[restaurantId];

        if (bytes(name_).length > 0) {
            require(bytes(name_).length <= 100, "Name too long");
            restaurant.name = name_;
        }
        if (bytes(location_).length > 0) {
            require(bytes(location_).length <= 100, "Location too long");
            restaurant.location = location_;
        }
        if (bytes(metadataCID_).length > 0) {
            restaurant.metadataCID = metadataCID_;
        }

        emit RestaurantUpdated(restaurantId, restaurant.name, restaurant.location, restaurant.metadataCID);
    }

    /**
     * @notice Toggle restaurant open status
     * @param isOpen_ Whether the restaurant is accepting orders
     */
    function setRestaurantOpen(bool isOpen_) external whenNotPaused {
        uint256 restaurantId = restaurantIdByOwner[msg.sender];
        require(restaurantId != 0, "Not a restaurant owner");

        restaurants[restaurantId].isOpen = isOpen_;

        emit RestaurantOpenStatusChanged(restaurantId, isOpen_);
    }

    // ============ Order Functions ============

    /**
     * @notice Place a new order
     * @param restaurantId_ Restaurant ID
     * @param itemsData_ Encoded order items (array of OrderItem)
     * @param totalPrice_ Total order price
     * @param paymentAsset_ Payment asset address (0x0 for native)
     * @param matchmakerId_ Optional matchmaker ID (0 = none)
     * @return orderId The ID of the placed order
     */
    function placeOrder(
        uint256 restaurantId_,
        bytes memory itemsData_,
        uint256 totalPrice_,
        address paymentAsset_,
        uint256 matchmakerId_
    ) external payable whenNotPaused nonReentrant returns (uint256) {
        Restaurant storage restaurant = restaurants[restaurantId_];
        require(restaurant.id != 0, "Restaurant not found");
        require(restaurant.isOpen, "Restaurant closed");
        require(restaurant.owner != msg.sender, "Cannot order from own restaurant");
        require(allowedAssets[paymentAsset_], "Asset not allowed");
        require(totalPrice_ > 0, "Invalid price");
        require(itemsData_.length > 0, "No items");

        // Handle payment
        if (paymentAsset_ == NATIVE_ASSET) {
            require(msg.value == totalPrice_, "Incorrect payment");
        } else {
            require(msg.value == 0, "Native payment not expected");
            require(IERC20(paymentAsset_).transferFrom(msg.sender, address(this), totalPrice_), "Transfer failed");
        }

        uint256 orderId = _nextOrderId;
        ++_nextOrderId;

        // Calculate matchmaker fee if applicable
        uint256 matchmakerFeeBps = 0;
        uint256 matchmakerFeeAmount = 0;
        if (matchmakerId_ != 0 && address(mercadoMatchmakers) != address(0)) {
            (, , , uint16 feeBps, , bool active) = mercadoMatchmakers.getMatchMaker(matchmakerId_);
            require(active, "Matchmaker not active");
            matchmakerFeeBps = feeBps;
            matchmakerFeeAmount = (totalPrice_ * feeBps) / 10000;
        }

        orders[orderId] = Order({
            id: orderId,
            customer: msg.sender,
            restaurantId: restaurantId_,
            totalPrice: totalPrice_,
            paymentAsset: paymentAsset_,
            status: OrderStatus.PLACED,
            placedAt: block.timestamp,
            completedAt: 0,
            canceledByCustomer: false,
            disputeCaseId: 0,
            disputeMetadataCID: "",
            counterEvidenceCID: "",
            disputeInitiator: address(0),
            initiatorStake: 0,
            challengerStake: 0,
            faultAccepted: false,
            matchmakerId: matchmakerId_,
            matchmakerFeeBps: matchmakerFeeBps,
            matchmakerFeeAmount: matchmakerFeeAmount,
            fundsReleased: false,
            rating: 0,
            itemsData: itemsData_
        });

        _customerOrderIds[msg.sender].push(orderId);
        _restaurantOrderIds[restaurantId_].push(orderId);

        // Emit matchmaker info if applicable (recording happens at completion)
        if (matchmakerId_ != 0) {
            emit OrderMatchmakerSet(orderId, matchmakerId_, matchmakerFeeBps, matchmakerFeeAmount);
        }

        emit OrderPlaced(orderId, restaurantId_, msg.sender, totalPrice_, paymentAsset_);

        return orderId;
    }

    /**
     * @notice Advance order status (restaurant only)
     * @param orderId_ Order ID
     */
    function advanceOrderStatus(uint256 orderId_) external whenNotPaused {
        Order storage order = orders[orderId_];
        require(order.id != 0, "Order not found");

        Restaurant storage restaurant = restaurants[order.restaurantId];
        require(restaurant.owner == msg.sender, "Not restaurant owner");

        OrderStatus oldStatus = order.status;
        OrderStatus newStatus;

        if (oldStatus == OrderStatus.PLACED) {
            newStatus = OrderStatus.CONFIRMED;
        } else if (oldStatus == OrderStatus.CONFIRMED) {
            newStatus = OrderStatus.PREPARING;
        } else if (oldStatus == OrderStatus.PREPARING) {
            newStatus = OrderStatus.READY_FOR_PICKUP;
        } else {
            revert("Cannot advance status");
        }

        order.status = newStatus;
        emit OrderStatusChanged(orderId_, oldStatus, newStatus);
    }

    /**
     * @notice Complete order pickup (customer only)
     * @param orderId_ Order ID
     */
    function completeOrder(uint256 orderId_) external whenNotPaused nonReentrant {
        Order storage order = orders[orderId_];
        require(order.id != 0, "Order not found");
        require(order.customer == msg.sender, "Not order customer");
        require(order.status == OrderStatus.READY_FOR_PICKUP, "Order not ready");

        order.status = OrderStatus.COMPLETED;
        order.completedAt = block.timestamp;

        emit OrderStatusChanged(orderId_, OrderStatus.READY_FOR_PICKUP, OrderStatus.COMPLETED);
        emit OrderCompleted(orderId_, order.completedAt);

        // Release funds to restaurant (can be claimed after dispute window)
        // Note: Actual transfer happens after dispute window closes
    }

    /**
     * @notice Cancel order
     * @param orderId_ Order ID
     */
    function cancelOrder(uint256 orderId_) external whenNotPaused nonReentrant {
        Order storage order = orders[orderId_];
        require(order.id != 0, "Order not found");

        Restaurant storage restaurant = restaurants[order.restaurantId];
        bool isCustomer = order.customer == msg.sender;
        bool isRestaurant = restaurant.owner == msg.sender;

        require(isCustomer || isRestaurant, "Unauthorized");
        require(
            order.status == OrderStatus.PLACED ||
            order.status == OrderStatus.CONFIRMED ||
            order.status == OrderStatus.PREPARING ||
            order.status == OrderStatus.READY_FOR_PICKUP,
            "Cannot cancel"
        );

        OrderStatus oldStatus = order.status;
        order.status = OrderStatus.CANCELED;
        order.canceledByCustomer = isCustomer;

        emit OrderStatusChanged(orderId_, oldStatus, OrderStatus.CANCELED);
        emit OrderCanceled(orderId_, isCustomer);

        // Refund customer
        _refund(orderId_);
    }

    /**
     * @notice Claim funds for completed order (restaurant only, after dispute window)
     * @param orderId_ Order ID
     */
    function claimFunds(uint256 orderId_) external whenNotPaused nonReentrant {
        Order storage order = orders[orderId_];
        require(order.id != 0, "Order not found");
        require(order.status == OrderStatus.COMPLETED, "Order not completed");
        require(order.disputeCaseId == 0, "Order has dispute");
        require(!order.fundsReleased, "Funds already released");

        Restaurant storage restaurant = restaurants[order.restaurantId];
        require(restaurant.owner == msg.sender, "Not restaurant owner");

        // Check dispute window has passed
        require(block.timestamp >= order.completedAt + DISPUTE_WINDOW, "Dispute window open");

        // Mark funds as released before transfer (prevent reentrancy)
        order.fundsReleased = true;

        // Calculate restaurant payout (subtract matchmaker fee if applicable)
        uint256 matchmakerFee = order.matchmakerFeeAmount;
        uint256 restaurantPayout = order.totalPrice - matchmakerFee;

        // Transfer funds to restaurant
        _transferFunds(restaurant.owner, restaurantPayout, order.paymentAsset);

        // Transfer and accumulate matchmaker fee if applicable
        if (order.matchmakerId != 0 && matchmakerFee > 0 && address(mercadoMatchmakers) != address(0)) {
            // Transfer fee to matchmakers contract (native only for now)
            if (order.paymentAsset == NATIVE_ASSET) {
                (bool ok, ) = payable(address(mercadoMatchmakers)).call{value: matchmakerFee}("");
                require(ok, "Fee transfer failed");
            }
            // Record and accumulate the fee
            mercadoMatchmakers.recordOrderMatchMaker(order.id, order.matchmakerId, matchmakerFee);
        }

        emit FundsReleased(orderId_, restaurant.owner, restaurantPayout);
    }

    // ============ Dispute Functions ============

    /**
     * @notice Raise a dispute on a completed order
     * @param orderId_ Order ID
     * @param reason_ Dispute reason
     * @param disputeMetadataCID_ IPFS CID for dispute evidence
     */
    function raiseDispute(
        uint256 orderId_,
        DisputeReason reason_,
        string memory disputeMetadataCID_
    ) external payable whenNotPaused nonReentrant {
        Order storage order = orders[orderId_];
        require(order.id != 0, "Order not found");
        require(order.status == OrderStatus.COMPLETED, "Order not completed");
        require(order.disputeCaseId == 0, "Dispute already exists");
        require(bytes(disputeMetadataCID_).length > 0, "Evidence required");

        // Check dispute window
        require(block.timestamp <= order.completedAt + DISPUTE_WINDOW, "Dispute window closed");

        // Only customer or restaurant can raise dispute
        Restaurant storage restaurant = restaurants[order.restaurantId];
        bool isCustomer = order.customer == msg.sender;
        bool isRestaurant = restaurant.owner == msg.sender;
        require(isCustomer || isRestaurant, "Unauthorized");

        // Require stake
        require(msg.value == disputeStakeAmount, "Incorrect stake");

        // Create dispute case in MockMobRule
        uint256 caseId = mockMobRule.createDispute(
            orderId_,
            order.customer,
            restaurant.owner,
            msg.sender,
            disputeMetadataCID_
        );

        order.disputeCaseId = caseId;
        order.disputeMetadataCID = disputeMetadataCID_;
        order.disputeInitiator = msg.sender;
        order.initiatorStake = msg.value;
        order.status = OrderStatus.DISPUTED;

        emit OrderStatusChanged(orderId_, OrderStatus.COMPLETED, OrderStatus.DISPUTED);
        emit DisputeRaised(orderId_, caseId, msg.sender, reason_, disputeMetadataCID_);
        emit DisputeStaked(orderId_, msg.sender, msg.value);
    }

    /**
     * @notice Add counter-evidence to a dispute
     * @param orderId_ Order ID
     * @param counterEvidenceCID_ IPFS CID for counter-evidence
     */
    function addCounterEvidence(
        uint256 orderId_,
        string memory counterEvidenceCID_
    ) external payable whenNotPaused nonReentrant {
        Order storage order = orders[orderId_];
        require(order.id != 0, "Order not found");
        require(order.status == OrderStatus.DISPUTED, "No dispute");
        require(bytes(counterEvidenceCID_).length > 0, "Evidence required");
        require(bytes(order.counterEvidenceCID).length == 0, "Counter-evidence exists");

        // Only non-initiator can add counter-evidence
        Restaurant storage restaurant = restaurants[order.restaurantId];
        bool isCustomer = order.customer == msg.sender;
        bool isRestaurant = restaurant.owner == msg.sender;
        require(isCustomer || isRestaurant, "Unauthorized");
        require(msg.sender != order.disputeInitiator, "Initiator cannot add counter");

        // Require stake
        require(msg.value == disputeStakeAmount, "Incorrect stake");

        order.counterEvidenceCID = counterEvidenceCID_;
        order.challengerStake = msg.value;

        mockMobRule.addCounterEvidence(order.disputeCaseId, counterEvidenceCID_);

        emit DisputeEvidenceAdded(orderId_, msg.sender, counterEvidenceCID_);
        emit DisputeStaked(orderId_, msg.sender, msg.value);
    }

    /**
     * @notice Accept fault in a dispute (auto-resolves in initiator's favor)
     * @param orderId_ Order ID
     */
    function acceptFault(uint256 orderId_) external whenNotPaused nonReentrant {
        Order storage order = orders[orderId_];
        require(order.id != 0, "Order not found");
        require(order.status == OrderStatus.DISPUTED, "No dispute");
        require(bytes(order.counterEvidenceCID).length == 0, "Counter-evidence exists");

        // Only non-initiator can accept fault
        Restaurant storage restaurant = restaurants[order.restaurantId];
        bool isCustomer = order.customer == msg.sender;
        bool isRestaurant = restaurant.owner == msg.sender;
        require(isCustomer || isRestaurant, "Unauthorized");
        require(msg.sender != order.disputeInitiator, "Initiator cannot accept fault");

        order.faultAccepted = true;

        mockMobRule.acceptFault(order.disputeCaseId);

        emit FaultAccepted(orderId_, msg.sender);

        // Resolve in initiator's favor
        _resolveDispute(orderId_, true);
    }

    /**
     * @notice Claim dispute resolution (after admin verdict)
     * @param orderId_ Order ID
     */
    function claimDisputeResolution(uint256 orderId_) external whenNotPaused nonReentrant {
        Order storage order = orders[orderId_];
        require(order.id != 0, "Order not found");
        require(order.status == OrderStatus.DISPUTED, "No dispute");
        require(order.disputeCaseId != 0, "No case");

        IMockMobRule.Verdict verdict = mockMobRule.getVerdict(order.disputeCaseId);
        require(verdict != IMockMobRule.Verdict.Pending, "Verdict pending");

        bool initiatorWins = verdict == IMockMobRule.Verdict.InitiatorWins;
        _resolveDispute(orderId_, initiatorWins);
    }

    // ============ Rating Functions ============

    /**
     * @notice Rate a restaurant for a completed order
     * @param orderId_ Order ID
     * @param rating_ Rating (1-5)
     */
    function rateRestaurant(uint256 orderId_, uint8 rating_) external whenNotPaused {
        require(rating_ >= 1 && rating_ <= 5, "Invalid rating");

        Order storage order = orders[orderId_];
        require(order.id != 0, "Order not found");
        require(order.customer == msg.sender, "Not order customer");
        require(order.status == OrderStatus.COMPLETED, "Order not completed");
        require(order.rating == 0, "Already rated");

        order.rating = rating_;

        Restaurant storage restaurant = restaurants[order.restaurantId];
        restaurant.ratingCount += 1;
        restaurant.ratingSum += rating_;

        emit RestaurantRated(order.restaurantId, orderId_, msg.sender, rating_);
    }

    // ============ Admin Functions ============

    /**
     * @notice Set MockMobRule contract address
     * @param mockMobRule_ New MockMobRule address
     */
    function setMockMobRule(address mockMobRule_) external onlyOwner {
        require(mockMobRule_ != address(0), "Invalid address");
        address oldAddress = address(mockMobRule);
        mockMobRule = IMockMobRule(mockMobRule_);
        emit MockMobRuleUpdated(mockMobRule_, oldAddress);
    }

    /**
     * @notice Set MercadoMatchmakers contract address
     * @param mercadoMatchmakers_ New MercadoMatchmakers address
     */
    function setMercadoMatchmakers(address mercadoMatchmakers_) external onlyOwner {
        address oldAddress = address(mercadoMatchmakers);
        mercadoMatchmakers = IMercadoMatchmakers(mercadoMatchmakers_);
        emit MercadoMatchmakersUpdated(mercadoMatchmakers_, oldAddress);
    }

    /**
     * @notice Set dispute stake amount
     * @param amount_ New stake amount
     */
    function setDisputeStakeAmount(uint256 amount_) external onlyOwner {
        uint256 oldAmount = disputeStakeAmount;
        disputeStakeAmount = amount_;
        emit DisputeStakeAmountUpdated(oldAmount, amount_);
    }

    /**
     * @notice Add allowed payment asset
     * @param asset_ Asset address
     */
    function addPaymentAsset(address asset_) external onlyOwner {
        require(!allowedAssets[asset_], "Already allowed");
        allowedAssets[asset_] = true;
        emit PaymentAssetAdded(asset_);
    }

    /**
     * @notice Remove allowed payment asset
     * @param asset_ Asset address
     */
    function removePaymentAsset(address asset_) external onlyOwner {
        require(asset_ != NATIVE_ASSET, "Cannot remove native");
        require(allowedAssets[asset_], "Not allowed");
        allowedAssets[asset_] = false;
        emit PaymentAssetRemoved(asset_);
    }

    /**
     * @notice Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ View Functions ============

    /**
     * @notice Get restaurant by ID
     */
    function getRestaurant(uint256 restaurantId_) external view returns (Restaurant memory) {
        return restaurants[restaurantId_];
    }

    /**
     * @notice Get order by ID
     */
    function getOrder(uint256 orderId_) external view returns (Order memory) {
        return orders[orderId_];
    }

    /**
     * @notice Get customer's order IDs
     */
    function getCustomerOrderIds(address customer_) external view returns (uint256[] memory) {
        return _customerOrderIds[customer_];
    }

    /**
     * @notice Get restaurant's order IDs
     */
    function getRestaurantOrderIds(uint256 restaurantId_) external view returns (uint256[] memory) {
        return _restaurantOrderIds[restaurantId_];
    }

    /**
     * @notice Get total number of restaurants
     */
    function getTotalRestaurants() external view returns (uint256) {
        return _nextRestaurantId > 0 ? _nextRestaurantId - 1 : 0;
    }

    /**
     * @notice Get total number of orders
     */
    function getTotalOrders() external view returns (uint256) {
        return _nextOrderId > 0 ? _nextOrderId - 1 : 0;
    }

    /**
     * @notice Check if dispute window is open for an order
     */
    function isDisputeWindowOpen(uint256 orderId_) external view returns (bool) {
        Order storage order = orders[orderId_];
        if (order.status != OrderStatus.COMPLETED) return false;
        if (order.disputeCaseId != 0) return false;
        return block.timestamp <= order.completedAt + DISPUTE_WINDOW;
    }

    // ============ Internal Functions ============

    function _transferFunds(address to_, uint256 amount_, address asset_) internal {
        if (asset_ == NATIVE_ASSET) {
            (bool success, ) = payable(to_).call{value: amount_}("");
            require(success, "Transfer failed");
        } else {
            require(IERC20(asset_).transfer(to_, amount_), "Transfer failed");
        }
    }

    function _refund(uint256 orderId_) internal {
        Order storage order = orders[orderId_];
        _transferFunds(order.customer, order.totalPrice, order.paymentAsset);
        emit RefundIssued(orderId_, order.customer, order.totalPrice);
    }

    function _resolveDispute(uint256 orderId_, bool initiatorWins_) internal {
        Order storage order = orders[orderId_];
        Restaurant storage restaurant = restaurants[order.restaurantId];

        uint256 totalStake = order.initiatorStake + order.challengerStake;
        uint256 orderAmount = order.totalPrice;

        address winner;

        if (initiatorWins_) {
            winner = order.disputeInitiator;
        } else {
            winner = order.disputeInitiator == order.customer ? restaurant.owner : order.customer;
        }

        // Transfer order amount (in payment asset - could be ERC-20 or native)
        _transferFunds(winner, orderAmount, order.paymentAsset);

        // Transfer stakes separately (always native ETH)
        if (totalStake > 0) {
            (bool ok, ) = payable(winner).call{value: totalStake}("");
            require(ok, "Stake transfer failed");
        }

        // Emit appropriate event
        if (winner == order.customer) {
            emit RefundIssued(orderId_, winner, orderAmount);
        } else {
            emit FundsReleased(orderId_, winner, orderAmount);
        }

        // Mark funds as released and order resolved
        order.fundsReleased = true;
        order.status = OrderStatus.COMPLETED;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @notice Receive native tokens
     */
    receive() external payable {}
}

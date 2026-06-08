// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IMercadoCore {
    function orders(uint256 id) external view returns (
        address customer,
        uint256 restaurantId,
        uint256 price,
        uint8 status,
        uint256 completedAt
    );
}

/**
 * @title MercadoMatchmakers
 * @notice Matchmaker registration and fee management for Mercado
 */
contract MercadoMatchmakers is Ownable {
    IMercadoCore public immutable mercado;

    struct MatchMaker {
        uint256 id;
        address owner;
        string name;
        uint16 feePercentage; // basis points (100 = 1%)
        uint256 registeredAt;
        bool active;
    }

    uint256 public nextMatchMakerId = 1;
    uint16 public constant MAX_FEE = 1000; // 10%

    mapping(uint256 => MatchMaker) public matchMakers;
    mapping(address => uint256) public matchMakerIdByOwner;
    mapping(uint256 => uint256) public matchMakerFees; // mmId => accumulated fees
    mapping(uint256 => uint256) public orderMatchMaker; // orderId => mmId
    mapping(uint256 => uint256) public orderMatchMakerFee; // orderId => fee amount

    event MatchMakerRegistered(uint256 indexed id, address indexed owner, string name, uint16 feePercentage);
    event MatchMakerFeeUpdated(uint256 indexed id, uint16 oldFee, uint16 newFee);
    event OrderMatchMakerRecorded(uint256 indexed orderId, uint256 indexed matchmakerId, uint256 feeAmount);
    event MatchMakerFeesClaimed(uint256 indexed id, address indexed to, uint256 amount);

    constructor(address mercado_, address owner_) Ownable(owner_) {
        mercado = IMercadoCore(mercado_);
    }

    function registerMatchMaker(string calldata name_, uint16 feeBps_) external returns (uint256) {
        require(bytes(name_).length > 0, "empty name");
        require(feeBps_ <= MAX_FEE, "fee too high");
        require(matchMakerIdByOwner[msg.sender] == 0, "already registered");

        uint256 id = nextMatchMakerId++;
        matchMakers[id] = MatchMaker({
            id: id,
            owner: msg.sender,
            name: name_,
            feePercentage: feeBps_,
            registeredAt: block.timestamp,
            active: true
        });
        matchMakerIdByOwner[msg.sender] = id;

        emit MatchMakerRegistered(id, msg.sender, name_, feeBps_);
        return id;
    }

    function updateMatchMakerFee(uint16 newFeeBps_) external {
        uint256 id = matchMakerIdByOwner[msg.sender];
        require(id != 0, "not registered");
        require(newFeeBps_ <= MAX_FEE, "fee too high");

        uint16 oldFee = matchMakers[id].feePercentage;
        matchMakers[id].feePercentage = newFeeBps_;

        emit MatchMakerFeeUpdated(id, oldFee, newFeeBps_);
    }

    /**
     * @notice Record matchmaker for an order and accumulate fee
     * @dev Only callable by the Mercado contract
     * @param orderId_ Order ID
     * @param mmId_ Matchmaker ID
     * @param feeAmount_ Fee amount to accumulate
     */
    function recordOrderMatchMaker(uint256 orderId_, uint256 mmId_, uint256 feeAmount_) external {
        require(msg.sender == address(mercado), "only mercado");
        require(matchMakers[mmId_].id != 0, "mm not found");
        require(orderMatchMaker[orderId_] == 0, "already recorded");

        orderMatchMaker[orderId_] = mmId_;
        orderMatchMakerFee[orderId_] = feeAmount_;

        // Accumulate fee directly (funds already transferred from Mercado)
        matchMakerFees[mmId_] += feeAmount_;

        emit OrderMatchMakerRecorded(orderId_, mmId_, feeAmount_);
    }

    function claimMatchMakerFees(address to_) external {
        uint256 id = matchMakerIdByOwner[msg.sender];
        require(id != 0, "not registered");

        uint256 amount = matchMakerFees[id];
        require(amount > 0, "no fees");

        matchMakerFees[id] = 0;

        (bool ok, ) = payable(to_).call{value: amount}("");
        require(ok, "transfer failed");

        emit MatchMakerFeesClaimed(id, to_, amount);
    }

    // View functions
    function getMatchMaker(uint256 id_) external view returns (
        uint256 id,
        address owner,
        string memory name,
        uint16 feePercentage,
        uint256 registeredAt,
        bool active
    ) {
        MatchMaker memory m = matchMakers[id_];
        return (m.id, m.owner, m.name, m.feePercentage, m.registeredAt, m.active);
    }

    function isMatchMakerRegistered(address owner_) external view returns (bool) {
        return matchMakerIdByOwner[owner_] != 0;
    }

    function getMatchMakerIdByOwner(address owner_) external view returns (uint256) {
        return matchMakerIdByOwner[owner_];
    }

    function getMatchMakerFees(uint256 id_) external view returns (uint256) {
        return matchMakerFees[id_];
    }

    function getTotalMatchMakers() external view returns (uint256) {
        return nextMatchMakerId - 1;
    }

    function getOrderMatchMaker(uint256 orderId_) external view returns (uint256 mmId, uint256 feeAmount) {
        return (orderMatchMaker[orderId_], orderMatchMakerFee[orderId_]);
    }

    receive() external payable {}
}

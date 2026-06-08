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
    function restaurants(uint256 id) external view returns (
        address owner,
        string memory name,
        string memory location,
        bool isOpen
    );
}

/**
 * @title MercadoDisputes
 * @notice Dispute resolution with staking for Mercado
 */
contract MercadoDisputes is Ownable {
    IMercadoCore public immutable mercado;

    uint256 public stakeAmount = 1 ether;
    uint256 public constant DISPUTE_WINDOW = 24 hours;
    uint256 public constant RESPONSE_WINDOW = 24 hours;

    enum Verdict { PENDING, CUSTOMER_WINS, RESTAURANT_WINS }

    struct Dispute {
        uint256 orderId;
        address initiator;
        string evidenceCID;
        string counterCID;
        uint256 initiatorStake;
        uint256 challengerStake;
        uint256 createdAt;
        Verdict verdict;
        bool claimed;
        bool faultAccepted;    // true if challenger accepted fault
        uint256 resolvedAt;    // timestamp when resolved
    }

    uint256 public nextDisputeId = 1;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => uint256) public orderToDispute;

    event DisputeCreated(uint256 indexed disputeId, uint256 indexed orderId, address indexed initiator);
    event CounterEvidence(uint256 indexed disputeId, address indexed challenger);
    event FaultAccepted(uint256 indexed disputeId, address indexed accepter);
    event Resolved(uint256 indexed disputeId, Verdict verdict);
    event Claimed(uint256 indexed disputeId, address indexed winner, uint256 amount);

    constructor(address mercado_, address owner_) Ownable(owner_) {
        mercado = IMercadoCore(mercado_);
    }

    function setStakeAmount(uint256 amount_) external onlyOwner {
        stakeAmount = amount_;
    }

    function raiseDispute(uint256 orderId_, string calldata evidenceCID_) external payable returns (uint256) {
        require(msg.value == stakeAmount, "wrong stake");
        require(orderToDispute[orderId_] == 0, "exists");
        require(bytes(evidenceCID_).length > 0, "need evidence");

        (address customer, uint256 rid, , uint8 status, uint256 completedAt) = mercado.orders(orderId_);
        require(status == 4, "not completed"); // DONE
        require(block.timestamp <= completedAt + DISPUTE_WINDOW, "window closed");

        (address restaurantOwner, , , ) = mercado.restaurants(rid);
        require(msg.sender == customer || msg.sender == restaurantOwner, "unauthorized");

        uint256 id = nextDisputeId++;
        disputes[id] = Dispute({
            orderId: orderId_,
            initiator: msg.sender,
            evidenceCID: evidenceCID_,
            counterCID: "",
            initiatorStake: msg.value,
            challengerStake: 0,
            createdAt: block.timestamp,
            verdict: Verdict.PENDING,
            claimed: false,
            faultAccepted: false,
            resolvedAt: 0
        });
        orderToDispute[orderId_] = id;

        emit DisputeCreated(id, orderId_, msg.sender);
        return id;
    }

    function addCounterEvidence(uint256 disputeId_, string calldata counterCID_) external payable {
        Dispute storage d = disputes[disputeId_];
        require(d.orderId != 0, "not found");
        require(d.verdict == Verdict.PENDING, "resolved");
        require(bytes(d.counterCID).length == 0, "exists");
        require(msg.value == stakeAmount, "wrong stake");
        require(bytes(counterCID_).length > 0, "need evidence");

        (address customer, uint256 rid, , , ) = mercado.orders(d.orderId);
        (address restaurantOwner, , , ) = mercado.restaurants(rid);

        require(msg.sender == customer || msg.sender == restaurantOwner, "unauthorized");
        require(msg.sender != d.initiator, "not challenger");

        d.counterCID = counterCID_;
        d.challengerStake = msg.value;

        emit CounterEvidence(disputeId_, msg.sender);
    }

    function acceptFault(uint256 disputeId_) external {
        Dispute storage d = disputes[disputeId_];
        require(d.orderId != 0 && d.verdict == Verdict.PENDING, "invalid");
        require(bytes(d.counterCID).length == 0, "has counter");

        (address customer, uint256 rid, , , ) = mercado.orders(d.orderId);
        (address restaurantOwner, , , ) = mercado.restaurants(rid);

        require(msg.sender == customer || msg.sender == restaurantOwner, "unauthorized");
        require(msg.sender != d.initiator, "not challenger");

        d.faultAccepted = true;
        d.resolvedAt = block.timestamp;
        d.verdict = d.initiator == customer ? Verdict.CUSTOMER_WINS : Verdict.RESTAURANT_WINS;
        emit FaultAccepted(disputeId_, msg.sender);
        emit Resolved(disputeId_, d.verdict);
    }

    function resolve(uint256 disputeId_, Verdict verdict_) external onlyOwner {
        Dispute storage d = disputes[disputeId_];
        require(d.orderId != 0 && d.verdict == Verdict.PENDING, "invalid");
        require(verdict_ != Verdict.PENDING, "need verdict");

        d.resolvedAt = block.timestamp;
        d.verdict = verdict_;
        emit Resolved(disputeId_, verdict_);
    }

    /**
     * @notice Auto-resolve dispute in initiator's favor if no response within window
     * @dev Anyone can call this after RESPONSE_WINDOW expires without counter-evidence
     * @param disputeId_ Dispute ID
     */
    function autoResolve(uint256 disputeId_) external {
        Dispute storage d = disputes[disputeId_];
        require(d.orderId != 0 && d.verdict == Verdict.PENDING, "invalid");
        require(bytes(d.counterCID).length == 0, "has counter");
        require(!d.faultAccepted, "fault accepted");
        require(block.timestamp >= d.createdAt + RESPONSE_WINDOW, "window open");

        (address customer, , , , ) = mercado.orders(d.orderId);

        d.resolvedAt = block.timestamp;
        // Initiator wins by default when no response
        d.verdict = d.initiator == customer ? Verdict.CUSTOMER_WINS : Verdict.RESTAURANT_WINS;

        emit Resolved(disputeId_, d.verdict);
    }

    /**
     * @notice Claim dispute stakes (order funds must be claimed separately via Mercado)
     * @dev Winner receives both stakes. Order funds are handled by the main Mercado contract.
     * @param disputeId_ Dispute ID
     */
    function claim(uint256 disputeId_) external {
        Dispute storage d = disputes[disputeId_];
        require(d.orderId != 0 && !d.claimed, "invalid");
        require(d.verdict != Verdict.PENDING, "pending");

        (address customer, uint256 rid, , , ) = mercado.orders(d.orderId);
        (address restaurantOwner, , , ) = mercado.restaurants(rid);

        address winner;
        if (d.verdict == Verdict.CUSTOMER_WINS) winner = customer;
        else winner = restaurantOwner;

        require(msg.sender == winner, "not winner");

        d.claimed = true;
        // Stakes payout only - order funds handled by Mercado contract
        uint256 totalStakes = d.initiatorStake + d.challengerStake;

        if (totalStakes > 0) {
            (bool ok, ) = payable(winner).call{value: totalStakes}("");
            require(ok, "transfer failed");
        }

        emit Claimed(disputeId_, winner, totalStakes);
    }

    receive() external payable {}
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockMobRule
 * @notice Mock dispute resolution contract for mercado food delivery disputes
 * @dev Admin-resolved disputes - will be replaced with real MobRule in Phase 3
 * @author mercado Team
 */
contract MockMobRule is Ownable {
    /// @notice Verdict types
    /// @dev Pending = not yet resolved, InitiatorWins = initiator's claim is valid, InitiatorLoses = initiator's claim rejected
    enum Verdict {
        Pending,
        InitiatorWins,
        InitiatorLoses
    }

    /// @notice Dispute case structure
    struct Case {
        uint256 caseId;
        uint256 orderId;
        address customer;
        address restaurant;
        address initiator; // Who raised the dispute (customer or restaurant)
        string disputeMetadataCID; // IPFS CID from Bulletin Chain containing full dispute metadata
        string counterEvidenceCID; // IPFS CID from Bulletin Chain containing counter-evidence
        Verdict verdict; // Pending until resolved
        uint256 createdAt;
    }

    /// @notice Counter for case IDs
    uint256 private _nextCaseId;

    /// @notice Mapping of case ID to Case
    mapping(uint256 => Case) public cases;

    /// @notice Mapping of order ID to case ID (one dispute per order)
    mapping(uint256 => uint256) public orderToCase;

    /// @notice Mercado contract address (immutable, set at deployment)
    address public immutable MERCADO;

    /// @notice Event emitted when a new dispute case is created
    event CaseCreated(
        uint256 indexed caseId,
        uint256 indexed orderId,
        address indexed customer,
        address restaurant,
        address initiator,
        string disputeMetadataCID
    );

    /// @notice Event emitted when counter-evidence is added to a case
    event CounterEvidenceAdded(uint256 indexed caseId, address indexed submitter, string counterEvidenceCID);

    /// @notice Event emitted when a case is resolved
    event CaseResolved(uint256 indexed caseId, Verdict indexed verdict);

    /**
     * @notice Initialize MockMobRule contract
     * @param initialOwner Address that will own the contract (admin)
     * @param mercado_ Address of Mercado contract (immutable)
     */
    constructor(address initialOwner, address mercado_) Ownable(initialOwner) {
        require(mercado_ != address(0), "Invalid mercado");
        MERCADO = mercado_;
        _nextCaseId = 1;
    }

    /**
     * @notice Create a new dispute case
     * @param orderId_ The order ID from Mercado
     * @param customer_ Customer address
     * @param restaurant_ Restaurant owner address
     * @param initiator_ Who is raising the dispute (must be either customer_ or restaurant_)
     * @param disputeMetadataCID_ IPFS CID from Bulletin Chain containing full dispute metadata
     * @return caseId The ID of the created case
     */
    function createDispute(
        uint256 orderId_,
        address customer_,
        address restaurant_,
        address initiator_,
        string memory disputeMetadataCID_
    ) external returns (uint256) {
        require(customer_ != address(0), "Invalid customer");
        require(restaurant_ != address(0), "Invalid restaurant");
        require(initiator_ != address(0), "Invalid initiator");
        require(initiator_ == customer_ || initiator_ == restaurant_, "Initiator must be customer or restaurant");
        require(bytes(disputeMetadataCID_).length > 0, "CID required");
        require(orderToCase[orderId_] == 0, "Dispute exists");

        uint256 caseId = _nextCaseId;
        ++_nextCaseId;
        cases[caseId] = Case({
            caseId: caseId,
            orderId: orderId_,
            customer: customer_,
            restaurant: restaurant_,
            initiator: initiator_,
            disputeMetadataCID: disputeMetadataCID_,
            counterEvidenceCID: "",
            verdict: Verdict.Pending,
            createdAt: block.timestamp
        });

        orderToCase[orderId_] = caseId;

        emit CaseCreated(caseId, orderId_, customer_, restaurant_, initiator_, disputeMetadataCID_);

        return caseId;
    }

    /**
     * @notice Add counter-evidence to an existing dispute case
     * @param caseId_ The case ID
     * @param counterEvidenceCID_ IPFS CID from Bulletin Chain containing counter-evidence metadata
     * @dev Only the non-initiator party (customer or restaurant) can add counter-evidence
     * @dev Can be called by Mercado contract on behalf of users
     */
    function addCounterEvidence(uint256 caseId_, string memory counterEvidenceCID_) external {
        Case storage case_ = cases[caseId_];
        require(case_.caseId != 0, "Case does not exist");
        require(case_.verdict == Verdict.Pending, "Case already resolved");
        require(bytes(counterEvidenceCID_).length > 0, "CID required");
        require(bytes(case_.counterEvidenceCID).length == 0, "Counter-evidence already submitted");

        case_.counterEvidenceCID = counterEvidenceCID_;

        emit CounterEvidenceAdded(caseId_, msg.sender, counterEvidenceCID_);
    }

    /**
     * @notice Accept fault and auto-resolve case in favor of initiator (Mercado only)
     * @param caseId_ The case ID to resolve
     * @dev Can only be called by the Mercado contract
     * @dev Automatically sets verdict to InitiatorWins
     */
    function acceptFault(uint256 caseId_) external {
        require(msg.sender == MERCADO, "Unauthorized: only Mercado can call this");

        Case storage case_ = cases[caseId_];
        require(case_.caseId != 0, "Case does not exist");
        require(case_.verdict == Verdict.Pending, "Case already resolved");

        case_.verdict = Verdict.InitiatorWins;

        emit CaseResolved(caseId_, Verdict.InitiatorWins);
    }

    /**
     * @notice Resolve a dispute case (admin only)
     * @param caseId_ The case ID to resolve
     * @param verdict_ The verdict (1 = InitiatorWins, 2 = InitiatorLoses)
     * @dev Cannot set verdict back to Pending
     */
    function resolveCase(uint256 caseId_, Verdict verdict_) external onlyOwner {
        Case storage case_ = cases[caseId_];
        require(case_.caseId != 0, "Case does not exist");
        require(case_.verdict == Verdict.Pending, "Case already resolved");
        require(verdict_ != Verdict.Pending, "Cannot set Pending");

        case_.verdict = verdict_;

        emit CaseResolved(caseId_, verdict_);
    }

    /**
     * @notice Get verdict for a case
     * @param caseId_ The case ID
     * @return verdict The verdict (0 = Pending, 1 = InitiatorWins, 2 = InitiatorLoses)
     */
    function getVerdict(uint256 caseId_) external view returns (Verdict verdict) {
        Case memory case_ = cases[caseId_];
        require(case_.caseId != 0, "Case does not exist");

        return case_.verdict;
    }

    /**
     * @notice Get full case information
     * @param caseId_ The case ID
     * @return case_ The full Case struct
     */
    function getCase(uint256 caseId_) external view returns (Case memory) {
        Case memory case_ = cases[caseId_];
        require(case_.caseId != 0, "Case does not exist");
        return case_;
    }

    /**
     * @notice Get case ID for an order
     * @param orderId_ The order ID
     * @return caseId The case ID (0 if no dispute exists)
     */
    function getCaseIdByOrder(uint256 orderId_) external view returns (uint256) {
        return orderToCase[orderId_];
    }

    /**
     * @notice Get total number of cases
     * @return total The total number of cases created
     */
    function getTotalCases() external view returns (uint256) {
        return _nextCaseId > 0 ? _nextCaseId - 1 : 0;
    }

    /**
     * @notice Withdraw native tokens (owner only)
     * @dev Allows owner to withdraw any native tokens sent to the contract
     * @param to_ Address to send tokens to
     * @param amount_ Amount to withdraw
     */
    function withdrawNative(address payable to_, uint256 amount_) external onlyOwner {
        require(to_ != address(0), "Invalid address");
        require(amount_ > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount_, "Insufficient balance");

        (bool success, ) = to_.call{value: amount_}("");
        require(success, "Transfer failed");
    }

    /**
     * @notice Withdraw ERC20 tokens (owner only)
     * @dev Allows owner to withdraw any ERC20 tokens sent to the contract
     * @param token_ Token contract address
     * @param to_ Address to send tokens to
     * @param amount_ Amount to withdraw
     */
    function withdrawERC20(address token_, address to_, uint256 amount_) external onlyOwner {
        require(token_ != address(0), "Invalid token address");
        require(to_ != address(0), "Invalid address");
        require(amount_ > 0, "Amount must be greater than 0");

        (bool success, bytes memory data) = token_.call(
            abi.encodeWithSignature("transfer(address,uint256)", to_, amount_)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Transfer failed");
    }

    /**
     * @notice Receive native tokens
     */
    receive() external payable {}
}

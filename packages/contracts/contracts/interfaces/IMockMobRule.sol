// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IMockMobRule
 * @notice Interface for the MockMobRule dispute resolution contract
 */
interface IMockMobRule {
    enum Verdict {
        Pending,
        InitiatorWins,
        InitiatorLoses
    }

    function createDispute(
        uint256 orderId_,
        address customer_,
        address restaurant_,
        address initiator_,
        string memory disputeMetadataCID_
    ) external returns (uint256);

    function addCounterEvidence(uint256 caseId_, string memory counterEvidenceCID_) external;

    function acceptFault(uint256 caseId_) external;

    function getVerdict(uint256 caseId_) external view returns (Verdict);
}

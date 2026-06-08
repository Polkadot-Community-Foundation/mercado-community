// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IMercadoMatchmakers
 * @notice Interface for the MercadoMatchmakers contract
 */
interface IMercadoMatchmakers {
    function matchMakers(uint256 id) external view returns (
        uint256 id_,
        address owner,
        string memory name,
        uint16 feePercentage,
        uint256 registeredAt,
        bool active
    );

    function recordOrderMatchMaker(uint256 orderId_, uint256 mmId_, uint256 feeAmount_) external;

    function getMatchMaker(uint256 mmId) external view returns (
        uint256 id,
        address owner,
        string memory name,
        uint16 feePercentage,
        uint256 registeredAt,
        bool active
    );
}

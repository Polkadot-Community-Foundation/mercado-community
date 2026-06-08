// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMercadoCore {
    function restaurants(uint256 id) external view returns (
        address owner,
        string memory name,
        string memory location,
        bool isOpen
    );
    function ownerToRestaurant(address owner) external view returns (uint256);
}

/**
 * @title RestaurantMeta
 * @notice Extended metadata storage for restaurants (description, avatar, menu CID)
 */
contract RestaurantMeta {
    IMercadoCore public immutable mercado;

    struct Metadata {
        string description;
        string avatarCID;
        string menuCID;
        string category;
        uint256 updatedAt;
    }

    // restaurantId => Metadata
    mapping(uint256 => Metadata) public metadata;

    event MetadataUpdated(uint256 indexed restaurantId, address indexed owner);

    constructor(address mercado_) {
        mercado = IMercadoCore(mercado_);
    }

    function setMetadata(
        string calldata description_,
        string calldata avatarCID_,
        string calldata menuCID_,
        string calldata category_
    ) external {
        uint256 rid = mercado.ownerToRestaurant(msg.sender);
        require(rid != 0, "not owner");

        metadata[rid] = Metadata({
            description: description_,
            avatarCID: avatarCID_,
            menuCID: menuCID_,
            category: category_,
            updatedAt: block.timestamp
        });

        emit MetadataUpdated(rid, msg.sender);
    }

    function getMetadata(uint256 restaurantId_) external view returns (
        string memory description,
        string memory avatarCID,
        string memory menuCID,
        string memory category,
        uint256 updatedAt
    ) {
        Metadata memory m = metadata[restaurantId_];
        return (m.description, m.avatarCID, m.menuCID, m.category, m.updatedAt);
    }
}

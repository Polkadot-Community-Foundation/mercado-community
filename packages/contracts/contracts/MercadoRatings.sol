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
 * @title MercadoRatings
 * @notice Restaurant rating system for Mercado
 */
contract MercadoRatings is Ownable {
    IMercadoCore public immutable mercado;

    struct Rating {
        uint256 count;
        uint256 sum;
    }

    // restaurantId => Rating
    mapping(uint256 => Rating) public ratings;
    // orderId => rated
    mapping(uint256 => bool) public orderRated;

    event Rated(uint256 indexed restaurantId, uint256 indexed orderId, address indexed customer, uint8 rating);

    constructor(address mercado_, address owner_) Ownable(owner_) {
        mercado = IMercadoCore(mercado_);
    }

    function rate(uint256 orderId_, uint8 rating_) external {
        require(rating_ >= 1 && rating_ <= 5, "1-5 only");
        require(!orderRated[orderId_], "already rated");

        (address customer, uint256 restaurantId, , uint8 status, ) = mercado.orders(orderId_);
        require(customer == msg.sender, "not customer");
        require(status == 4, "not completed"); // Status.DONE = 4

        orderRated[orderId_] = true;
        ratings[restaurantId].count++;
        ratings[restaurantId].sum += rating_;

        emit Rated(restaurantId, orderId_, msg.sender, rating_);
    }

    function getAverage(uint256 restaurantId_) external view returns (uint256 avg, uint256 count) {
        Rating memory r = ratings[restaurantId_];
        if (r.count == 0) return (0, 0);
        return ((r.sum * 100) / r.count, r.count); // Returns avg * 100 for precision (e.g., 450 = 4.5)
    }
}

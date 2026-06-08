import type { Abi } from 'viem';

/**
 * MercadoCore ABI - Lean food delivery marketplace contract
 * Matches packages/contracts/contracts/MercadoCore.sol
 */
export const MercadoCoreAbi: Abi = [
  // Constants
  {
    inputs: [],
    name: 'VERSION',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DISPUTE_WINDOW',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // State variables
  {
    inputs: [],
    name: 'nextRestaurantId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextOrderId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'matchmakers',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Mappings
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'restaurants',
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'owner', type: 'address' },
      { name: 'name', type: 'string' },
      { name: 'location', type: 'string' },
      { name: 'metadataCID', type: 'string' },
      { name: 'isOpen', type: 'bool' },
      { name: 'registeredAt', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'ownerToRestaurant',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'orders',
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'customer', type: 'address' },
      { name: 'restaurantId', type: 'uint256' },
      { name: 'price', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'placedAt', type: 'uint256' },
      { name: 'completedAt', type: 'uint256' },
      { name: 'canceledByCustomer', type: 'bool' },
      { name: 'fundsReleased', type: 'bool' },
      { name: 'paymentAsset', type: 'address' },
      { name: 'matchmakerId', type: 'uint256' },
      { name: 'matchmakerFeeBps', type: 'uint256' },
      { name: 'matchmakerFeeAmount', type: 'uint256' },
      { name: 'itemsData', type: 'bytes' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'allowedAssets',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Restaurant functions
  {
    inputs: [
      { name: 'name_', type: 'string' },
      { name: 'location_', type: 'string' },
      { name: 'metadataCID_', type: 'string' },
    ],
    name: 'registerRestaurant',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'name_', type: 'string' },
      { name: 'location_', type: 'string' },
      { name: 'metadataCID_', type: 'string' },
    ],
    name: 'updateRestaurant',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'isOpen_', type: 'bool' }],
    name: 'setRestaurantOpen',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Order functions
  {
    inputs: [
      { name: 'restaurantId_', type: 'uint256' },
      { name: 'itemsData_', type: 'bytes' },
      { name: 'matchmakerId_', type: 'uint256' },
    ],
    name: 'placeOrder',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'restaurantId_', type: 'uint256' },
      { name: 'itemsData_', type: 'bytes' },
      { name: 'matchmakerId_', type: 'uint256' },
      { name: 'paymentAsset_', type: 'address' },
      { name: 'totalPrice_', type: 'uint256' },
    ],
    name: 'placeOrderWithToken',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'orderId_', type: 'uint256' }],
    name: 'advanceOrderStatus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'orderId_', type: 'uint256' }],
    name: 'completeOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'orderId_', type: 'uint256' }],
    name: 'cancelOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'orderId_', type: 'uint256' }],
    name: 'claimFunds',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Admin functions
  {
    inputs: [{ name: 'matchmakers_', type: 'address' }],
    name: 'setMatchmakers',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'asset_', type: 'address' }],
    name: 'addPaymentAsset',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'asset_', type: 'address' }],
    name: 'removePaymentAsset',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // View functions
  {
    inputs: [{ name: 'id_', type: 'uint256' }],
    name: 'getRestaurant',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'owner', type: 'address' },
          { name: 'name', type: 'string' },
          { name: 'location', type: 'string' },
          { name: 'metadataCID', type: 'string' },
          { name: 'isOpen', type: 'bool' },
          { name: 'registeredAt', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'id_', type: 'uint256' }],
    name: 'getOrder',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'customer', type: 'address' },
          { name: 'restaurantId', type: 'uint256' },
          { name: 'price', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'placedAt', type: 'uint256' },
          { name: 'completedAt', type: 'uint256' },
          { name: 'canceledByCustomer', type: 'bool' },
          { name: 'fundsReleased', type: 'bool' },
          { name: 'paymentAsset', type: 'address' },
          { name: 'matchmakerId', type: 'uint256' },
          { name: 'matchmakerFeeBps', type: 'uint256' },
          { name: 'matchmakerFeeAmount', type: 'uint256' },
          { name: 'itemsData', type: 'bytes' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'customer_', type: 'address' }],
    name: 'getCustomerOrderIds',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'restaurantId_', type: 'uint256' }],
    name: 'getRestaurantOrderIds',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalRestaurants',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalOrders',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'orderId_', type: 'uint256' }],
    name: 'isDisputeWindowOpen',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: false, name: 'name', type: 'string' },
      { indexed: false, name: 'location', type: 'string' },
      { indexed: false, name: 'metadataCID', type: 'string' },
    ],
    name: 'RestaurantRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: false, name: 'name', type: 'string' },
      { indexed: false, name: 'location', type: 'string' },
      { indexed: false, name: 'metadataCID', type: 'string' },
    ],
    name: 'RestaurantUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: false, name: 'isOpen', type: 'bool' },
    ],
    name: 'RestaurantOpenChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: true, name: 'restaurantId', type: 'uint256' },
      { indexed: true, name: 'customer', type: 'address' },
      { indexed: false, name: 'price', type: 'uint256' },
      { indexed: false, name: 'paymentAsset', type: 'address' },
    ],
    name: 'OrderPlaced',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: false, name: 'oldStatus', type: 'uint8' },
      { indexed: false, name: 'newStatus', type: 'uint8' },
    ],
    name: 'OrderStatusChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: false, name: 'byCustomer', type: 'bool' },
    ],
    name: 'OrderCanceled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: true, name: 'restaurant', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'FundsReleased',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: true, name: 'customer', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'RefundIssued',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: 'newAddress', type: 'address' }],
    name: 'MatchmakersUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: 'asset', type: 'address' }],
    name: 'PaymentAssetAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: 'asset', type: 'address' }],
    name: 'PaymentAssetRemoved',
    type: 'event',
  },
] as const;

export const MercadoRatingsAbi: Abi = [
  {
    inputs: [{ name: 'restaurantId_', type: 'uint256' }],
    name: 'getAverage',
    outputs: [
      { name: 'avg', type: 'uint256' },
      { name: 'count', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'orderRated',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'orderId_', type: 'uint256' },
      { name: 'rating_', type: 'uint8' },
    ],
    name: 'rate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const MercadoDisputesAbi: Abi = [
  {
    inputs: [],
    name: 'stakeAmount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DISPUTE_WINDOW',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'disputes',
    outputs: [
      { name: 'orderId', type: 'uint256' },
      { name: 'initiator', type: 'address' },
      { name: 'evidenceCID', type: 'string' },
      { name: 'counterCID', type: 'string' },
      { name: 'initiatorStake', type: 'uint256' },
      { name: 'challengerStake', type: 'uint256' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'verdict', type: 'uint8' },
      { name: 'claimed', type: 'bool' },
      { name: 'faultAccepted', type: 'bool' },
      { name: 'resolvedAt', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'orderToDispute',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'orderId_', type: 'uint256' },
      { name: 'evidenceCID_', type: 'string' },
    ],
    name: 'raiseDispute',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'disputeId_', type: 'uint256' },
      { name: 'counterCID_', type: 'string' },
    ],
    name: 'addCounterEvidence',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'disputeId_', type: 'uint256' }],
    name: 'acceptFault',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'disputeId_', type: 'uint256' }],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const RestaurantMetaAbi: Abi = [
  {
    inputs: [{ name: 'restaurantId_', type: 'uint256' }],
    name: 'getMetadata',
    outputs: [
      { name: 'description', type: 'string' },
      { name: 'avatarCID', type: 'string' },
      { name: 'menuCID', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'updatedAt', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'description_', type: 'string' },
      { name: 'avatarCID_', type: 'string' },
      { name: 'menuCID_', type: 'string' },
      { name: 'category_', type: 'string' },
    ],
    name: 'setMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const MercadoMatchmakersAbi: Abi = [
  // View functions
  {
    inputs: [{ name: 'id_', type: 'uint256' }],
    name: 'getMatchMaker',
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'owner', type: 'address' },
      { name: 'name', type: 'string' },
      { name: 'feePercentage', type: 'uint16' },
      { name: 'registeredAt', type: 'uint256' },
      { name: 'active', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner_', type: 'address' }],
    name: 'isMatchMakerRegistered',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner_', type: 'address' }],
    name: 'getMatchMakerIdByOwner',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'id_', type: 'uint256' }],
    name: 'getMatchMakerFees',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [
      { name: 'name_', type: 'string' },
      { name: 'feeBps_', type: 'uint16' },
    ],
    name: 'registerMatchMaker',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'newFeeBps_', type: 'uint16' }],
    name: 'updateMatchMakerFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'to_', type: 'address' }],
    name: 'claimMatchMakerFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: false, name: 'name', type: 'string' },
      { indexed: false, name: 'feePercentage', type: 'uint16' },
    ],
    name: 'MatchMakerRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: false, name: 'oldFee', type: 'uint16' },
      { indexed: false, name: 'newFee', type: 'uint16' },
    ],
    name: 'MatchMakerFeeUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'MatchMakerFeesClaimed',
    type: 'event',
  },
] as const;

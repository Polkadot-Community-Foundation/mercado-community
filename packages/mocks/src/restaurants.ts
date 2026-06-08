import type { Restaurant } from '@mercado/types';

import { charlie, dave, eve, ferdie, grace } from './accounts';
import {
  dishClassicBurger,
  dishBaconDeluxe,
  dishMargherita,
  dishPepperoni,
  dishSalmonNigiri,
  dishCarnitasTaco,
  dishSpaghettiCarbonara,
  dishTeriyakiChickenBowl,
} from './dishes';

// All available locations
export const allLocations: string[] = ['New York', 'Los Angeles', 'Chicago'];

// Helper to create rating data from average and count
// ratingSum = average * count (stored as integers for precision)
function makeRating(avg: number, count: number) {
  return { ratingSum: Math.round(avg * count), ratingCount: count };
}

// All restaurants
export const allRestaurants: Restaurant[] = [
  // New York
  {
    id: '1',
    owner: charlie.address,
    name: 'Burger Palace',
    description: 'The best burgers in town, made with 100% grass-fed beef.',
    location: 'New York',
    category: 'burgers',
    isOpen: true,
    ...makeRating(4.7, 234),
    deliveryTime: '20-30 min',
    dishes: [dishClassicBurger, dishBaconDeluxe],
  },
  {
    id: '2',
    owner: dave.address,
    name: 'Pizza Corner',
    description: 'Authentic Neapolitan pizza baked in a wood-fired oven.',
    location: 'New York',
    category: 'pizza',
    isOpen: true,
    ...makeRating(4.5, 189),
    deliveryTime: '25-35 min',
    dishes: [dishMargherita, dishPepperoni],
  },
  {
    id: '3',
    owner: eve.address,
    name: 'Sushi Express',
    description: 'Fresh sushi and sashimi prepared by master chefs.',
    location: 'New York',
    category: 'sushi',
    isOpen: true,
    ...makeRating(4.8, 312),
    deliveryTime: '30-40 min',
    dishes: [dishSalmonNigiri],
  },
  {
    id: '4',
    owner: ferdie.address,
    name: 'Taco Fiesta',
    description: 'Street-style tacos with homemade tortillas.',
    location: 'New York',
    category: 'mexican',
    isOpen: true,
    ...makeRating(4.6, 156),
    deliveryTime: '15-25 min',
    dishes: [dishCarnitasTaco],
  },
  // Los Angeles
  {
    id: '5',
    owner: charlie.address,
    name: 'LA Burger Joint',
    description: 'California-style burgers with fresh ingredients.',
    location: 'Los Angeles',
    category: 'burgers',
    isOpen: true,
    ...makeRating(4.4, 445),
    deliveryTime: '20-30 min',
    dishes: [dishClassicBurger, dishBaconDeluxe],
  },
  {
    id: '6',
    owner: dave.address,
    name: 'Venice Pizza',
    description: 'Wood-fired pizzas by the beach.',
    location: 'Los Angeles',
    category: 'pizza',
    isOpen: true,
    ...makeRating(4.6, 267),
    deliveryTime: '25-35 min',
    dishes: [dishMargherita, dishPepperoni],
  },
  {
    id: '7',
    owner: eve.address,
    name: 'Sakura Roll',
    description: 'Creative sushi rolls and traditional Japanese dishes.',
    location: 'Los Angeles',
    category: 'sushi',
    isOpen: true,
    ...makeRating(4.9, 423),
    deliveryTime: '25-35 min',
    dishes: [dishSalmonNigiri],
  },
  {
    id: '8',
    owner: ferdie.address,
    name: 'El Mariachi',
    description: 'Authentic Mexican cuisine from family recipes.',
    location: 'Los Angeles',
    category: 'mexican',
    isOpen: true,
    ...makeRating(4.7, 534),
    deliveryTime: '20-30 min',
    dishes: [dishCarnitasTaco],
  },
  // Chicago
  {
    id: '9',
    owner: charlie.address,
    name: 'Chicago Burger Co',
    description: 'Classic American burgers done right.',
    location: 'Chicago',
    category: 'burgers',
    isOpen: true,
    ...makeRating(4.5, 312),
    deliveryTime: '20-30 min',
    dishes: [dishClassicBurger, dishBaconDeluxe],
  },
  {
    id: '10',
    owner: dave.address,
    name: 'Deep Dish Chicago',
    description: 'Legendary Chicago-style deep dish pizza.',
    location: 'Chicago',
    category: 'pizza',
    isOpen: true,
    ...makeRating(4.9, 678),
    deliveryTime: '35-50 min',
    dishes: [dishMargherita, dishPepperoni],
  },
  {
    id: '11',
    owner: eve.address,
    name: 'Windy City Sushi',
    description: 'Premium sushi in the heart of Chicago.',
    location: 'Chicago',
    category: 'sushi',
    isOpen: true,
    ...makeRating(4.6, 198),
    deliveryTime: '30-40 min',
    dishes: [dishSalmonNigiri],
  },
  {
    id: '12',
    owner: grace.address,
    name: 'Pasta House',
    description: 'Handmade Italian pasta with family recipes from Tuscany.',
    location: 'Chicago',
    category: 'italian',
    isOpen: true,
    ...makeRating(4.8, 412),
    deliveryTime: '25-35 min',
    dishes: [dishSpaghettiCarbonara],
  },
  {
    id: '13',
    owner: ferdie.address,
    name: 'Wok & Roll',
    description: 'Quick and delicious Asian stir-fry bowls.',
    location: 'Chicago',
    category: 'chinese',
    isOpen: true,
    ...makeRating(4.3, 178),
    deliveryTime: '20-30 min',
    dishes: [dishTeriyakiChickenBowl],
  },
];

// Named exports for e2e tests
export const restaurantBurgerPalace = allRestaurants[0];
export const restaurantPizzaCorner = allRestaurants[1];
export const restaurantSushiExpress = allRestaurants[2];
export const restaurantTacoFiesta = allRestaurants[3];

import type { Dish } from '@mercado/types';

import {
  optionExtraCheese,
  optionNoPickles,
  optionNoBacon,
  optionExtraBurgerPatty,
  optionExtraMozzarella,
  optionExtraSalsa,
  optionAddEgg,
} from './dish-options';

export const dishClassicBurger: Dish = {
  id: 'd1',
  name: 'Classic Burger',
  description: 'Beef patty, lettuce, tomato, pickles, special sauce.',
  basePrice: 1200n,
  inStock: true,
  photoUrl: 'http://localhost:5888/images/classic-burger.svg',
  options: [optionExtraCheese, optionNoPickles],
};

export const dishBaconDeluxe: Dish = {
  id: 'd2',
  name: 'Bacon Deluxe',
  description: 'Double patty with crispy bacon and cheddar cheese.',
  basePrice: 1600n,
  inStock: true,
  photoUrl: 'http://localhost:5888/images/bacon-deluxe.svg',
  options: [optionNoBacon, optionExtraBurgerPatty],
};

export const dishVeggieBurger: Dish = {
  id: 'd3',
  name: 'Veggie Burger',
  description: 'Plant-based patty with avocado and sprouts.',
  basePrice: 1300n,
  inStock: false,
  photoUrl: 'http://localhost:5888/images/veggie-burger.svg',
  options: [],
};

export const dishMargherita: Dish = {
  id: 'd4',
  name: 'Margherita',
  description: 'San Marzano tomato, mozzarella, fresh basil.',
  basePrice: 1400n,
  inStock: true,
  photoUrl: 'http://localhost:5888/images/margherita.svg',
  options: [optionExtraMozzarella],
};

export const dishPepperoni: Dish = {
  id: 'd5',
  name: 'Pepperoni',
  description: 'Classic pepperoni with mozzarella and tomato sauce.',
  basePrice: 1600n,
  inStock: true,
  photoUrl: 'http://localhost:5888/images/pepperoni.svg',
  options: [],
};

export const dishSalmonNigiri: Dish = {
  id: 'd6',
  name: 'Salmon Nigiri (2pc)',
  description: 'Fresh Atlantic salmon over seasoned rice.',
  basePrice: 800n,
  inStock: true,
  photoUrl: 'http://localhost:5888/images/salmon-nigiri.svg',
  options: [],
};

export const dishCarnitasTaco: Dish = {
  id: 'd7',
  name: 'Carnitas Taco',
  description: 'Slow-cooked pork with cilantro and onion.',
  basePrice: 500n,
  inStock: true,
  photoUrl: 'http://localhost:5888/images/carnitas-taco.svg',
  options: [optionExtraSalsa],
};

export const dishSpaghettiCarbonara: Dish = {
  id: 'd8',
  name: 'Spaghetti Carbonara',
  description: 'Guanciale, egg, pecorino, black pepper.',
  basePrice: 1500n,
  inStock: true,
  photoUrl: 'http://localhost:5888/images/spaghetti-carbonara.svg',
  options: [],
};

export const dishTeriyakiChickenBowl: Dish = {
  id: 'd9',
  name: 'Teriyaki Chicken Bowl',
  description: 'Grilled chicken with teriyaki sauce over steamed rice.',
  basePrice: 1100n,
  inStock: true,
  photoUrl: 'http://localhost:5888/images/teriyaki-chicken-bowl.svg',
  options: [optionAddEgg],
};

export const dishGrilledMahiMahi: Dish = {
  id: 'd10',
  name: 'Grilled Mahi-Mahi',
  description: 'Fresh catch with mango salsa and coconut rice.',
  basePrice: 2200n,
  inStock: true,
  photoUrl: 'http://localhost:5888/images/grilled-mahi-mahi.svg',
  options: [],
};

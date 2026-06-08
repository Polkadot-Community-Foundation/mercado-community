# Unauthenticated Browsing

## The journey

- An unauthenticated user opens Mercado without logging in
- User can see restaurants and dishes
- User can't order, instead seeing "please log in to order" text
- Restaurant portal and My orders pages redirect unauthenticated users to the main page

## Test cases

### Restaurants and dishes

- Open the app without authentication
- See "Where are you?" prompt
- Open "New York"
- See "Burger Palace" restaurant
- Open "Burger Palace" restaurant
- See "Classic burger" in the menu
- Open "Classic burger", see no "Add to order" button, instead it should be disabled with "Log in to order" text instead

### Protected pages

- Open the app without authentication
- See no "Join as a restaurant" button
- See no "My orders" button
- Try going to "/register-restaurant" by url
- Get redirected to main page
- Try going to "/restaurant-portal" by url
- Get redirected to main page
- Try going to "/my-orders" by url
- Get redirected to main page

# Registration Form

## The journey

- The customer uses an account that's not registered as a restaurant
- The customer navigates to the registration page via "Join as a restaurant" link
- The customer sees a registration form with fields: name, location, description
- The customer fills in the required fields
- The customer submits the form
- The restaurant is created with the customer as owner
- The customer is redirected to the restaurant portal

## Form fields

- **Name** (required): Restaurant name, text input
- **Location** (required): City/area dropdown, populated from available locations
- **Description** (required): Restaurant description, textarea
- **Avatar** (optional): Restaurant logo/image URL

## Test cases

### Successful registration

- Select customer.33 account (not a restaurant owner)
- Navigate to /register-restaurant
- Fill in name: "Test Restaurant"
- Select location: "New York"
- Fill in description: "A test restaurant for delicious food"
- Submit the form
- Validate that user is redirected to /restaurant-portal
- Validate that "Restaurant portal" link appears in header (not "Join as a restaurant")

### Validation - missing required fields

- Select customer.33 account
- Navigate to /register-restaurant
- Leave name empty
- Submit the form
- Validate that an error message appears for the name field
- Fill in name but leave location unselected
- Submit the form
- Validate that an error message appears for the location field

### Validation - name too short

- Select customer.33 account
- Navigate to /register-restaurant
- Enter name: "AB" (less than 3 characters)
- Submit the form
- Validate that an error message indicates name must be at least 3 characters

### Already registered user cannot access form

- Select burgerpalace.1 account (already a restaurant owner)
- Navigate to /register-restaurant directly by URL
- Validate that user is redirected to /restaurant-portal

### New restaurant appears in restaurant list

- Select customer.33 account
- Complete registration with location "New York"
- Switch to a different account
- Navigate to restaurants in "New York"
- Validate that "Test Restaurant" appears in the list

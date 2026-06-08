# Restaurant selection

## The journey

- The customer opens the app
- The customer selects the available location from the dropdown (the values are all the locations set by the restaurants).
- The customer sees restaurants in the area
- The customer clicks on a restaurant
- The customer sees restaurant menu

## Test cases

### Seeing correct restaurants

- The customer opens the app
- The customer selects a location
- Check that the customer was lead to the `/restaurants` page
- Check that the customer sees expected restaurants on the page
- Check that the customer does not see the restaurants outside their area
- Check that the customer does not see restaurants that aren't open

### Seeing correct menu

- The customer opens the app
- The customer selects a location
- The customer selects a restaurant
- Check that the customer was led to `/restaurants/:id` page, with correct id
- Check that the customer sees dishes of that restaurant
- Check that the customer doesn't see dishes that are not listed in restaurant metadata

# Fresh register

## The journey

- The customer uses an account that's not registered as a restaurant
- The customer sees "Join as a restaurant" link in the header
- The customer clicks at that link and sees an empty restaurant registration page

## Test cases

### Correct restaurant account detection

- Select customer.33 account
- See "Join as a restaurant" link
- Click on the link
- Validate that a page that would have a title "Join as a restaurant"

### Already registered

- Select burgerpalace.1 account
- "Join as a restaurant" link should not be visible on the page
- See "Restaurant portal" link in the header instead
- Click on the link
- Validate that the page has a title "Restaurant portal"

### Already registered 2

- Select burgerpalace.1 account
- Go to restaurant registration directly by URL
- Validate that the user was redirected to restaurant portal page

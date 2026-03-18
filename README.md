# Cute Craft Gifts

## Project Structure
```
- `src/` - Contains the main source code.
- `public/` - Contains static assets.
- `config/` - Contains configuration files.
- `test/` - Contains unit and integration tests.
- `docs/` - Documentation files.
```

## Features
- User-friendly interface for browsing and purchasing gifts.
- Custom product addition and management.
- WhatsApp integration for customer support.
- Responsive design for mobile and desktop users.

## Adding Products
To add new products to the inventory, follow these steps:
1. Navigate to the `src/products/` directory.
2. Create a new JSON file for the product or update the existing one.
3. Include the following fields in the JSON:
   - `name`: The name of the product.
   - `description`: A brief description of the product.
   - `price`: The price of the product.
   - `image`: Path to the product image.
4. Update the inventory page to display the new product.

## Customizing WhatsApp Integration
To customize WhatsApp integration:
1. Open the `config/whatsapp.js` file.
2. Update the following parameters:
   - `phoneNumber`: Your business WhatsApp number.
   - `messageTemplate`: Predefined message for customer inquiries.
3. Ensure all necessary permissions for WhatsApp API are granted.

## Deployment Instructions
Follow these steps to deploy the application:
1. Clone the repository:
   ```bash
   git clone https://github.com/shubhamcuraj27/Cute_CraftGifts.git
   cd Cute_CraftGifts
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Access the application at `http://localhost:3000`.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

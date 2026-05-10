# SophiaTech Eats – UI Refactoring Plan

## 1. Project Context & Goal
SophiaTech Eats is a multiservice food ordering system with a Java backend (API Gateway + Catalog + Order services) and a React frontend. The current frontend is functional but requires a **complete UI/UX refactoring** to achieve a premium, modern, and dynamic aesthetic.

Our goal is to apply modern web design principles (vibrant colors, glassmorphism, micro-animations, Google Fonts) via **Tailwind CSS**, componentize the architecture, and seamlessly support the existing REST APIs.

## 2. Identified User Flows

### A. Landing / Authentication
- **Role Selection (`/`)**: The entry point where a user chooses their role (Customer or Manager).

### B. Customer Flow
1. **Browse Restaurants (`/restaurants`)**: View the list of available restaurants, filter by tags/availability.
2. **Restaurant Details & Menu (`/restaurants/:name`)**: View restaurant info, browse categorized dishes, and add items to the cart.
3. **Cart & Delivery (`/cart`)**: Review cart contents and select an available delivery slot based on capacity.
4. **Payment & Checkout (`/payment`)**: Simulate payment using student credit or card.
5. **Order Confirmation (`/order/confirmation/:orderId`)**: Success screen showing order details.
6. **Order History (`/orders`)**: View past orders and their status.

### C. Manager Flow
1. **Manager Dashboard (`/manager`)**: The admin hub for managing the restaurant operations.
2. **Dishes Panel**: Create, edit, and delete dishes for a specific restaurant.
3. **Schedule/Delivery Panel**: View and manage delivery slots and capacities.

## 3. Color Pallete

### UI Color Palette: Coastal Crave

This color palette was designed specifically for **SopiaTech Eats**. It blends a trustworthy coastal navy with warm, appetite-stimulating accents, balanced by clean neutrals to ensure the React interface remains accessible and easy to navigate.

### 1. Brand & Primary Colors
Used for the core structure of the application, providing a premium and reliable feel.

| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Deep Sea Navy** | `#1A365D` | Primary brand color (Navbar, footer, primary outlines) |
| **Ocean Blue** | `#2B6CB0` | Primary hover state and secondary links |

### 2. Accent Colors
Warm, vibrant colors used to stimulate appetite and draw the eye to critical user flows.

| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Sunset Coral** | `#FF6B6B` | Primary Call-to-Action (Add to Cart, Checkout, Pay) |
| **Sandstone Gold** | `#F6AD55` | Secondary highlights (Star ratings, delivery slot selection) |

### 3. Neutrals
High-contrast backgrounds and typography colors to make menus and cart details highly legible.

| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Seabreeze White**| `#F8FAFC` | Main application background |
| **Pure White** | `#FFFFFF` | Surface color for Restaurant Cards, Menus, and the Cart |
| **Slate Dark** | `#0F172A` | Primary text (Headings, restaurant names, dish titles, totals) |
| **Slate Light** | `#475569` | Secondary text (Descriptions, categories, instructions) |
| **Border Gray** | `#E2E8F0` | Structural dividers and subtle card borders |

### 4. Semantic Colors
Colors explicitly mapped to the backend domain objects to visually communicate state.

| Color Name | Hex Code | Associated Backend State |
| :--- | :--- | :--- |
| **Mint Green** | `#10B981` | `OrderStatus.CONFIRMED`, Vegetarian/Vegan `DietaryTag` |
| **Warning Yellow** | `#F59E0B` | `OrderStatus.DRAFT`, low-capacity `DeliverySlot` |
| **Crimson Alert** | `#EF4444` | `OrderStatus.CANCELLED`, Remove from cart action |

---

## 4. Typography

To perfectly complement the app's aesthetic, we use a font pairing that balances **appetizing friendliness** with **crisp, tech-driven legibility**. Food apps require high readability for dense information (prices, tags, descriptions) but also need inviting headers to make restaurants look appealing.

*   **Headings: [Poppins](https://fonts.google.com/specimen/Poppins)**
    *   **Usage:** `h1` - `h6`, Restaurant Names, Order Totals, and Brand Typography.
    *   **Rationale:** A geometric sans-serif with soft curves that looks premium, trustworthy, and welcoming, especially when styled in the primary brand navy.
*   **Body Text: [Inter](https://fonts.google.com/specimen/Inter)**
    *   **Usage:** Dish descriptions, UI elements, buttons, and dietary/delivery info.
    *   **Rationale:** Purpose-built for screens, ensuring complex UI details and small text remain crystal clear and highly legible.

### Adding Fonts to the App
Include the following in the `<head>` of your `frontend/index.html`:
```html
<link rel="preconnect" href="[https://fonts.googleapis.com](https://fonts.googleapis.com)">
<link rel="preconnect" href="[https://fonts.gstatic.com](https://fonts.gstatic.com)" crossorigin>
<link href="[https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&display=swap)" rel="stylesheet">
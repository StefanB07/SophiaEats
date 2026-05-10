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

### UI Color Palette: Midnight Coastal (Dark Theme)

This color palette is designed for the **SopiaTech Eats** React frontend, utilizing a deep navy background with subtle, lighter line accents. The warm, appetite-stimulating accents have been brightened slightly to ensure they stand out against the dark canvas, maintaining accessibility and a premium feel.

### 1. Backgrounds & Surfaces
The foundation of the app. A dark navy base creates depth, while slightly lighter navy tones are used to elevate cards (like menus) off the background.

| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Midnight Navy** | `#0B132B` | Main application background |
| **Luminescent Line**| `#1C2B54` | The lighter navy blue used for background line accents/grids and structural dividers |
| **Deep Sea Surface**| `#152243` | Elevated surface color for Restaurant Cards, Menus, and the Cart container |

### 2. Accent Colors
Warm, vibrant colors used to stimulate appetite and guide the user to critical actions. These have been optimized to "pop" on dark backgrounds.

| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Sunset Coral** | `#FF6B6B` | Primary Call-to-Action (Add to Cart, Checkout, Pay) |
| **Neon Gold** | `#FBD38D` | Secondary highlights (Star ratings, selected delivery slots, active states) |
| **Wave Crest Blue** | `#38BDF8` | Secondary interactive elements (Text links, hover states, secondary buttons) |

### 3. Typography
High-contrast text colors to ensure menus, dietary tags, and cart details are highly legible against the dark navy.

| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Starlight White** | `#F8FAFC` | Primary text (Headings, restaurant names, dish titles, totals) |
| **Fog Gray** | `#94A3B8` | Secondary text (Descriptions, categories, subtle instructions) |

### 4. Semantic Colors
Colors explicitly mapped to the backend domain objects to visually communicate state. Adjusted for dark mode visibility.

| Color Name | Hex Code | Associated Backend State |
| :--- | :--- | :--- |
| **Mint Glow** | `#34D399` | `OrderStatus.CONFIRMED`, Vegetarian/Vegan `DietaryTag` |
| **Amber Warning** | `#FBBF24` | `OrderStatus.DRAFT`, low-capacity `DeliverySlot` |
| **Crimson Alert** | `#F87171` | `OrderStatus.CANCELLED`, Remove from cart action |

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
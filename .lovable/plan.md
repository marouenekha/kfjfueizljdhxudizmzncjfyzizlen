## Objectif

Transformer l'onglet « Boutique » du profil en une vraie expérience e-commerce avec **paiement à la livraison uniquement**, et un **panier multi-vendeurs** (le client peut ajouter des produits provenant de plusieurs boutiques/utilisateurs dans le même panier et passer commande en une fois).

## Fonctionnalités à livrer

### 1. Page produit
- Cliquer sur un produit dans la boutique d'un profil ouvre une page détaillée
- Carrousel d'images (même UX que les posts), titre, prix, description, nom + avatar du vendeur (cliquable vers son profil)
- Boutons : **Ajouter au panier**, **Acheter maintenant**, **Contacter le vendeur**

### 2. Panier multi-vendeurs
- Icône panier dans le header (avec badge de quantité)
- Les articles sont regroupés par vendeur dans le panier
- Quantité modifiable, suppression d'article, total par vendeur + total global
- Persisté en base (lié à `auth.uid()`) pour être retrouvé sur tous les appareils

### 3. Commande (Checkout) — Paiement à la livraison uniquement
- Formulaire : nom complet, téléphone, wilaya, commune, adresse, note optionnelle
- Mode de paiement affiché et verrouillé sur **« Paiement à la livraison »**
- Une commande passée crée **une sous-commande par vendeur** (chacun reçoit sa partie)
- Confirmation à l'écran + notification au vendeur

### 4. Espace « Mes commandes » (acheteur)
- Liste des commandes passées avec statut : en attente → confirmée → expédiée → livrée → annulée
- Détail d'une commande (articles, vendeur, adresse, total)

### 5. Espace « Commandes reçues » (vendeur, dans son profil)
- Liste des commandes reçues sur ses produits
- Le vendeur peut faire évoluer le statut et voir les coordonnées de livraison

### 6. Traductions
- FR / EN / AR pour tous les nouveaux libellés

## Détails techniques

### Nouvelles tables Supabase
- `cart_items` : `user_id`, `product_id`, `quantity` (un seul panier actif par utilisateur, regroupement par vendeur calculé côté requête via `products.user_id`)
- `orders` : `id`, `buyer_id`, `seller_id`, `status`, `total`, `payment_method` (verrouillé à `cod`), `full_name`, `phone`, `wilaya`, `commune`, `address`, `note`, `created_at`
- `order_items` : `order_id`, `product_id`, `title_snapshot`, `price_snapshot`, `image_snapshot`, `quantity`
- RLS : acheteur voit ses commandes, vendeur voit celles qui le concernent, insertion limitée à `auth.uid() = buyer_id`

### Nouveaux écrans / composants
- `src/pages/ProductDetail.tsx` (route `/product/:id`)
- `src/pages/Cart.tsx` (route `/cart`)
- `src/pages/Checkout.tsx` (route `/checkout`)
- `src/pages/Orders.tsx` (route `/orders`) — onglets « Achats » / « Ventes »
- `src/components/Cart/CartIcon.tsx` (badge dans le header)
- `src/components/Store/ProductCard.tsx` (rendre la carte cliquable + bouton « + panier »)
- Hook `useCart` pour centraliser ajout/suppression/total

### Fichiers à modifier
- `src/components/Profile/StoreTab.tsx` — produit cliquable, bouton ajouter au panier
- `src/components/Layout/Header.tsx` + `MobileNav.tsx` — icône panier, lien « Mes commandes »
- `src/App.tsx` — nouvelles routes
- `src/lib/locales/{fr,en,ar}.ts` — nouvelles clés

### Hors périmètre
- Pas d'intégration Stripe / Paddle (paiement à la livraison uniquement, demandé explicitement)
- Pas de gestion de stock / inventaire (peut être ajouté plus tard)
- Pas de frais de livraison calculés automatiquement (peut être ajouté plus tard)

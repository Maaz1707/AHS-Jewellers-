import { useRates } from "./rates";
import { useProducts } from "./products";
import { useCart } from "./cart";
import { useEnquiries } from "./enquiries";
import { useBookings } from "./bookings";
import { useScheme } from "./scheme";
import { useWishlist } from "./wishlist";
import { useSession } from "./session";
import { useOrders } from "./orders";
import { useGold } from "./gold";

/** Persisted stores, rehydrated once on the client by StoreHydrator. */
export const persistedStores = [useRates, useProducts, useCart, useEnquiries, useBookings, useScheme, useWishlist, useSession, useOrders, useGold];

/**
 * Restore every store to the seed data, ready for a presentation. The admin
 * stays signed in so the panel does not close under the person resetting it.
 */
export function resetDemoData() {
  useRates.getState().reset();
  useProducts.getState().reset();
  useEnquiries.getState().reset();
  useBookings.getState().reset();
  useScheme.getState().reset();
  useOrders.getState().reset();
  useGold.getState().reset();
  useWishlist.getState().clear();
  useCart.getState().clear();
  useSession.getState().signOut();
}

export { useRates, useProducts, useCart, useEnquiries, useBookings, useScheme, useWishlist, useSession, useOrders, useGold };
export { useUI } from "./ui";
export { useToast } from "./toast";

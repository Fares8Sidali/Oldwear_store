import { getToken, useAuth } from "@clerk/react"
import { useCart } from "../store/cart"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { apiFetch } from "../lib/api"

export default function useCartPage() {

  const { getToken } = useAuth()
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const items = useCart((s) => s.items)
  const setQty = useCart((s) => s.setQty)
  const removeItem = useCart((s) => s.removeItem)

  const {
    data,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiFetch("/api/products"),
    enabled: items.length > 0,
  });

  const products = Array.isArray(data) ? data : data?.products ?? []; 
  //data?.products ?? [];
  console.log("API response:", data);
  console.log("Products:", products);
  console.log("Cart items:", items);
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = items.map((line) => ({
    line,
    product: byId.get(line.productId) ?? null,
  }));

  const subtotal = lines.reduce((sum, { line, product: p }) => {
    if (!p) return sum;
    return sum + p.price * line.quantity;
  }, 0);

  async function checkout() {
    setCheckoutLoading(true);

    try {

    const body = {
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };

    const res = await apiFetch("/api/checkout", {
      getToken,
      method: "POST",
      body,
    });
    console.log("Checkout API response:", res);

    if (res?.checkoutUrl) {
      window.location.href = res.checkoutUrl;
      return;
    }

    console.error("Checkout URL missing from response:", res);
    alert("Checkout could not start. Please check the console for details.");

     } catch (error) {
    console.error("Checkout failed:", error);
    alert("Checkout failed. Open the browser console to see the error.");
  } finally {

    setCheckoutLoading(false);
     }
  }

  return {
    items,
    setQty,
    removeItem,
    productsLoading,
    productsError,
    lines,
    subtotal,
    checkout,
    checkoutLoading,
  };
}

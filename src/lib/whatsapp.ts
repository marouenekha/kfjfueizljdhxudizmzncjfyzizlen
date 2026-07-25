import { toast } from "sonner";

export const openWhatsApp = (phone?: string | null, message?: string) => {
  if (!phone) {
    toast.error("No WhatsApp number available for this user");
    return;
  }
  const cleaned = phone.replace(/\D/g, "");
  if (!cleaned) {
    toast.error("Invalid WhatsApp number");
    return;
  }
  const url = `https://wa.me/${cleaned}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

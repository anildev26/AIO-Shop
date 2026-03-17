import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface PricingTier {
  months: number;
  price: number;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function buildWhatsAppLink(phone: string, productName: string): string {
  const message = encodeURIComponent(
    `Hi! I'm interested in: *${productName}*. Can you please provide more details?`
  );
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`;
}

export function buildTelegramLink(username: string, productName: string): string {
  const message = encodeURIComponent(
    `Hi! I'm interested in: ${productName}. Can you please provide more details?`
  );
  return `https://t.me/${username}?text=${message}`;
}

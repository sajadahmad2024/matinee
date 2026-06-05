"use client";

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  avatar: string;
  planStatus: "active" | "past_due" | "canceled" | "unpaid";
  planName: string;
  startDate: string;
  nextBilling: string;
  ltv: number;
}

export const mockSubscribers: Subscriber[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    avatar: "",
    planStatus: "active",
    planName: "Premium Annual",
    startDate: "2024-01-15",
    nextBilling: "2025-01-15",
    ltv: 299.99,
  },
  {
    id: "2",
    name: "Marcus Johnson",
    email: "marcus.j@email.com",
    avatar: "",
    planStatus: "active",
    planName: "Premium Monthly",
    startDate: "2024-06-01",
    nextBilling: "2025-02-01",
    ltv: 89.93,
  },
  {
    id: "3",
    name: "Aiko Tanaka",
    email: "aiko.t@email.com",
    avatar: "",
    planStatus: "past_due",
    planName: "Premium Monthly",
    startDate: "2024-03-10",
    nextBilling: "2025-01-10",
    ltv: 119.91,
  },
  {
    id: "4",
    name: "James Wilson",
    email: "jwilson@email.com",
    avatar: "",
    planStatus: "canceled",
    planName: "Premium Annual",
    startDate: "2023-08-20",
    nextBilling: "-",
    ltv: 599.98,
  },
  {
    id: "5",
    name: "Priya Patel",
    email: "priya.p@email.com",
    avatar: "",
    planStatus: "active",
    planName: "Basic Monthly",
    startDate: "2024-09-05",
    nextBilling: "2025-02-05",
    ltv: 49.95,
  },
  {
    id: "6",
    name: "Luis Rodriguez",
    email: "luis.r@email.com",
    avatar: "",
    planStatus: "unpaid",
    planName: "Premium Monthly",
    startDate: "2024-04-18",
    nextBilling: "2025-01-18",
    ltv: 0,
  },
  {
    id: "7",
    name: "Emma Thompson",
    email: "emma.t@email.com",
    avatar: "",
    planStatus: "active",
    planName: "Premium Annual",
    startDate: "2024-02-28",
    nextBilling: "2025-02-28",
    ltv: 299.99,
  },
];

export const billingHistory = [
  { date: "2025-01-15", amount: 24.99, status: "paid", invoice: "INV-2025-0115" },
  { date: "2024-12-15", amount: 24.99, status: "paid", invoice: "INV-2024-1215" },
  { date: "2024-11-15", amount: 24.99, status: "paid", invoice: "INV-2024-1115" },
  { date: "2024-10-15", amount: 24.99, status: "paid", invoice: "INV-2024-1015" },
  { date: "2024-09-15", amount: 24.99, status: "paid", invoice: "INV-2024-0915" },
];

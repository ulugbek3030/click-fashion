import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Минимум 2 символа"),
    email: z.email("Введите корректный email"),
    phone: z.string().optional(),
    password: z.string().min(6, "Минимум 6 символов"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const checkoutContactSchema = z.object({
  name: z.string().min(2, "Введите имя"),
  phone: z.string().min(9, "Введите номер телефона"),
  email: z.email("Введите корректный email").optional().or(z.literal("")),
});

export const checkoutDeliverySchema = z.discriminatedUnion("deliveryType", [
  z.object({
    deliveryType: z.literal("COURIER"),
    city: z.string().min(1, "Выберите город"),
    address: z.string().min(5, "Введите адрес"),
  }),
  z.object({
    deliveryType: z.literal("PICKUP"),
    pickupPointId: z.string().min(1, "Выберите пункт самовывоза"),
  }),
]);

export const promoCodeSchema = z.object({
  code: z.string().min(1, "Введите промокод"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CheckoutContactInput = z.infer<typeof checkoutContactSchema>;
export type CheckoutDeliveryInput = z.infer<typeof checkoutDeliverySchema>;

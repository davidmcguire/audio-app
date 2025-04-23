import { z } from 'zod';

// User registration validation
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Audio request validation
export const audioRequestSchema = z.object({
  requestDetails: z.string()
    .min(10, 'Request details must be at least 10 characters')
    .max(1000, 'Request details must not exceed 1000 characters'),
  occasion: z.string().optional(),
  forWhom: z.string().optional(),
  pronunciation: z.string().optional(),
  isPublic: z.boolean().optional(),
  paymentMethod: z.enum(['stripe', 'paypal'], {
    required_error: 'Please select a payment method',
  }),
});

// Message validation
export const messageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message must not exceed 5000 characters'),
});

// Pricing option validation
export const pricingOptionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  price: z.number().min(0, 'Price must be positive'),
  type: z.enum(['personal', 'business'], {
    required_error: 'Please select a pricing type',
  }),
  deliveryTime: z.number().min(1, 'Delivery time must be at least 1 day'),
  isActive: z.boolean().optional(),
}); 
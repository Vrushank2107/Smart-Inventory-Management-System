import { z } from 'zod';

export const CartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100')
});

export const CalculateRequestSchema = z.object({
  cartItems: z.array(CartItemSchema).min(1, 'At least one cart item is required').max(50, 'Too many items in cart'),
  userType: z.enum(['NORMAL', 'SILVER', 'GOLD'], {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return { message: 'User type must be NORMAL, SILVER, or GOLD' };
      }
      return { message: ctx.defaultError };
    }
  })
});

export const ProductQuerySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10),
  category: z.string().optional(),
  search: z.string().optional()
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password cannot exceed 100 characters'),
  type: z.enum(['NORMAL', 'SILVER', 'GOLD']).optional().default('NORMAL')
});

export const RegisterWithConfirmSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password cannot exceed 100 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  type: z.enum(['NORMAL', 'SILVER', 'GOLD']).optional().default('NORMAL')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const CartUpdateSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(0, 'Quantity must be at least 0').max(100, 'Quantity cannot exceed 100')
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  timestamp: z.string(),
  path: z.string().optional()
});

export function validateRequest(schema, data) {
  try {
    if (data === null || data === undefined) {
      return { success: false, error: 'No data provided' };
    }
    return { success: true, data: schema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = Array.isArray(error.issues) ? error.issues : (Array.isArray(error.errors) ? error.errors : []);
      if (!Array.isArray(issues) || issues.length === 0) {
        return { success: false, error: 'Validation failed' };
      }
      return {
        success: false,
        error: issues.map(err => ({
          field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
          message: err.message || 'Invalid value'
        }))
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}

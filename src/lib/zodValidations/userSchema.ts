import { z } from 'zod';

export const profileUpdateSchema = z.object({
	bio: z.string().max(500).optional(),
	githubUsername: z.string().max(39).optional(),
	discord: z.string().max(32).optional(),
	image: z.string().url().optional(),
	skills: z.record(z.string()).optional()
});

// Define the schema for address
export const addressSchema = z.object({
	'street-address': z.string().min(1, 'Street address is required'),
	locality: z.string().min(1, 'City is required'),
	'postal-code': z.string().min(1, 'Postal code is required'),
	'country-name': z.string().min(1, 'Country is required')
});

// Define the schema for the entire form
export const schema = z.object({
	email: z.string().email('Invalid email address'),
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	businessName: z.string().min(1, 'Business name is required'),
	phone: z.string().min(10, 'Phone number must be at least 10 digits'),
	address: addressSchema,
	taxRegistration: z.string().min(1, 'Tax registration number is required')
});

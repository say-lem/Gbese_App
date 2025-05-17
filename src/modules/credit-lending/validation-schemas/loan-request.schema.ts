import { z } from "zod";


export const NewLoanRequestSchema = z.object({
    amount: z.string({
        required_error:"Field is required"
    }).transform(Number).refine((value) => Number.isInteger(value) && value > 1000, {
        message: "Invalid amount. Minimum accepted amount to borrow is 1000"
    }),
    term: z.string({
        required_error: "Field is required"
    }).transform(Number).refine((value) => Number.isInteger(value) && value > 0),
    loanOfferId: z.string({
        required_error: "Field is required"
    }).regex(/^[0-9a-fA-F]{24}$/, "Invalid loanOfferId. Please verify Id"),
    purpose: z.string({
        required_error:"Field is required",
    })
    .min(10, "purpose length is too short")
    .max(20, "purpose length is too long")

}).strict({
    message: "Invalid field data found in object. Please only input valid fields only"
});

export const NoteQuerySchema = z.object({
	page: z.string().optional().transform(Number)
		.refine((value) => Number.isInteger(value) && value > 0, {
			message: "page must be a positive whole number or a non fractional number",
		}).default("1"),
	limit: z.string().optional().transform(Number)
		.refine((value) => Number.isInteger(value) && value > 0, {
			message: "limit must be a positive number or a non fractional number",
		}).default("10")
}).strict({
	message: "Invalid query parameters detected",
});
import { Model } from "mongoose";

/**
 * Performs pagination on a Mongoose model query
 * @template T - The document type of the model
 * @param {Model<T>} model - The Mongoose model to query
 * @param {number} page - The current page number (1-based)
 * @param {number} limit - The number of items per page
 * @param {Record<string, any>} [query={}] - Optional query parameters for filtering
 * @returns {Promise<{
*   total: number,
*  page: number,
* limit: number,
* totalPages: number,
* data: T[]
* }>} Pagination result object containing:
* - total: Total number of documents matching the query
* - page: Current page number
* - limit: Number of items per page
* - totalPages: Total number of pages
* - data: Array of documents for the current page
*/
export const paginate = async <T>(
   model: Model<T>,
   page: number,
   limit: number,
   query: Record<string, any> = {}
): Promise<{
   total: number;
   page: number;
   limit: number;
   totalPages: number;
   data: T[];
}> => {
   const skip = (page - 1) * limit;
   const data = await model.find(query).skip(skip).limit(limit).exec();
   const total = await model.countDocuments(query).exec();

   return { total, page, limit, totalPages: Math.ceil(total / limit), data };
};
import { drugData, drugCategory } from '../resources/resource.js';


const categoryArray = Object.values(drugCategory);

export const getCategories = () => {

   const categoriesWithCounts = [];
   
   for (const category of categoryArray) {
      const count = drugData.filter(drug => 
         drug.categories.includes(category.id)
      ).length;
      
      categoriesWithCounts.push({
         id: category.id,
         name: category.name,
         description: category.description,
         count
      });
   }
   
   return categoriesWithCounts;
};

export const getDrugsByCategory = (categoryId) => {
   return drugData.filter(drug => drug.categories.includes(categoryId));
};

export const getDrugById = (id) => {
   return drugData.find(drug => drug.id === id);
};

export { drugData, categoryArray };

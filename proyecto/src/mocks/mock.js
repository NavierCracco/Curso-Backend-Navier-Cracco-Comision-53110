import { faker } from "@faker-js/faker";

export const generateMockProduct = () => {
  return {
    _id: faker.string.uuid(),
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    code: faker.string.numeric(8),
    price: faker.commerce.price(),
    status: true,
    stock: faker.number.int({ min: 1, max: 100 }),
    category: faker.commerce.department(),
    thumbnail: faker.image.url(),
    quantity: 1,
  };
};

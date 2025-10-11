import type { NextApiRequest, NextApiResponse } from "next";
import Parse from "../../lib/parseClient";

export default async function handler(
  _req: NextApiRequest, // prefix underscore to silence no-unused-vars
  res: NextApiResponse
) {
  const brands = ["Toyota", "Honda", "Nissan", "Mazda", "BMW", "Mercedes-Benz"];

  for (const b of brands) {
    const Brand = Parse.Object.extend("Brand");
    const brand = new Brand();
    brand.set("name", b);
    await brand.save();
    console.log(`Brand created: ${b}`);
  }


  console.log("✅ Seeding finished");
}

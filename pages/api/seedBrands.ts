import type { NextApiRequest, NextApiResponse } from "next";
import Parse from "../../lib/parseClient";

export default async function handler(
  req: NextApiRequest,
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

  const toyotaSeries = ["Corolla", "Camry", "RAV4"];
  for (const s of toyotaSeries) {
    const Series = Parse.Object.extend("Series");
    const series = new Series();
    series.set("name", s);
    series.set("brand", "Toyota"); // optional, link back to brand
    await series.save();
    console.log(`Series created: ${s}`);
  }

  console.log("✅ Seeding finished");
}

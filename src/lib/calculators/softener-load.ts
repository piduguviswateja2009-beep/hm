import { z } from "zod";

export const softenerLoadSchema=z.object({
  dailyWaterLitres:z.coerce.number().finite().min(1).max(1_000_000),
  hardnessMgL:z.coerce.number().finite().min(0).max(5_000),
});

export function estimateHardnessLoadKgPerDay(input:{dailyWaterLitres:number;hardnessMgL:number}){
  const values=softenerLoadSchema.parse(input);
  return values.dailyWaterLitres*values.hardnessMgL/1_000_000;
}

import { describe, expect, it } from "vitest";
import { estimateHardnessLoadKgPerDay, softenerLoadSchema } from "./softener-load";

describe("indicative hardness-load estimator",()=>{
  it("converts daily volume and hardness into kg/day as CaCO3",()=>{
    expect(estimateHardnessLoadKgPerDay({dailyWaterLitres:10000,hardnessMgL:250})).toBe(2.5);
  });
  it("rejects out-of-range inputs",()=>{
    expect(softenerLoadSchema.safeParse({dailyWaterLitres:0,hardnessMgL:250}).success).toBe(false);
    expect(softenerLoadSchema.safeParse({dailyWaterLitres:1000,hardnessMgL:5001}).success).toBe(false);
  });
});

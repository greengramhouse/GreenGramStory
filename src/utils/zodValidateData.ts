import z, { ZodType } from "zod";

export const registerUserSchema = z.object({
  name: z.string().trim().min(3, "ชื่อต้องมากกว่า 3 อักขระ"),
  
  // 1. แก้ไข Email Syntax
  email: z.string().email("รูปแบบ email ไม่ถูกต้อง"), 
  
  password: z.string()
    .min(6, "password ต้องมีอักขระตั้งแต่ 6 ตัว")
    .max(15, "password ไม่เกิน 15 อักขระ"),
    
  confirmPassword: z.string()
    .min(6, "confirmPassword ต้องมีอักขระตั้งแต่ 6 ตัว")
    .max(15, "confirmPassword ไม่เกิน 15 อักขระ")
})
// 2. ใช้ .refine เพื่อตรวจสอบว่า password ตรงกันหรือไม่
.refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"], // กำหนดให้ Error ไปแสดงที่ field confirmPassword
});

export const loginUserSchema = z.object({
  // 1. แก้ไข Email Syntax
  email: z.string().email("รูปแบบ email ไม่ถูกต้อง"), 
  
  password: z.string()
    .min(3, "password ต้องมีอักขระตั้งแต่ 3 ตัว")
})



// extract the inferred type
export type RegisterType = z.infer<typeof registerUserSchema>;

export const zodValidateData = <T>(
  schema: ZodType<T>, 
  data: unknown // ใช้ unknown เพราะเราจะให้ schema เป็นตัวตรวจ data เอง
) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors
    };
  }
  
  return {
    success: true,
    data: result.data as T, // คืนค่า data ที่ผ่านการ parse แล้วเป็น Type T
  };
};
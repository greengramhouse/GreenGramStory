import Hero from "@/components/hero";
import { getUser } from "@/lib/dal";

export default async function HomePage() {
  const user = await getUser();
  if(user){
    console.log(user)
  }
  // ปุ่มพาไป /blog เสมอ เข้าได้โดยไม่ต้อง login
  const linkDestination = "/blog";
  const buttonLabel = user ? "อ่านบทความของฉัน" : "เริ่มต้นใช้งาน";

  return (
    <main>
      <Hero
        version="gukkghu Block v.01"
        title={`ยินดีต้อนรับคุณ ${user ? user.name : ""} สู่ Block Gukkghu`}
        pretitle="คลังสะสมผลงาน Web Developer สาย Full Stack..."
        
        // ✅ ใช้ตัวแปรที่เตรียมไว้
        btnLink={linkDestination} 
        btnText={buttonLabel} // ส่งข้อความปุ่มไปด้วย (ต้องไปแก้ใน Hero ด้วยนะ)
        
        btnsecondary={false}
      />
    </main>
  );
}
import { GlassmorphismPortfolioBlock } from "@/components/glassmorphism-portfolio-block-shadcnui";
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
      <GlassmorphismPortfolioBlock
        badgeText="gukkghu Block v.01"
        title={`ยินดีต้อนรับคุณ ${user ? user.name : ""} สู่ Block Gukkghu`}
        description="คลังสะสมผลงาน Web Developer สาย Full Stack... ผมพร้อมรับงาน Freelance และสร้างสรรค์ Web Application ที่ใช้งานได้จริง"
        ctaLink={linkDestination}
        ctaText={buttonLabel}
      />
    </main>
  );
}
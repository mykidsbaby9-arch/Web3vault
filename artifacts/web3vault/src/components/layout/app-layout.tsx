import { TopNav } from "@/components/shared/top-nav"
import { SideNav } from "@/components/shared/side-nav"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0B1220] text-white">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <SideNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative isolate">
          <div className="absolute top-0 left-0 w-[50vw] h-[50vh] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="absolute bottom-0 right-0 w-[50vw] h-[50vh] bg-secondary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

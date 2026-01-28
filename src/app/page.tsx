export default function Home() {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          欢迎使用 Dev Tools Hub
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
          这是一个为开发者打造的轻量在线工具集。首个版本专注于 JSON
          格式化与校验，后续将持续扩展更多常用调试工具。
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm sm:p-5">
        <p className="text-sm text-slate-700">
          JSON 工具页面、工具列表与统计功能会在后续开发阶段逐步完善。当前阶段主要完成了全局布局骨架和设计系统基础配置。
        </p>
      </section>
    </div>
  );
}

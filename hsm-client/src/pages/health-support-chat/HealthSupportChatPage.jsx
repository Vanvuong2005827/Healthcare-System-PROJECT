import HealthSupportChat from "../../components/health-support-chat/HealthSupportChat";
import Sidebar from "../../components/sidebar/PatientSidebar";
import Navbar from "../../components/navbar/Navbar";

const HealthSupportChatPage = () => {
  const overviewCards = [
    {
      title: "Fast answers",
      value: "24/7",
      description: "Ask about symptoms, measurements, or follow-up actions.",
    },
    {
      title: "Personal context",
      value: "Profile-aware",
      description: "Responses can reference the health data already in your account.",
    },
    {
      title: "Safe usage",
      value: "Assistive only",
      description: "Use it for support, not as a replacement for direct medical care.",
    },
  ];

  const suggestedPrompts = [
    "Huyết áp gần đây của tôi có ổn không?",
    "BMI của tôi đang ở mức nào?",
    "Tôi nên cải thiện giấc ngủ như thế nào?",
    "Có lưu ý nào từ dữ liệu sức khỏe của tôi không?",
  ];

  const guidanceItems = [
    "Đặt câu hỏi ngắn, rõ ràng để AI phản hồi chính xác hơn.",
    "Nếu có chỉ số bất thường kéo dài, hãy liên hệ bác sĩ thay vì chỉ hỏi chatbot.",
    "Nên dùng chat này để xem nhanh xu hướng sức khỏe, chế độ sinh hoạt và bước tiếp theo.",
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 px-4 py-4 md:px-6">
        <Navbar />

        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  AI Health Support
                </span>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  Trợ lý sức khỏe AI
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Nhận tư vấn sơ bộ dựa trên câu hỏi của bạn và dữ liệu đã lưu
                  trong hệ thống. Giao diện được tối giản để tập trung vào nội
                  dung, giảm bớt cảm giác rối và màu sắc thừa.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:w-[440px]">
                {overviewCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {card.title}
                    </p>
                    <p className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                      {card.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <HealthSupportChat />

            <aside className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  Suggested prompts
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use specific questions to get more useful responses.
                </p>

                <div className="mt-4 space-y-2">
                  {suggestedPrompts.map((prompt) => (
                    <div
                      key={prompt}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                    >
                      {prompt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  Usage notes
                </h2>
                <div className="mt-4 space-y-3">
                  {guidanceItems.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
};

export default HealthSupportChatPage;

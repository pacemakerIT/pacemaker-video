export default function PaymentSummary() {
  return (
    <aside className="w-80 border-l p-10 pt-20">
      <h2 className="text-pace-lg text-pace-gray-700 font-bold mb-4">
        예상 결제 금액
      </h2>
      <ul className="text-pace-base text-pace-gray-700 space-y-4 mb-6 pb-6 border-b border-pace-gray-700">
        <li className="flex justify-between">
          <span className="text-[#6B7280]">소계 (3개의 강의)</span>
          <span>$264.97</span>
        </li>
        <li className="flex justify-between">
          <span className="text-[#6B7280]">할인 금액</span>
          <span>-$20.00</span>
        </li>
        <li className="flex justify-between">
          <span className="text-[#6B7280]">세금</span>
          <span>$24.49</span>
        </li>
      </ul>
      <div className="flex justify-between items-center font-semibold text-pace-lg mb-6">
        <span className="text-pace-gray-700">총 결제 금액</span>
        <span className="font-bold text-[#E86642]">$260.46</span>
      </div>
      <div className="w-60 h-[37px] flex gap-1 mb-6 text-pace-sm">
        <input
          type="text"
          placeholder="프로모션 코드 입력"
          className="flex-1 min-w-0 px-3 py-1 placeholder-[#757575] rounded-full border border-[#EEEEEE]"
        />
        <button className="w-[57px] px-3 py-1 text-pace-gray-700 rounded-full border border-[#EEEEEE]">
          등록
        </button>
      </div>
      <button className="w-full bg-pace-orange-800 hover:bg-orange-600 text-white font-bold py-3 rounded-full">
        결제하기
      </button>
    </aside>
  );
}

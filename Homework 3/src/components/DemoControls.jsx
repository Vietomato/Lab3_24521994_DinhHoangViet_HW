import { useId } from 'react';

export default function DemoControls({ scenario, onScenarioChange, onReset, sessionVersion }) {
  const scenarioId = useId();
  const helpId = useId();
  return (
    <>
      <p id={helpId}>
        Các điều khiển này mô phỏng kết quả máy chủ, không gửi yêu cầu đến PUBG.
        Kịch bản được giữ nguyên khi mỗi yêu cầu bắt đầu; thay đổi lựa chọn chỉ áp dụng cho yêu cầu tiếp theo.
        Reset Demo tạo thời gian và kho mới, hủy yêu cầu cũ và xóa thông báo nhận vật phẩm; giữ lựa chọn kịch bản hiện tại.
      </p>
      <div className="demo-controls">
        <label htmlFor={scenarioId}>Kịch bản nhận mô phỏng</label>
        <select id={scenarioId} value={scenario} aria-describedby={helpId}
          onChange={(event) => onScenarioChange(event.target.value)}>
          <option value="success">Success — Thành công</option>
          <option value="conflict">409 Conflict — Tranh chấp kho</option>
          <option value="network-error">Network error — Lỗi mạng</option>
        </select>
        <button type="button" onClick={onReset} aria-describedby={helpId}>Reset Demo — Đặt lại phiên</button>
      </div>
      <p role="status" aria-live="polite" aria-atomic="true">
        {sessionVersion > 0 ? `Đã tạo phiên demo mới (${sessionVersion + 1}). Các yêu cầu và thông báo cũ đã được xóa.` : ''}
      </p>
    </>
  );
}

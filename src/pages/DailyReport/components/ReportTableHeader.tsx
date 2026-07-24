export default function ReportTableHeader() {
  return (
    <thead>
      <tr>
        <th rowSpan={3}>Đơn vị</th>
        <th rowSpan={3}>
          Tổng quân <br />
          số
        </th>
        <th rowSpan={3}>Hiện diện</th>
        <th rowSpan={3}>Tổng vắng</th>
        <th colSpan={14}>Quân số vắng</th>
        <th rowSpan={3}>Trạng thái</th>
        <th rowSpan={3}>Ký số</th>
        <th rowSpan={3}>Ghi chú</th>
        <th rowSpan={3}>Thao tác</th>
      </tr>
      <tr>
        <th colSpan={2}>Hội thao</th>
        <th colSpan={2}>Xây dựng</th>
        <th rowSpan={2}>Chờ hưu</th>
        <th rowSpan={2}>Nghỉ tranh thủ</th>
        <th rowSpan={2}>Phép</th>
        <th colSpan={2}>Viện</th>
        <th colSpan={2}>Công tác</th>
        <th colSpan={2}>Học</th>
        <th rowSpan={2}>Lý do khác</th>
      </tr>
      <tr>
        <th>Ngoài Sư đoàn</th>
        <th>Trung đoàn, Sư đoàn</th>
        <th>Ngoài Sư đoàn</th>
        <th>Trung đoàn, Sư đoàn</th>
        <th>Ngoài Sư đoàn</th>
        <th>Trung đoàn, Sư đoàn</th>
        <th>Ngoài Sư đoàn</th>
        <th>Sư đoàn</th>
        <th>SQ</th>
        <th>CS</th>
      </tr>
    </thead>
  );
}

export const PROVINCES: string[] = [
  "An Giang",
  "Bắc Ninh",
  "Cà Mau",
  "Cao Bằng",
  "Cần Thơ",
  "Đà Nẵng",
  "Đắk Lắk",
  "Đồng Nai",
  "Đồng Tháp",
  "Điện Biên",
  "Gia Lai",
  "Hà Nội",
  "Hà Tĩnh",
  "Hải Phòng",
  "Hưng Yên",
  "Huế",
  "Khánh Hòa",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sơn La",
  "Tây Ninh",
  "Thái Nguyên",
  "Thanh Hóa",
  "Tuyên Quang",
  "Vĩnh Long",
  "Hồ Chí Minh",
];

export function generateMatKhau(): string {
  const first = Math.floor(Math.random() * PROVINCES.length);
  let second = Math.floor(Math.random() * PROVINCES.length);
  while (second === first) {
    second = Math.floor(Math.random() * PROVINCES.length);
  }
  return `${PROVINCES[first]} - ${PROVINCES[second]}`;
}

import json  
import random  
import requests  
  
BASE_URL = "http://192.168.2.46:8080/api"      # đổi theo môi trường demo  
USERNAME = "c8_d8"  
PASSWORD = "1"  
MA_DON_VI = "GS003.003.006.004"                    # maDonVi đơn vị đang đăng nhập  
NGAY_BAO_CAO = "2026-07-19"                # ngày báo cáo (YYYY-MM-DD)  
TONG_QUAN_SO = 107                 # tổng quân số biên chế của đơn vị  
SO_VANG = 20
  
# --- Cặp cấp bậc -> danh sách chức vụ hợp lệ ---  
# Chiến sĩ / Hạ sĩ quan  
CS_HSQ = {  
    # "Binh nhì":   ["Chiến sĩ"],  
    # "Binh nhất":  ["Chiến sĩ"],  
    # "Hạ sĩ":      ["Chiến sĩ", "Tiểu đội trưởng"],  
    # "Trung sĩ":   ["Tiểu đội trưởng"],  
    # "Thượng sĩ":  ["Tiểu đội trưởng"],  
    "Hạ sĩ":      ["Chiến sĩ"],  
    "Trung sĩ":   ["Chiến sĩ"],  
}  
  
# Sĩ quan  
# SI_QUAN = {  
#     "Thiếu úy":   ["Trung đội trưởng"],  
#     "Trung úy":   ["Trung đội trưởng", "Phó đại đội trưởng"],  
#     "Thượng úy":  ["Phó đại đội trưởng", "Đại đội trưởng"],  
#     "Đại úy":     ["Đại đội trưởng", "Chính trị viên"],  
#     "Thiếu tá":   ["Phó tiểu đoàn trưởng", "Chính trị viên"],  
#     "Trung tá":   ["Tiểu đoàn trưởng"],  
#     "Thượng tá":  ["Phó trung đoàn trưởng"],  
#     "Đại tá":     ["Trung đoàn trưởng"],  
# }  
  
# Quân nhân chuyên nghiệp (QNCN)  
# QNCN = {  
#     "Thiếu úy QNCN":  ["Nhân viên"],  
#     "Trung úy QNCN":  ["Nhân viên"],  
#     "Thượng úy QNCN": ["Nhân viên", "Kỹ thuật viên"],  
#     "Đại úy QNCN":    ["Kỹ thuật viên", "Trợ lý"],  
#     "Thiếu tá QNCN":  ["Trợ lý"],  
#     "Trung tá QNCN":  ["Trợ lý"],  
#     "Thượng tá QNCN": ["Trợ lý"],  
# }  
  
#   RANK_POSITION = {**CS_HSQ, **SI_QUAN, **QNCN}  
RANK_POSITION = {**CS_HSQ}  
RANKS = list(RANK_POSITION.keys())  
  
# Lý do vắng: key phải thuộc VangChiTiet  
LY_DO_KEYS = [  
    "congTacSuDoan"
]  
  
HO = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "Đinh", "Phan", "Võ", "Trương", "Đoàn", "Nguyễn", "Bùi"]
TEN_DEM = ["Văn", "Hữu", "Đức", "Công", "Quang", "Minh", "Thanh", "Xuân"]  
TEN = ["An", "Bình", "Cường", "Dũng", "Hùng", "Khoa", "Long", "Minh", "Nam", "Phong", "Quang", "Thắng", "Tuấn", "Tùng", "Việt", "Khánh", "Đức", "Thành", "Hải", "Huy"]
  
def random_name():  
    return f"{random.choice(HO)} {random.choice(TEN_DEM)} {random.choice(TEN)}"  
  
def build_absent_rows(n):  
    rows = []  
    for i in range(n):  
        rank = random.choice(RANKS)  
        position = random.choice(RANK_POSITION[rank])  
        rows.append({  
            "id": f"gen-{i+1}",  
            "hoTen": random_name(),  
            "capBac": rank,  
            "chucVu": position,  
            "lyDoVang": random.choice(LY_DO_KEYS),  
            "ghiChu": "",  
        })  
    return rows  
  
def build_thong_tin_vang(rows):  
    agg = {k: 0 for k in [  
        "hoiThaiNgoaiSuDoan", "hoiThaiEF", "xayDungNgoaiSuDoan", "xayDungEF",  
        "choHuu", "nghiTranhThu", "phep", "vienNgoaiSuDoan", "vienEF",  
        "congTacNgoaiSuDoan", "congTacSuDoan", "hocSQ", "hocCS", "lyDoVangKhac",  
    ]}  
    for r in rows:  
        if r["lyDoVang"] in agg:  
            agg[r["lyDoVang"]] += 1  
    return agg  
  
def login():  
    res = requests.post(f"{BASE_URL}/auth/login",  
                        json={"userName": USERNAME, "password": PASSWORD})  
    res.raise_for_status()  
    return res.json()["Result"]["token"] 
  
def main():  
    token = login()  
    rows = build_absent_rows(SO_VANG)  
    thong_tin_vang = build_thong_tin_vang(rows)  
  
    payload = {  
        "quanSoTong": TONG_QUAN_SO,  
        "quanSoHienDien": TONG_QUAN_SO - SO_VANG,  
        "quanSoVang": SO_VANG,  
        "thoiGianBaoCao": f"{NGAY_BAO_CAO}T12:00:00.000Z",  
        "chiTietVang": json.dumps(rows, ensure_ascii=False),  
        "thongTinVang": json.dumps(thong_tin_vang, ensure_ascii=False),  
        "donVi": MA_DON_VI,  
        "trucBanChiHuy": json.dumps({}, ensure_ascii=False),  
        "trucBanTacChien": json.dumps({}, ensure_ascii=False),  
        "tinhHinhHoatDong": json.dumps({}, ensure_ascii=False),  
    }  
  
    res = requests.post(f"{BASE_URL}/donbaocao", json=payload,  
                        headers={"Authorization": f"Bearer {token}"})  
    print(res.status_code, res.text)  
  
if __name__ == "__main__":  
    main()
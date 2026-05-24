import "./login.css";

export default function Login() {
  return (
    <div className="login-container">
      <div className="login-left">
        <div className="overlay"></div>

        <div className="left-content">
          <h1>SƯ ĐOÀN 5</h1>

          <div className="line"></div>

          <h2>
            PHẦN MỀM CÔNG NGHỆ SỐ
            <br />
            CÔNG TÁC THAM MƯU HUẤN LUYỆN
          </h2>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <div className="logo-area">
            <img
              src="/logo-su5.png"
              alt="Logo"
              className="logo"
            />
          </div>

          <h1>ĐĂNG NHẬP</h1>

          <form className="login-form">
            <div className="form-group">
              <label>Tên đăng nhập</label>

              <input
                type="text"
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>

              <input
                type="password"
                placeholder="Nhập mật khẩu"
              />
            </div>

            <button
              type="submit"
              className="login-btn"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
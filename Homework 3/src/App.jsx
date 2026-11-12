export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">Đến nội dung chính</a>
      <header className="site-header">
        <div className="container">
          <p className="eyebrow">Bản demo cộng đồng</p>
          <h1>PUBG Vietnam Airdrop Arena</h1>
          <p>Khám phá vé sự kiện, G-Coin và hoạt động của các đội tuyển.</p>
        </div>
      </header>
      <main id="main-content" className="container" tabIndex={-1}>
        <p className="demo-notice">
          Đây là bản demo cục bộ với dữ liệu mô phỏng, không có liên kết chính thức
          với PUBG. Không có giao dịch thật hoặc kết quả esports trực tiếp.
        </p>
        <section aria-labelledby="drops-heading">
          <h2 id="drops-heading">Airdrop vé &amp; G-Coin</h2>
          <p>Khu vực airdrop đang được chuẩn bị. Chức năng nhận vật phẩm chưa được kết nối.</p>
        </section>
        <section aria-labelledby="standings-heading">
          <h2 id="standings-heading">Bảng xếp hạng đội tuyển</h2>
          <p>Bảng xếp hạng mô phỏng sẽ xuất hiện tại đây.</p>
        </section>
        <section aria-labelledby="feed-heading">
          <h2 id="feed-heading">Kill feed mô phỏng</h2>
          <p>Các sự kiện demo sẽ xuất hiện tại đây.</p>
        </section>
      </main>
      <footer className="container site-footer">
        <p>PUBG Vietnam Airdrop Arena · Demo</p>
      </footer>
    </>
  );
}

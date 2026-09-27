import "./LoadingPage.css";

export default function LoadingPage() {
  return (
    <main className="loading-page">
      <div className="loading-page__content">
        <div className="loading-page__logo">
          T
        </div>

        <h1 className="loading-page__title">
          TechWitter
        </h1>

        <div className="loading-page__spinner" />

        <p className="loading-page__text">
          Loading...
        </p>
      </div>
    </main>
  );
}

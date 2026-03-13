export default function Header() {
  return (
    <header className="app-header">
      <div className="logo">
        <svg
          className="logo-icon"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="8"
            y="12"
            width="32"
            height="24"
            rx="3"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <rect
            x="40"
            y="18"
            width="4"
            height="12"
            rx="1"
            fill="currentColor"
          />
          <rect
            x="14"
            y="18"
            width="6"
            height="12"
            rx="1"
            fill="currentColor"
            className="cell-fill"
          />
          <rect
            x="22"
            y="18"
            width="6"
            height="12"
            rx="1"
            fill="currentColor"
            className="cell-fill"
          />
          <rect
            x="30"
            y="18"
            width="6"
            height="12"
            rx="1"
            fill="currentColor"
            className="cell-fill"
          />
        </svg>
        <h1>LionCell Configurator</h1>
      </div>
      <p className="tagline">Optimize your Li-ion battery pack configuration</p>
    </header>
  );
}

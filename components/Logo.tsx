export default function Logo() {
  return (
    <div>
      <div className="flex items-center gap-3 w-[175px] rounded-lg bg-gradient-to-r from-gray-400 to-gray-150 ">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="10" y="12" width="24" height="28" rx="2" fill="#000000" />
          <rect x="14" y="8" width="24" height="28" rx="2" fill="#333333" />
          <rect x="18" y="4" width="24" height="28" rx="2" fill="#595959" />
          <line
            x1="22"
            y1="10"
            x2="38"
            y2="10"
            stroke="white"
            strokeWidth="1.5"
          />
          <line
            x1="22"
            y1="15"
            x2="34"
            y2="15"
            stroke="white"
            strokeWidth="1.5"
          />
          <line
            x1="22"
            y1="20"
            x2="36"
            y2="20"
            stroke="white"
            strokeWidth="1.5"
          />
        </svg>
        <span className="text-2xl font-semibold text-gradient-to-r from-gray-150 to-gray-400">
          Workflo
        </span>
      </div>
    </div>
  );
}